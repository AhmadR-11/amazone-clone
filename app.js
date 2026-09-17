/**
 * Amazon Clone — Application State & Interactivity Logic
 */

// Product Dataset
const products = [
  {
    id: 'prod-1',
    title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    category: 'electronics',
    price: 348.00,
    originalPrice: 399.99,
    rating: 4.8,
    reviews: 12450,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    description: 'Industry-leading noise canceling with two processors and 8 microphones for unprecedented sound purity. 30-hour battery life with quick charging.'
  },
  {
    id: 'prod-2',
    title: 'Apple MacBook Pro 16" M3 Max (36GB RAM, 1TB SSD)',
    category: 'electronics',
    price: 2899.00,
    originalPrice: 3099.00,
    rating: 4.9,
    reviews: 3820,
    badge: 'Top Pick',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    description: 'The 16-inch MacBook Pro with M3 Max delivers unbelievable speed and efficiency for intense pro workflows.'
  },
  {
    id: 'prod-3',
    title: 'Men’s Ultra-Soft Organic Cotton Crewneck Sweater',
    category: 'fashion',
    price: 49.50,
    originalPrice: 75.00,
    rating: 4.6,
    reviews: 1940,
    badge: 'Limited Deal',
    image: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=600&q=80',
    description: 'Crafted from 100% premium organic cotton. Breathable, durable, and tailored for effortless everyday comfort.'
  },
  {
    id: 'prod-4',
    title: 'Smart Espresso & Cappuccino Machine with Milk Frother',
    category: 'home',
    price: 599.95,
    originalPrice: 749.95,
    rating: 4.7,
    reviews: 4210,
    badge: 'Save 20%',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80',
    description: 'Barista-quality espresso at home. Precise temperature control and powerful steam pressure for micro-foam milk texturing.'
  },
  {
    id: 'prod-5',
    title: 'PlayStation 5 Console — DualSense Wireless Controller Bundle',
    category: 'gaming',
    price: 499.99,
    originalPrice: 559.99,
    rating: 4.9,
    reviews: 28400,
    badge: 'Trending',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    description: 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.'
  },
  {
    id: 'prod-6',
    title: 'Ergonomic Executive Office Desk Chair with Lumbar Support',
    category: 'home',
    price: 189.99,
    originalPrice: 249.99,
    rating: 4.5,
    reviews: 8630,
    badge: 'Choice',
    image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=600&q=80',
    description: 'Breathable mesh back design with adjustable headrest, 3D armrests, and dynamic lumbar support for all-day comfort.'
  },
  {
    id: 'prod-7',
    title: 'Minimalist Mechanical Gaming Keyboard (RGB Backlit)',
    category: 'gaming',
    price: 119.00,
    originalPrice: 149.00,
    rating: 4.8,
    reviews: 6420,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    description: 'Custom hot-swappable linear mechanical switches, per-key RGB lighting, and solid aluminum frame.'
  },
  {
    id: 'prod-8',
    title: 'System Design Interview & Cloud Architecture Hardcover',
    category: 'books',
    price: 36.00,
    originalPrice: 45.00,
    rating: 4.9,
    reviews: 9310,
    badge: '#1 Release',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    description: 'Comprehensive guide covering large-scale distributed systems, database scaling, microservices, and system architecture.'
  }
];

// App State
let cart = [];
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'featured';

// DOM Elements
const productGrid = document.getElementById('product-grid');
const sectionTitle = document.getElementById('section-title');
const productCountLabel = document.getElementById('product-count-label');
const searchInput = document.getElementById('search-input');
const searchCategorySelect = document.getElementById('search-category');
const searchBtn = document.getElementById('search-btn');
const sortSelect = document.getElementById('sort-select');

// Cart DOM
const cartBtn = document.getElementById('cart-btn');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartCountElem = document.getElementById('cart-count');
const drawerCartCountElem = document.getElementById('drawer-cart-count');
const cartDrawerItems = document.getElementById('cart-drawer-items');
const cartSubtotalElem = document.getElementById('cart-subtotal');
const checkoutBtn = document.getElementById('checkout-btn');

// Modal DOM
const productModalBackdrop = document.getElementById('product-modal-backdrop');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalBody = document.getElementById('modal-body');
const checkoutModalBackdrop = document.getElementById('checkout-modal-backdrop');
const finishOrderBtn = document.getElementById('finish-order-btn');
const orderSummaryContent = document.getElementById('order-summary-content');

// Helper: Render Stars
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? '★' : '';
  return '★'.repeat(fullStars) + halfStar;
}

// Render Products Grid
function renderProducts() {
  let filtered = products.filter(p => {
    const matchesCategory = currentCategory === 'all' || p.category === currentCategory;
    const matchesSearch = p.title.toLowerCase().includes(currentSearch.toLowerCase()) || 
                          p.description.toLowerCase().includes(currentSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sorting
  if (currentSort === 'low-high') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'high-low') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  productCountLabel.textContent = `${filtered.length} Items`;

  if (filtered.length === 0) {
    productGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px; background: white; border-radius: 8px;">
        <h3>No products found for "${currentSearch}"</h3>
        <p style="color: #666; margin-top: 8px;">Try adjusting your search terms or category filter.</p>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = filtered.map(product => `
    <div class="product-card" data-id="${product.id}">
      ${product.badge ? `<span class="badge-tag">${product.badge}</span>` : ''}
      <img src="${product.image}" alt="${product.title}" class="product-card-img" onclick="openProductModal('${product.id}')">
      <div class="product-info">
        <h4 class="product-title" onclick="openProductModal('${product.id}')">${product.title}</h4>
        <div class="product-rating">
          <span class="stars">${renderStars(product.rating)}</span>
          <span class="rating-count">(${product.reviews.toLocaleString()})</span>
        </div>
        <div class="prime-tag">✓prime</div>
        <div class="product-price-row">
          <span class="price-main">$${product.price.toFixed(2)}</span>
          ${product.originalPrice ? `<span class="price-original">$${product.originalPrice.toFixed(2)}</span>` : ''}
        </div>
        <div class="product-actions">
          <button class="add-cart-btn" onclick="addToCart('${product.id}')">Add to Cart</button>
          <button class="quick-view-btn" onclick="openProductModal('${product.id}')">Quick View</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Cart Logic
function addToCart(productId) {
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    const prod = products.find(p => p.id === productId);
    cart.push({ ...prod, quantity: 1 });
  }
  updateCartUI();
  openCartDrawer();
}

function updateCartQuantity(productId, change) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  updateCartUI();
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  cartCountElem.textContent = totalItems;
  drawerCartCountElem.textContent = totalItems;
  cartSubtotalElem.textContent = `$${subtotal.toFixed(2)}`;

  if (cart.length === 0) {
    cartDrawerItems.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: #666;">
        <p style="font-size: 16px; font-weight: 600;">Your Amazon Cart is empty</p>
        <p style="font-size: 13px; margin-top: 6px;">Add items to your cart to see them here.</p>
      </div>
    `;
    checkoutBtn.disabled = true;
    checkoutBtn.style.opacity = '0.5';
    return;
  }

  checkoutBtn.disabled = false;
  checkoutBtn.style.opacity = '1';

  cartDrawerItems.innerHTML = cart.map(item => `
    <div class="cart-item-row">
      <img src="${item.image}" alt="${item.title}" class="cart-item-img">
      <div class="cart-item-details">
        <h5 class="cart-item-title">${item.title}</h5>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openCartDrawer() {
  cartOverlay.classList.add('open');
  cartDrawer.classList.add('open');
}

function closeCartDrawer() {
  cartOverlay.classList.remove('open');
  cartDrawer.classList.remove('open');
}

// Product Modal
function openProductModal(productId) {
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  modalBody.innerHTML = `
    <div>
      <img src="${prod.image}" alt="${prod.title}">
    </div>
    <div class="modal-info">
      <h2>${prod.title}</h2>
      <div class="product-rating">
        <span class="stars">${renderStars(prod.rating)}</span>
        <span class="rating-count">(${prod.reviews.toLocaleString()} reviews)</span>
      </div>
      <div class="prime-tag">✓prime FREE Two-Day Shipping</div>
      <div class="product-price-row" style="margin-top: 10px;">
        <span class="price-main">$${prod.price.toFixed(2)}</span>
        ${prod.originalPrice ? `<span class="price-original">$${prod.originalPrice.toFixed(2)}</span>` : ''}
      </div>
      <p class="modal-desc">${prod.description}</p>
      <div style="margin-top: 20px;">
        <button class="btn-primary" style="width: 100%; padding: 12px;" onclick="addToCart('${prod.id}'); closeProductModal();">Add to Cart</button>
      </div>
    </div>
  `;
  productModalBackdrop.classList.add('open');
}

function closeProductModal() {
  productModalBackdrop.classList.remove('open');
}

// Checkout Simulation
function handleCheckout() {
  if (cart.length === 0) return;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  orderSummaryContent.innerHTML = `
    <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Items Ordered (${cart.length}):</div>
    ${cart.map(i => `<div style="font-size: 13px; color: #444;">• ${i.quantity}x ${i.title}</div>`).join('')}
    <div style="margin-top: 12px; font-weight: 800; font-size: 16px; border-top: 1px solid #ddd; padding-top: 8px;">
      Total Paid: $${subtotal.toFixed(2)}
    </div>
  `;

  closeCartDrawer();
  checkoutModalBackdrop.classList.add('open');
  cart = [];
  updateCartUI();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();

  // Search
  searchBtn.addEventListener('click', () => {
    currentSearch = searchInput.value.trim();
    currentCategory = searchCategorySelect.value;
    sectionTitle.textContent = currentCategory === 'all' ? 'SearchResults' : `Department: ${currentCategory.toUpperCase()}`;
    renderProducts();
  });

  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      currentSearch = searchInput.value.trim();
      currentCategory = searchCategorySelect.value;
      renderProducts();
    }
  });

  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderProducts();
  });

  // Navigation Links
  document.querySelectorAll('.sub-nav-links a, .cat-card-link, .shop-now-btn').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = link.getAttribute('data-cat');
      if (cat) {
        currentCategory = cat;
        searchCategorySelect.value = cat;
        sectionTitle.textContent = cat === 'all' ? 'Featured Products' : `Category: ${cat.toUpperCase()}`;
        document.querySelectorAll('.sub-nav-links a').forEach(a => a.classList.remove('active'));
        const navMatch = document.querySelector(`.sub-nav-links a[data-cat="${cat}"]`);
        if (navMatch) navMatch.classList.add('active');
        renderProducts();
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }
    });
  });

  // Cart Drawer Events
  cartBtn.addEventListener('click', openCartDrawer);
  closeCartBtn.addEventListener('click', closeCartDrawer);
  cartOverlay.addEventListener('click', closeCartDrawer);
  checkoutBtn.addEventListener('click', handleCheckout);

  // Modal Close Events
  modalCloseBtn.addEventListener('click', closeProductModal);
  productModalBackdrop.addEventListener('click', (e) => {
    if (e.target === productModalBackdrop) closeProductModal();
  });
  finishOrderBtn.addEventListener('click', () => {
    checkoutModalBackdrop.classList.remove('open');
  });
});
