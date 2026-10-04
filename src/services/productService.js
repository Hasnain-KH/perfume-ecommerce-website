import { collection, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';

const fallbackImage = 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80';
let productsRequest;

const normalizeProduct = (item = {}) => {
    const product = { ...item };
    product.id = String(product.id || product.slug || product.sku || 'product');
    product.slug = product.slug || product.id;
    product.name = product.name || 'Unnamed Product';
    product.brand = product.brand || 'Maison Élan';
    product.category = product.category || 'unisex';
    product.gender = product.gender || 'Unisex';
    product.price = Number(product.price) || 0;
    product.compareAtPrice = Number(product.compareAtPrice) || product.price;
    product.discount = Number(product.discount) || 0;
    product.images = (Array.isArray(product.images) ? product.images : [product.image])
        .filter((image) => typeof image === 'string' && image.trim())
        .map((image) => image.trim());
    if (!product.images.length) product.images = [fallbackImage];
    product.topNotes = Array.isArray(product.topNotes) ? product.topNotes : [];
    product.heartNotes = Array.isArray(product.heartNotes) ? product.heartNotes : [];
    product.baseNotes = Array.isArray(product.baseNotes) ? product.baseNotes : [];
    product.notes = Array.isArray(product.notes) ? product.notes : [];
    product.available = product.available !== false;
    product.stock = product.stock == null || product.stock === '' ? null : Math.max(0, Number(product.stock) || 0);
    product.rating = Number(product.rating) || 0;
    product.reviewCount = Number(product.reviewCount) || 0;
    return product;
};

export async function getProducts() {
    if (!isFirebaseConfigured || !db) {
        throw new Error('The fragrance catalog is unavailable until Firebase is configured.');
    }

    if (!productsRequest) {
        productsRequest = getDocs(collection(db, 'products'))
            .then((snapshot) => snapshot.docs.map((doc) => normalizeProduct({ ...doc.data(), id: doc.id })))
            .catch((error) => {
                productsRequest = undefined;
                console.error('Failed to load products from Firestore.', error);
                throw new Error('We could not load the fragrance collection. Please try again.', { cause: error });
            });
    }

    return productsRequest;
}

export async function getProductById(productId) {
    const products = await getProducts();
    return products.find((product) => product.id === String(productId) || product.slug === String(productId)) || null;
}

export async function getProductBySlug(slug) {
    const products = await getProducts();
    return products.find((product) => product.slug === slug || product.id === slug) || null;
}

export async function getBestSellers() {
    const products = await getProducts();
    return products.filter((product) => product.isBestSeller).slice(0, 8);
}

export async function getNewArrivals() {
    const products = await getProducts();
    return products.filter((product) => product.isNew).slice(0, 8);
}

export async function searchProducts(term) {
    const queryValue = String(term || '').trim().toLowerCase();
    const products = await getProducts();

    if (!queryValue) return products;

    return products.filter((product) => {
        const searchable = [
            product.name,
            product.brand,
            product.category,
            product.gender,
            product.fragranceFamily,
            ...(product.notes || []),
            ...(product.topNotes || []),
            ...(product.heartNotes || []),
            ...(product.baseNotes || []),
        ]
            .join(' ')
            .toLowerCase();

        return searchable.includes(queryValue);
    });
}

export function filterProducts(products, filters = {}) {
    const { query: queryValue = '', category = 'all', gender = 'all', brand = 'all', minPrice = '', maxPrice = '', notes = 'all', occasion = 'all', sort = 'featured' } = filters;
    const normalizedQuery = String(queryValue || '').trim().toLowerCase();
    const normalizedNotes = String(notes).toLowerCase();
    const normalizedOccasion = String(occasion).toLowerCase();

    const filtered = [...products].filter((product) => {
        const categoryMatch = category === 'all' || product.category === category;
        const genderMatch = gender === 'all' || String(product.gender || '').toLowerCase() === String(gender).toLowerCase();
        const brandMatch = brand === 'all' || String(product.brand || '').toLowerCase() === String(brand).toLowerCase();
        const priceMatch = (minPrice === '' || Number(product.price) >= Number(minPrice)) && (maxPrice === '' || Number(product.price) <= Number(maxPrice));
        const productNotes = [
            ...(product.notes || []),
            ...(product.topNotes || []),
            ...(product.heartNotes || []),
            ...(product.baseNotes || []),
        ].map((note) => String(note).toLowerCase());
        const notesMatch = notes === 'all' || productNotes.includes(normalizedNotes);
        const occasionMatch = occasion === 'all' || String(product.occasion || '').toLowerCase() === normalizedOccasion;
        const searchMatch =
            !normalizedQuery ||
            [
                product.name,
                product.brand,
                product.category,
                product.gender,
                product.fragranceFamily,
                ...(product.notes || []),
                ...(product.topNotes || []),
                ...(product.heartNotes || []),
                ...(product.baseNotes || []),
            ]
                .join(' ')
                .toLowerCase()
                .includes(normalizedQuery);

        return categoryMatch && genderMatch && brandMatch && priceMatch && notesMatch && occasionMatch && searchMatch;
    });

    switch (sort) {
        case 'price-low':
            return filtered.sort((a, b) => Number(a.price) - Number(b.price));
        case 'price-high':
            return filtered.sort((a, b) => Number(b.price) - Number(a.price));
        case 'rating':
            return filtered.sort((a, b) => Number(b.rating) - Number(a.rating));
        case 'newest':
            return filtered.sort((a, b) => Number(b.isNew) - Number(a.isNew));
        case 'best-selling':
            return filtered.sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller));
        default:
            return filtered.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    }
}

export async function getProductsByCategory(category) {
    const products = await getProducts();
    return category ? products.filter((product) => product.category === category) : products;
}

export async function getFeaturedProducts() {
    const products = await getProducts();
    return products.filter((product) => product.isFeatured);
}

export async function getFirestoreCollection(collectionName) {
    if (!isFirebaseConfigured || !db) {
        return [];
    }

    try {
        const snapshot = await getDocs(collection(db, collectionName));
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Failed to read ${collectionName} collection.`, error);
        return [];
    }
}

export async function getProductsWithQuery(options = {}) {
    const { category, gender, notes } = options;
    const products = await getProducts();

    return products.filter((product) => {
        const matchesCategory = !category || category === 'all' || product.category === category;
        const matchesGender = !gender || gender === 'all' || product.gender === gender;
        const matchesNotes = !notes || notes === 'all' || (product.notes || []).includes(notes);
        return matchesCategory && matchesGender && matchesNotes;
    });
}
