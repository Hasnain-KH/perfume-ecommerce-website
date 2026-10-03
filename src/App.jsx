import { useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Filter,
  Gift,
  Heart,
  Lock,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { categoryCards, faqList, fragranceNotes, products, reviews, scentProfiles, siteConfig } from './data/products';
import './App.css';

const formatPrice = (value) => {
  const safeValue = Number(value) || 0;
  return `Rs. ${safeValue.toLocaleString('en-PK')}`;
};

function App() {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!toasts.length) return undefined;
    const timer = setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 2200);
    return () => clearTimeout(timer);
  }, [toasts]);

  const showToast = (message) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message }]);
  };

  const addToCart = (product, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [...current, { id: product.id, quantity, product }];
    });

    setCartOpen(true);
    showToast(`${product.name} added to cart`);
  };

  const removeFromCart = (productId) => {
    setCart((current) => current.filter((item) => item.id !== productId));
  };

  const updateCartQty = (productId, nextQty) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(0, nextQty) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const toggleWishlist = (productId) => {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((item) => item !== productId)
        : [...current, productId],
    );
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = cartSubtotal > 5000 ? 0 : 350;
  const grandTotal = cartSubtotal + shipping;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/men', label: 'Men' },
    { to: '/women', label: 'Women' },
    { to: '/unisex', label: 'Unisex' },
    { to: '/new-arrivals', label: 'New Arrivals' },
    { to: '/best-sellers', label: 'Best Sellers' },
    { to: '/gift-sets', label: 'Gift Sets' },
  ];

  const megaMenuItems = [
    { to: '/men', label: 'Men' },
    { to: '/women', label: 'Women' },
    { to: '/unisex', label: 'Unisex' },
    { to: '/best-sellers', label: 'Best Sellers' },
    { to: '/new-arrivals', label: 'New Arrivals' },
    { to: '/gift-sets', label: 'Gift Sets' },
    { to: '/shop?category=unisex', label: 'Perfume Oils / Attars' },
    { to: '/shop?category=men', label: 'Travel Sizes' },
  ];

  return (
    <BrowserRouter>
      <div className="site-shell">
        <AnnouncementBar items={siteConfig.announcementBar} />
        <Navbar
          brandName={siteConfig.brandName}
          navLinks={navLinks}
          cartCount={cartCount}
          wishlist={wishlist}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenCart={() => setCartOpen(true)}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          megaMenuItems={megaMenuItems}
        />

        <CartDrawer
          cart={cart}
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          onQuantityChange={updateCartQty}
          onRemove={removeFromCart}
          subtotal={cartSubtotal}
          shipping={shipping}
          total={grandTotal}
          onCheckout={() => { setCartOpen(false); window.location.href = '/checkout'; }}
        />

        <SearchModal
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          products={products}
          onSelectProduct={() => setSearchOpen(false)}
        />

        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                products={products}
                notes={fragranceNotes}
                onAddToCart={addToCart}
                wishlist={wishlist}
                onWishlistToggle={toggleWishlist}
                onOpenSearch={() => setSearchOpen(true)}
              />
            }
          />
          <Route
            path="/shop"
            element={
              <ShopPage
                products={products}
                onAddToCart={addToCart}
                wishlist={wishlist}
                onWishlistToggle={toggleWishlist}
              />
            }
          />
          <Route path="/men" element={<ShopPage products={products.filter((p) => p.category === 'men')} onAddToCart={addToCart} wishlist={wishlist} onWishlistToggle={toggleWishlist} />} />
          <Route path="/women" element={<ShopPage products={products.filter((p) => p.category === 'women')} onAddToCart={addToCart} wishlist={wishlist} onWishlistToggle={toggleWishlist} />} />
          <Route path="/unisex" element={<ShopPage products={products.filter((p) => p.category === 'unisex')} onAddToCart={addToCart} wishlist={wishlist} onWishlistToggle={toggleWishlist} />} />
          <Route path="/new-arrivals" element={<ShopPage products={products.filter((product) => product.isNew)} onAddToCart={addToCart} wishlist={wishlist} onWishlistToggle={toggleWishlist} />} />
          <Route path="/best-sellers" element={<ShopPage products={products.filter((product) => product.isBestSeller)} onAddToCart={addToCart} wishlist={wishlist} onWishlistToggle={toggleWishlist} />} />
          <Route path="/gift-sets" element={<ShopPage products={products.filter((product) => product.category === 'unisex')} onAddToCart={addToCart} wishlist={wishlist} onWishlistToggle={toggleWishlist} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/product/:id" element={<ProductPage products={products} onAddToCart={addToCart} wishlist={wishlist} onWishlistToggle={toggleWishlist} />} />
          <Route path="/cart" element={<CartPage cart={cart} onUpdateQty={updateCartQty} onRemove={removeFromCart} onCheckout={() => showToast('Proceed to checkout')} />} />
          <Route path="/checkout" element={<CheckoutPage cart={cart} subtotal={cartSubtotal} shipping={shipping} total={grandTotal} />} />
        </Routes>

        <Footer brandName={siteConfig.brandName} />

        <div className="toast-stack" aria-live="polite" aria-atomic="true">
          {toasts.map((toast) => (
            <div key={toast.id} className="toast-item">
              <Check size={15} />
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      </div>
    </BrowserRouter>
  );
}

function AnnouncementBar({ items }) {
  return (
    <div className="announcement-bar">
      <div className="announcement-track">
        {items.concat(items).map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function Navbar({ brandName, navLinks, cartCount, wishlist, onOpenSearch, onOpenCart, mobileMenuOpen, setMobileMenuOpen, megaMenuItems }) {
  const [hoverShop, setHoverShop] = useState(false);

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main navigation">
        <div className="brand-block">
          <button className="menu-toggle" type="button" aria-label="Open menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu size={18} />
          </button>
          <Link to="/" className="brand-mark" aria-label="Home">
            {brandName}
          </Link>
        </div>

        <div className="main-nav desktop-only">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              {link.label}
            </NavLink>
          ))}

          <div
            className="shop-menu-wrap"
            onMouseEnter={() => setHoverShop(true)}
            onMouseLeave={() => setHoverShop(false)}
          >
            <button type="button" className="shop-toggle nav-link">
              Shop <ChevronDown size={14} />
            </button>
            {hoverShop && (
              <div className="mega-menu" aria-label="Shop categories">
                <div className="mega-column">
                  <h4>Shop</h4>
                  <ul>
                    {megaMenuItems.map((item) => (
                      <li key={item.label}>
                        <Link to={item.to}>{item.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mega-column">
                  <h4>Shop by Notes</h4>
                  <ul>
                    {fragranceNotes.map((note) => (
                      <li key={note}>
                        <Link to={`/shop?notes=${encodeURIComponent(note)}`}>{note}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="nav-actions">
          <button type="button" className="icon-button" aria-label="Search" onClick={onOpenSearch}>
            <Search size={18} />
          </button>
          <button type="button" className="icon-button desktop-only" aria-label="Account">
            <User size={18} />
          </button>
          <button type="button" className="icon-button desktop-only" aria-label="Wishlist">
            <Heart size={18} />
            {wishlist.length > 0 && <span className="pill-count">{wishlist.length}</span>}
          </button>
          <button type="button" className="icon-button cart-button" aria-label="Cart" onClick={onOpenCart}>
            <ShoppingBag size={18} />
            {cartCount > 0 && <span className="pill-count">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-menu-panel">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'mobile-link active' : 'mobile-link')} onClick={() => setMobileMenuOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <Link to="/faq" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>FAQs</Link>
          <Link to="/contact" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
        </div>
      )}
    </header>
  );
}

function SearchModal({ open, onClose, products, onSelectProduct }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products.slice(0, 4);
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalized) ||
        product.brand.toLowerCase().includes(normalized) ||
        product.notes.some((note) => note.toLowerCase().includes(normalized)),
    );
  }, [products, query]);

  const popularSearches = ['Oud', 'Vanilla', 'Dior', "Men's Perfume", "Women's Perfume", 'Gift Sets'];

  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const term = query.trim() || 'all';
    navigate(`/shop?q=${encodeURIComponent(term)}`);
    onClose();
    onSelectProduct();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Search products">
      <div className="search-modal">
        <div className="search-modal-top">
          <span className="eyebrow">Search</span>
          <button type="button" className="icon-button" aria-label="Close search" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="search-form" onSubmit={handleSubmit}>
          <Search size={18} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by scent, note or brand"
            aria-label="Search products"
          />
        </form>

        <div className="search-panels">
          <div>
            <h4>Popular searches</h4>
            <div className="chip-row">
              {popularSearches.map((value) => (
                <button key={value} type="button" className="chip" onClick={() => { setQuery(value); navigate(`/shop?q=${encodeURIComponent(value)}`); onClose(); }}>
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4>Suggested products</h4>
            <div className="search-results">
              {matches.map((product) => (
                <Link key={product.id} to={`/product/${product.slug}`} className="search-result-item" onClick={onClose}>
                  <img src={product.images[0]} alt={product.name} />
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.fragranceFamily}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, open, onClose, onQuantityChange, onRemove, subtotal, shipping, total, onCheckout }) {
  if (!open) return null;

  return (
    <div className="cart-backdrop" onClick={onClose}>
      <aside className="cart-drawer" onClick={(event) => event.stopPropagation()} aria-label="Shopping cart panel">
        <div className="drawer-header">
          <h3>Your Cart</h3>
          <button type="button" className="icon-button" aria-label="Close cart" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={34} />
            <h4>Your cart is empty</h4>
            <p>Browse the collection and add your favourites.</p>
            <Link to="/shop" className="primary-button" onClick={onClose}>Continue Shopping</Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <img src={item.product.images[0]} alt={item.product.name} />
                  <div className="cart-item-meta">
                    <strong>{item.product.name}</strong>
                    <span>{formatPrice(item.product.price)}</span>
                    <div className="quantity-box">
                      <button type="button" aria-label={`Decrease quantity for ${item.product.name}`} onClick={() => onQuantityChange(item.id, item.quantity - 1)}>
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button type="button" aria-label={`Increase quantity for ${item.product.name}`} onClick={() => onQuantityChange(item.id, item.quantity + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button type="button" className="text-button" onClick={() => onRemove(item.id)}>Remove</button>
                </div>
              ))}
            </div>

            <div className="drawer-summary">
              <div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
              <div><span>Shipping</span><strong>{shipping === 0 ? 'Free' : formatPrice(shipping)}</strong></div>
              <div className="grand-total"><span>Total</span><strong>{formatPrice(total)}</strong></div>
            </div>

            <button type="button" className="primary-button wide" onClick={onCheckout}>Checkout</button>
          </>
        )}
      </aside>
    </div>
  );
}

function ProductCard({ product, wishlist, onWishlistToggle, onAddToCart, onQuickView }) {
  const isFavorite = wishlist.includes(product.id);

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img src={product.images[0]} alt={product.name} className="product-image" />
        {product.discount > 0 && <span className="product-badge">-{product.discount}%</span>}
        <button type="button" className={`wishlist-button ${isFavorite ? 'active' : ''}`} aria-label={`Add ${product.name} to wishlist`} onClick={() => onWishlistToggle(product.id)}>
          <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="product-card-body">
        <span className="product-brand">{product.brand}</span>
        <h3>{product.name}</h3>
        <p className="product-family">{product.fragranceFamily}</p>
        <div className="rating-line">
          <Star size={14} fill="currentColor" />
          <span>{product.rating}</span>
          <small>({product.reviewCount})</small>
        </div>
        <div className="price-row">
          <strong>{formatPrice(product.price)}</strong>
          {product.compareAtPrice && <span>{formatPrice(product.compareAtPrice)}</span>}
        </div>
      </div>

      <div className="card-actions">
        <button type="button" className="ghost-button" onClick={() => onQuickView(product)}>Quick View</button>
        <button type="button" className="primary-button" onClick={() => onAddToCart(product)}>
          Add to Cart
        </button>
      </div>
    </article>
  );
}

function SectionHeading({ eyebrow, title, text, align = 'left' }) {
  return (
    <div className={`section-heading ${align}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function TrustStrip() {
  const items = [
    { icon: ShieldCheck, title: '100% Authentic', text: 'Trusted fragrances sourced with care.' },
    { icon: Truck, title: 'Nationwide Delivery', text: 'Shipping across Pakistan with convenience.' },
    { icon: Wallet, title: 'Cash on Delivery', text: 'Flexible payment on eligible orders.' },
    { icon: Lock, title: 'Secure Shopping', text: 'Protected checkout experience.' },
  ];

  return (
    <section className="trust-strip">
      {items.map(({ icon: Icon, title, text }) => (
        <div key={title} className="trust-item">
          <span className="trust-icon"><Icon size={18} /></span>
          <div>
            <h4>{title}</h4>
            <p>{text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

function HomePage({ products, notes, onAddToCart, wishlist, onWishlistToggle, onOpenSearch }) {
  const navigate = useNavigate();
  const bestSellers = products.filter((product) => product.isBestSeller).slice(0, 4);
  const newArrivals = products.filter((product) => product.isNew).slice(0, 4);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  return (
    <main className="page-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">THE ART OF FRAGRANCE</span>
          <h1>Find Your Signature Scent.</h1>
          <p>Discover carefully selected fragrances crafted for every mood, moment and memory.</p>
          <div className="cta-row">
            <button type="button" className="primary-button" onClick={() => navigate('/shop')}>Shop Collection</button>
            <button type="button" className="secondary-button" onClick={() => navigate('/best-sellers')}>Explore Best Sellers</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-bottle-wrap">
            <img
              src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80"
              alt="Luxury fragrance bottle"
            />
          </div>
        </div>
      </section>

      <TrustStrip />

      <section className="content-section">
        <SectionHeading eyebrow="Curated Collections" title="Shop by Category" text="Explore elegant fragrances for every personality and occasion." />
        <div className="category-grid">
          {categoryCards.map((category) => (
            <Link key={category.slug} to={`/${category.slug}`} className="category-card">
              <img src={category.image} alt={category.title} />
              <div className="category-card-content">
                <span>{category.title}</span>
                <p>{category.description}</p>
                <button type="button" className="text-link">Explore <ArrowRight size={14} /></button>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-section">
        <SectionHeading eyebrow="Most Loved" title="Most Loved Fragrances" text="Discover the scents our customers keep coming back to." />
        <div className="product-grid">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              wishlist={wishlist}
              onWishlistToggle={onWishlistToggle}
              onAddToCart={onAddToCart}
              onQuickView={setQuickViewProduct}
            />
          ))}
        </div>
      </section>

      <section className="content-section notes-section">
        <SectionHeading eyebrow="Fragrance Discover" title="Find Your Fragrance" text="Browse by note and uncover a scent profile you’ll love." />
        <div className="note-grid">
          {notes.map((note) => (
            <button key={note} type="button" className="note-card" onClick={() => navigate(`/shop?notes=${encodeURIComponent(note)}`)}>
              {note}
            </button>
          ))}
        </div>
      </section>

      <section className="content-section discovery-section">
        <SectionHeading eyebrow="Personalised Picks" title="Not Sure What To Wear?" text="Explore fragrances by mood, occasion and scent profile." />
        <div className="chip-row large">
          {scentProfiles.map((profile) => (
            <button key={profile} type="button" className="chip" onClick={() => navigate(`/shop?occasion=${encodeURIComponent(profile)}`)}>
              {profile}
            </button>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="split-header">
          <SectionHeading eyebrow="Just Arrived" title="Just Arrived" text="Fresh additions for your next signature scent." />
          <button type="button" className="secondary-button" onClick={() => navigate('/new-arrivals')}>View All New Arrivals</button>
        </div>
        <div className="product-grid four-up">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              wishlist={wishlist}
              onWishlistToggle={onWishlistToggle}
              onAddToCart={onAddToCart}
              onQuickView={setQuickViewProduct}
            />
          ))}
        </div>
      </section>

      <section className="editorial-section">
        <div className="editorial-image">
          <img src="https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=1200&q=80" alt="Luxury perfume editorial campaign" />
        </div>
        <div className="editorial-copy">
          <span className="eyebrow">The Scent of an Occasion</span>
          <h2>Made for evenings. Made for everyday. Made to be remembered.</h2>
          <ul className="feature-list">
            <li>Made for evenings</li>
            <li>Made for everyday</li>
            <li>Made to be remembered</li>
          </ul>
          <button type="button" className="primary-button" onClick={() => navigate('/shop')}>Explore the Collection</button>
        </div>
      </section>

      <section className="content-section gifting-section">
        <SectionHeading eyebrow="Fragrance Gifts" title="Give The Gift of Fragrance" text="Thoughtful gifting for every meaningful moment." />
        <div className="gift-grid">
          {['Gift Sets', 'His & Hers', 'Birthday Gifts', 'Wedding Gifts', 'Eid Gifts', 'Corporate Gifts'].map((gift) => (
            <div key={gift} className="gift-card">
              <Gift size={22} />
              <span>{gift}</span>
            </div>
          ))}
        </div>
        <div className="gift-action">
          <button type="button" className="primary-button" onClick={() => navigate('/gift-sets')}>Explore Gifts</button>
        </div>
      </section>

      {quickViewProduct && (
        <div className="modal-backdrop" onClick={() => setQuickViewProduct(null)}>
          <div className="quick-view-modal" onClick={(event) => event.stopPropagation()}>
            <div className="quick-view-media">
              <img src={quickViewProduct.images[0]} alt={quickViewProduct.name} />
            </div>
            <div className="quick-view-copy">
              <div className="quick-view-top">
                <span className="eyebrow">{quickViewProduct.brand}</span>
                <button type="button" className="icon-button" aria-label="Close quick view" onClick={() => setQuickViewProduct(null)}>
                  <X size={18} />
                </button>
              </div>
              <h3>{quickViewProduct.name}</h3>
              <p>{quickViewProduct.description}</p>
              <div className="price-row">
                <strong>{formatPrice(quickViewProduct.price)}</strong>
                {quickViewProduct.compareAtPrice && <span>{formatPrice(quickViewProduct.compareAtPrice)}</span>}
              </div>
              <button type="button" className="primary-button wide" onClick={() => { onAddToCart(quickViewProduct); setQuickViewProduct(null); }}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ShopPage({ products: list, onAddToCart, wishlist, onWishlistToggle }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const category = searchParams.get('category') || 'all';
  const gender = searchParams.get('gender') || 'all';
  const notesParam = searchParams.get('notes') || 'all';
  const occasion = searchParams.get('occasion') || 'all';
  const query = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'featured';

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...list]
      .filter((product) => {
        const categoryMatch = category === 'all' || product.category === category;
        const genderMatch = gender === 'all' || product.gender === gender;
        const notesMatch = notesParam === 'all' || product.notes.includes(notesParam);
        const occasionMatch = occasion === 'all' || product.occasion === occasion;
        const searchMatch = !normalizedQuery || [product.name, product.brand, product.notes.join(' '), product.fragranceFamily].join(' ').toLowerCase().includes(normalizedQuery);
        return categoryMatch && genderMatch && notesMatch && occasionMatch && searchMatch;
      })
      .sort((a, b) => {
        if (sort === 'price-low') return a.price - b.price;
        if (sort === 'price-high') return b.price - a.price;
        if (sort === 'rating') return b.rating - a.rating;
        if (sort === 'newest') return Number(b.isNew) - Number(a.isNew);
        return Number(b.isBestSeller) - Number(a.isBestSeller);
      });
  }, [category, gender, list, notesParam, occasion, query, sort]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <main className="page-shell narrow" aria-label="Shop page">
      <div className="shop-header">
        <div>
          <span className="eyebrow">Curated Collection</span>
          <h1>Shop Fragrances</h1>
        </div>
        <div className="shop-controls">
          <div className="search-pill">
            <Search size={16} />
            <input
              type="search"
              value={query}
              onChange={(event) => updateParam('q', event.target.value)}
              placeholder="Search products"
              aria-label="Search products in shop"
            />
          </div>
          <select value={sort} onChange={(event) => updateParam('sort', event.target.value)} aria-label="Sort products">
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>
          <button type="button" className="secondary-button mobile-only" onClick={() => setMobileFilterOpen(true)}>
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="shop-layout">
        <aside className={`filter-sidebar ${mobileFilterOpen ? 'open' : ''}`}>
          <div className="sidebar-header mobile-only">
            <h3>Filters</h3>
            <button type="button" className="icon-button" aria-label="Close filters" onClick={() => setMobileFilterOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <FilterGroup title="Category" options={['all', 'men', 'women', 'unisex']} value={category} onChange={(value) => updateParam('category', value)} />
          <FilterGroup title="Gender" options={['all', 'Men', 'Women', 'Unisex']} value={gender} onChange={(value) => updateParam('gender', value)} />
          <FilterGroup title="Notes" options={['all', ...fragranceNotes]} value={notesParam} onChange={(value) => updateParam('notes', value)} />
          <FilterGroup title="Occasion" options={['all', 'Everyday', 'Office', 'Date Night', 'Evening', 'Formal', 'Summer', 'Winter']} value={occasion} onChange={(value) => updateParam('occasion', value)} />
          <div className="filter-actions">
            <button type="button" className="secondary-button" onClick={clearFilters}>Reset</button>
          </div>
        </aside>

        <div className="shop-results">
          <div className="results-topbar">
            <span>{filteredProducts.length} products</span>
            <div className="view-toggle">
              <button type="button" className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>Grid</button>
              <button type="button" className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>List</button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <Sparkles size={32} />
              <h3>No products match your filters</h3>
              <p>Try adjusting the category, scent notes or occasion to discover more options.</p>
              <button type="button" className="primary-button" onClick={clearFilters}>Clear filters</button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'product-grid' : 'product-grid list-view'}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wishlist={wishlist}
                  onWishlistToggle={onWishlistToggle}
                  onAddToCart={onAddToCart}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {quickViewProduct && (
        <div className="modal-backdrop" onClick={() => setQuickViewProduct(null)}>
          <div className="quick-view-modal" onClick={(event) => event.stopPropagation()}>
            <div className="quick-view-media">
              <img src={quickViewProduct.images[0]} alt={quickViewProduct.name} />
            </div>
            <div className="quick-view-copy">
              <div className="quick-view-top">
                <span className="eyebrow">{quickViewProduct.brand}</span>
                <button type="button" className="icon-button" onClick={() => setQuickViewProduct(null)}>
                  <X size={18} />
                </button>
              </div>
              <h3>{quickViewProduct.name}</h3>
              <p>{quickViewProduct.description}</p>
              <div className="price-row">
                <strong>{formatPrice(quickViewProduct.price)}</strong>
                {quickViewProduct.compareAtPrice && <span>{formatPrice(quickViewProduct.compareAtPrice)}</span>}
              </div>
              <button type="button" className="primary-button wide" onClick={() => { onAddToCart(quickViewProduct); setQuickViewProduct(null); }}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function FilterGroup({ title, options, value, onChange }) {
  return (
    <div className="filter-group">
      <h4>{title}</h4>
      <div className="filter-options">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={value === option ? 'filter-option active' : 'filter-option'}
            onClick={() => onChange(option)}
          >
            {option === 'all' ? 'All' : option}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductPage({ products, onAddToCart, wishlist, onWishlistToggle }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((item) => item.slug === id) || products[0];
  const [mainImage, setMainImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setMainImage(product.images[0]);
  }, [product]);

  useEffect(() => {
    document.title = `${product.name} | ${product.brand}`;
  }, [product]);

  if (!product) return null;

  const relatedProducts = products.filter((item) => item.id !== product.id).slice(0, 4);
  const currentRating = Array.from({ length: 5 }, (_, index) => index < Math.round(product.rating));

  return (
    <main className="page-shell product-detail-shell">
      <div className="breadcrumbs">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <Link to="/shop">Shop</Link>
        <ChevronRight size={14} />
        <span>{product.name}</span>
      </div>

      <section className="product-detail-layout">
        <div className="gallery-panel">
          <div className="main-image-frame">
            <img src={mainImage} alt={product.name} />
          </div>
          <div className="thumbnail-row">
            {product.images.map((image) => (
              <button key={image} type="button" className={mainImage === image ? 'thumbnail active' : 'thumbnail'} onClick={() => setMainImage(image)}>
                <img src={image} alt={`${product.name} gallery`} />
              </button>
            ))}
          </div>
        </div>

        <div className="product-info-panel">
          <span className="eyebrow">{product.brand}</span>
          <h1>{product.name}</h1>
          <div className="rating-line detail-rating">
            <div className="stars">
              {currentRating.map((filled, index) => (
                <Star key={`${product.id}-${index}`} size={14} fill={filled ? 'currentColor' : 'none'} />
              ))}
            </div>
            <span>{product.rating}</span>
            <small>({product.reviewCount} reviews)</small>
          </div>

          <div className="price-row detail-price">
            <strong>{formatPrice(product.price)}</strong>
            {product.compareAtPrice && <span>{formatPrice(product.compareAtPrice)}</span>}
            {product.discount && <em>-{product.discount}%</em>}
          </div>

          <p className="product-summary">{product.description}</p>

          <div className="availability-row">
            <span className={product.stock > 0 ? 'available' : 'unavailable'}>{product.stock > 0 ? 'In stock' : 'Sold out'}</span>
            <span>{product.size}</span>
          </div>

          <div className="detail-actions">
            <div className="quantity-box large">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((current) => Math.max(1, current - 1))}><Minus size={14} /></button>
              <span>{quantity}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((current) => current + 1)}><Plus size={14} /></button>
            </div>
            <button type="button" className="primary-button" onClick={() => onAddToCart(product, quantity)}>Add to Cart</button>
            <button type="button" className="secondary-button" onClick={() => onWishlistToggle(product.id)}>Wishlist</button>
          </div>

          <div className="detail-meta-grid">
            {product.fragranceFamily && <div><span>Fragrance family</span><strong>{product.fragranceFamily}</strong></div>}
            {product.concentration && <div><span>Concentration</span><strong>{product.concentration}</strong></div>}
            {product.gender && <div><span>Gender</span><strong>{product.gender}</strong></div>}
            {product.season && <div><span>Season</span><strong>{product.season}</strong></div>}
            {product.occasion && <div><span>Occasion</span><strong>{product.occasion}</strong></div>}
            {product.longevity && <div><span>Longevity</span><strong>{product.longevity}</strong></div>}
            {product.sillage && <div><span>Sillage</span><strong>{product.sillage}</strong></div>}
          </div>
        </div>
      </section>

      <section className="details-accordion">
        <AccordionItem title="Description" content={product.description} defaultOpen />
        <AccordionItem title="Fragrance Notes" content={(
          <div className="notes-stack">
            <div><span>Top Notes</span><p>{product.topNotes.join(', ')}</p></div>
            <div><span>Heart Notes</span><p>{product.heartNotes.join(', ')}</p></div>
            <div><span>Base Notes</span><p>{product.baseNotes.join(', ')}</p></div>
          </div>
        )} />
        <AccordionItem title="How To Use" content="Apply to pulse points such as the wrists, neck and chest. For a longer-lasting trail, apply shortly after showering on moisturised skin." />
        <AccordionItem title="Shipping & Returns" content="Available shipment options and return guidance depend on order location and final policy. Update this section with your final shipping and returns information when approved by the client." />
        <AccordionItem title="FAQs" content="Need advice on fragrance concentration, longevity or gifting? Reach out through the contact page for personalised support." />
      </section>

      <section className="content-section reviews-section">
        <SectionHeading eyebrow="Customer Reviews" title="Trusted by fragrance lovers" text="Real feedback and scent notes from our customers." />
        {reviews.length ? (
          <div className="review-grid">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-topline">
                  <strong>{review.name}</strong>
                  {review.verified && <span className="verified-badge">Verified purchase</span>}
                </div>
                <div className="rating-line">
                  {Array.from({ length: review.rating }, (_, idx) => (
                    <Star key={`${review.id}-${idx}`} size={14} fill="currentColor" />
                  ))}
                </div>
                <p>{review.review}</p>
                <small>{review.date}</small>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state compact">
            <Star size={28} />
            <h3>No reviews yet</h3>
            <p>Reviews will appear here once customer feedback is available.</p>
          </div>
        )}
      </section>

      <section className="content-section">
        <SectionHeading eyebrow="More To Explore" title="Related Products" text="Complementary fragrances and favourites from the same collection." />
        <div className="product-grid">
          {relatedProducts.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              wishlist={wishlist}
              onWishlistToggle={onWishlistToggle}
              onAddToCart={onAddToCart}
              onQuickView={() => navigate(`/product/${item.slug}`)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function AccordionItem({ title, content, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`accordion-item ${open ? 'open' : ''}`}>
      <button type="button" className="accordion-trigger" onClick={() => setOpen((current) => !current)}>
        <span>{title}</span>
        <ChevronDown size={16} />
      </button>
      {open && <div className="accordion-content">{content}</div>}
    </div>
  );
}

function CartPage({ cart, onUpdateQty, onRemove, onCheckout }) {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : 350;
  const total = subtotal + shipping;

  if (!cart.length) {
    return (
      <main className="page-shell narrow center-page">
        <div className="empty-state">
          <ShoppingBag size={32} />
          <h1>Your cart is empty</h1>
          <p>Browse our signature scent collection and add your favourites.</p>
          <Link to="/shop" className="primary-button">Continue Shopping</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell narrow">
      <section className="cart-page">
        <div className="cart-main-column">
          <h1>Shopping Cart</h1>
          {cart.map((item) => (
            <div key={item.id} className="cart-page-item">
              <img src={item.product.images[0]} alt={item.product.name} />
              <div className="cart-information">
                <h3>{item.product.name}</h3>
                <p>{item.product.brand}</p>
                <div className="quantity-box large">
                  <button type="button" aria-label={`Decrease quantity for ${item.product.name}`} onClick={() => onUpdateQty(item.id, item.quantity - 1)}><Minus size={14} /></button>
                  <span>{item.quantity}</span>
                  <button type="button" aria-label={`Increase quantity for ${item.product.name}`} onClick={() => onUpdateQty(item.id, item.quantity + 1)}><Plus size={14} /></button>
                </div>
              </div>
              <div className="cart-price-block">
                <strong>{formatPrice(item.product.price * item.quantity)}</strong>
                <button type="button" className="text-button" onClick={() => onRemove(item.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <aside className="summary-panel">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
          <div className="summary-row"><span>Shipping</span><strong>{shipping === 0 ? 'Free' : formatPrice(shipping)}</strong></div>
          <div className="summary-row total"><span>Total</span><strong>{formatPrice(total)}</strong></div>
          <Link to="/checkout" className="primary-button wide" onClick={onCheckout}>Proceed to Checkout</Link>
        </aside>
      </section>
    </main>
  );
}

function CheckoutPage({ cart, subtotal, shipping, total }) {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/');
  };

  return (
    <main className="page-shell checkout-shell">
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h1>Checkout</h1>
          <div className="field-grid">
            <label><span>Full Name</span><input type="text" placeholder="Your full name" /></label>
            <label><span>Phone Number</span><input type="tel" placeholder="03xx-xxxxxxx" /></label>
            <label><span>Email</span><input type="email" placeholder="name@example.com" /></label>
            <label><span>Province</span><input type="text" placeholder="Punjab" /></label>
            <label><span>City</span><input type="text" placeholder="Lahore" /></label>
            <label><span>Area</span><input type="text" placeholder="Gulshan" /></label>
            <label className="full-width"><span>Complete Address</span><textarea rows="4" placeholder="Street address, unit, landmark" /></label>
            <label className="full-width"><span>Order Notes</span><textarea rows="3" placeholder="Optional delivery notes" /></label>
          </div>

          <div className="payment-box">
            <h3>Payment Method</h3>
            <label className="radio-option"><input type="radio" name="payment" checked readOnly /> Cash on Delivery</label>
          </div>

          <button type="submit" className="primary-button wide">Place Order</button>
        </form>

        <aside className="summary-panel checkout-summary">
          <h3>Order Summary</h3>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div className="checkout-products">
              {cart.map((item) => (
                <div key={item.id} className="checkout-item">
                  <span>{item.product.name} × {item.quantity}</span>
                  <strong>{formatPrice(item.product.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
          )}
          <div className="summary-row"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
          <div className="summary-row"><span>Shipping</span><strong>{shipping === 0 ? 'Free' : formatPrice(shipping)}</strong></div>
          <div className="summary-row total"><span>Total</span><strong>{formatPrice(total)}</strong></div>
        </aside>
      </div>
    </main>
  );
}

function AboutPage() {
  return (
    <main className="page-shell narrow about-page">
      <SectionHeading eyebrow="Our Story" title="Crafted for modern rituals and meaningful moments." text="We believe fragrance should feel personal, refined and enduring." />
      <div className="story-grid">
        <div className="story-card">
          <h3>Our Philosophy</h3>
          <p>Every bottle is selected with balance in mind — a thoughtful blend of elegance, longevity and personality.</p>
        </div>
        <div className="story-card">
          <h3>What We Believe</h3>
          <p>Fragrance should feel expressive without being overwhelming. We focus on quality, craftsmanship and versatility.</p>
        </div>
      </div>
      <div className="story-grid full">
        <div className="story-card large">
          <h3>Our Fragrance Selection</h3>
          <p>From clean and fresh to warm and woody, our collection is designed to suit different moods, outfits and settings.</p>
        </div>
        <div className="story-card large">
          <h3>Quality & Authenticity</h3>
          <p>We work with trusted sourcing partners and keep product information transparent so customers can shop with confidence.</p>
        </div>
      </div>
      <div className="about-feature">
        <h3>Why Customers Choose Us</h3>
        <ul>
          <li>Thoughtful curation</li>
          <li>Premium presentation</li>
          <li>Nationwide availability</li>
          <li>Simple, reliable shopping</li>
        </ul>
      </div>
    </main>
  );
}

function ContactPage() {
  return (
    <main className="page-shell narrow contact-page">
      <div className="contact-layout">
        <div className="contact-card">
          <span className="eyebrow">Contact</span>
          <h1>We are here to help</h1>
          <div className="contact-list">
            <div><Phone size={18} /><span>{siteConfig.contact.phone}</span></div>
            <div><MessageCircle size={18} /><span>{siteConfig.contact.whatsapp}</span></div>
            <div><Mail size={18} /><span>{siteConfig.contact.email}</span></div>
            <div><MapPin size={18} /><span>{siteConfig.contact.address}</span></div>
            <div><Clock3 size={18} /><span>{siteConfig.contact.hours}</span></div>
          </div>
          <button type="button" className="primary-button">WhatsApp Us</button>
        </div>

        <form className="contact-form">
          <label><span>Name</span><input type="text" placeholder="Your name" /></label>
          <label><span>Email</span><input type="email" placeholder="you@example.com" /></label>
          <label><span>Phone</span><input type="tel" placeholder="03xx-xxxxxxx" /></label>
          <label><span>Message</span><textarea rows="6" placeholder="Tell us how we can help" /></label>
          <button type="submit" className="primary-button wide">Send Message</button>
        </form>
      </div>
    </main>
  );
}

function FAQPage() {
  const [query, setQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(0);

  const filteredFaq = faqList.filter((item) => item.question.toLowerCase().includes(query.toLowerCase()) || item.answer.toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="page-shell narrow faq-page">
      <SectionHeading eyebrow="Support" title="Frequently Asked Questions" text="Helpful information about delivery, authenticity and fragrance care." />
      <div className="faq-search">
        <Search size={16} />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search FAQs" aria-label="Search the FAQ" />
      </div>

      <div className="faq-list">
        {filteredFaq.length ? filteredFaq.map((item, index) => (
          <div key={item.question} className={`accordion-item ${openIndex === index ? 'open' : ''}`}>
            <button type="button" className="accordion-trigger" onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
              <span>{item.question}</span>
              <ChevronDown size={16} />
            </button>
            {openIndex === index && <div className="accordion-content"><p>{item.answer}</p></div>}
          </div>
        )) : <div className="empty-state compact"><p>No FAQs match your search.</p></div>}
      </div>
    </main>
  );
}

function Footer({ brandName }) {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <div className="brand-mark footer-brand">{brandName}</div>
          <p>Luxury fragrance curation for everyday rituals and memorable moments.</p>
          <div className="social-row">
            <a href="#" aria-label="Instagram">◎</a>
            <a href="#" aria-label="Facebook">◌</a>
            <a href="#" aria-label="TikTok">◍</a>
          </div>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li><Link to="/men">Men</Link></li>
            <li><Link to="/women">Women</Link></li>
            <li><Link to="/unisex">Unisex</Link></li>
            <li><Link to="/best-sellers">Best Sellers</Link></li>
            <li><Link to="/new-arrivals">New Arrivals</Link></li>
            <li><Link to="/gift-sets">Gift Sets</Link></li>
          </ul>
        </div>
        <div>
          <h4>Customer Care</h4>
          <ul>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><a href="#">Shipping</a></li>
            <li><a href="#">Returns</a></li>
            <li><a href="#">Track Order</a></li>
          </ul>
        </div>
        <div>
          <h4>Join the fragrance list</h4>
          <div className="newsletter-box">
            <input type="email" placeholder="Email address" aria-label="Email address for newsletter" />
            <button type="button" className="primary-button">Subscribe</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 {brandName}. All rights reserved.</span>
        <div>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms & Conditions</a>
          <a href="#">Shipping Policy</a>
          <a href="#">Return Policy</a>
        </div>
      </div>
    </footer>
  );
}

export default App;
