import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';

function buildOrderId() {
    const suffix = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
    return `ORD-${Date.now().toString(36).toUpperCase()}-${suffix.slice(0, 8).toUpperCase()}`;
}

function normalizeOrderPayload(orderPayload) {
    if (!orderPayload || typeof orderPayload !== 'object') {
        throw new Error('Order details are missing. Please review your checkout and try again.');
    }

    const customerFields = ['fullName', 'phone', 'email', 'province', 'city', 'area', 'address'];
    const customer = Object.fromEntries(
        customerFields.map((field) => [field, String(orderPayload.customer?.[field] ?? '').trim()]),
    );
    customer.notes = String(orderPayload.customer?.notes ?? '').trim();

    if (customerFields.some((field) => !customer[field])) {
        throw new Error('Some customer details are missing. Please review your checkout form.');
    }

    if (!Array.isArray(orderPayload.items) || orderPayload.items.length === 0) {
        throw new Error('Your cart has no valid products. Please review your cart and try again.');
    }

    const items = orderPayload.items.map((item) => {
        const productId = String(item?.productId ?? '').trim();
        const name = String(item?.name ?? '').trim();
        const price = Number(item?.price);
        const quantity = Number(item?.quantity);

        if (!productId || !name || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
            throw new Error('A cart item has invalid product, price, or quantity details. Please review your cart.');
        }

        return {
            productId,
            name,
            image: typeof item.image === 'string' ? item.image : '',
            price,
            quantity,
            variant: item.variant == null ? null : String(item.variant),
        };
    });

    const subtotal = Number(orderPayload.subtotal);
    const shipping = Number(orderPayload.shipping);
    const discount = Number(orderPayload.discount ?? 0);
    const total = Number(orderPayload.total);
    const itemSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (![subtotal, shipping, discount, total].every(Number.isFinite) || [subtotal, shipping, discount, total].some((amount) => amount < 0)) {
        throw new Error('The order totals are invalid. Please review your cart and try again.');
    }

    if (Math.abs(itemSubtotal - subtotal) > 0.01 || Math.abs(subtotal + shipping - discount - total) > 0.01) {
        throw new Error('The order totals no longer match your cart. Please refresh your cart and try again.');
    }

    return {
        customer,
        items,
        subtotal,
        shipping,
        discount,
        total,
        paymentMethod: String(orderPayload.paymentMethod || 'Cash on Delivery'),
    };
}

export async function createOrder(orderPayload) {
    if (!isFirebaseConfigured || !db) {
        throw new Error('Order placement is unavailable until Firebase is configured.');
    }

    const normalizedOrder = normalizeOrderPayload(orderPayload);
    const order = {
        ...normalizedOrder,
        orderId: buildOrderId(),
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
    };

    try {
        const docRef = await addDoc(collection(db, 'orders'), {
            ...order,
            createdAt: serverTimestamp(),
        });

        return { ...order, id: docRef.id };
    } catch (error) {
        console.error('Failed to create order document in Firestore.', error);
        throw new Error('We could not place your order. Please try again.', { cause: error });
    }
}
