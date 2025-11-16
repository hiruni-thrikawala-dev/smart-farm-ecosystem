// Cart functionality for ECOZIA
let cart = JSON.parse(localStorage.getItem('ecozia_cart')) || [];

// Initialize cart
function initCart() {
  updateCartCount();
  renderCart();
}

// Add to cart
function addToCart(productId) {
  // Get product from products array (defined in products.html)
  let product;
  if (typeof products !== 'undefined') {
    product = products.find(p => p.id === productId);
  }
  
  if (!product) {
    // Try to get from a global products array or fetch from local storage
    const allProducts = JSON.parse(localStorage.getItem('ecozia_products')) || [];
    product = allProducts.find(p => p.id === productId);
  }
  
  if (!product) {
    alert('Product not found!');
    return;
  }
  
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }
  
  saveCart();
  updateCartCount();
  renderCart();
  showAddToCartMessage(product.name);
}

// Remove from cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartCount();
  renderCart();
}

// Update quantity
function updateQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
      updateCartCount();
      renderCart();
    }
  }
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('ecozia_cart', JSON.stringify(cart));
}

// Update cart count badge
function updateCartCount() {
  const countElement = document.getElementById('cartCount');
  if (countElement) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countElement.textContent = totalItems;
    if (totalItems > 0) {
      countElement.style.display = 'inline-block';
    } else {
      countElement.style.display = 'none';
    }
  }
}

// Calculate cart total
function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Render cart
function renderCart() {
  const cartItems = document.getElementById('cartItems');
  if (!cartItems) return;
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    const cartTotal = document.getElementById('cartTotal');
    if (cartTotal) {
      cartTotal.textContent = 'Rs. 0';
    }
    return;
  }
  
  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p class="cart-item-price">Rs. ${item.price.toLocaleString()}</p>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="cart-remove" onclick="removeFromCart(${item.id})" title="Remove">&times;</button>
    </div>
  `).join('');
  
  const cartTotal = document.getElementById('cartTotal');
  if (cartTotal) {
    cartTotal.textContent = `Rs. ${getCartTotal().toLocaleString()}`;
  }
}

// Toggle cart sidebar
function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  
  if (sidebar && overlay) {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
  }
}

// Checkout
function checkout() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  
  const user = localStorage.getItem('ecozia_user');
  if (!user) {
    alert('Please sign in to checkout');
    window.location.href = 'signin.html';
    return;
  }
  
  // Save order
  const order = {
    id: Date.now(),
    items: cart,
    total: getCartTotal(),
    date: new Date().toISOString(),
    status: 'pending'
  };
  
  const orders = JSON.parse(localStorage.getItem('ecozia_orders')) || [];
  orders.push(order);
  localStorage.setItem('ecozia_orders', JSON.stringify(orders));
  
  // Clear cart
  cart = [];
  saveCart();
  updateCartCount();
  renderCart();
  toggleCart();
  
  alert('Order placed successfully! Order ID: ' + order.id);
}

// Show add to cart message
function showAddToCartMessage(productName) {
  const message = document.createElement('div');
  message.className = 'cart-message';
  message.textContent = `${productName} added to cart!`;
  message.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #2d8659, #4ba776);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(45, 134, 89, 0.3);
    z-index: 10000;
    animation: slideInUp 0.3s ease;
  `;
  
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.style.animation = 'slideOutDown 0.3s ease';
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 300);
  }, 3000);
  
  // Add animation styles if not already present
  if (!document.getElementById('cart-message-animations')) {
    const style = document.createElement('style');
    style.id = 'cart-message-animations';
    style.textContent = `
      @keyframes slideInUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes slideOutDown {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize cart on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCart);
} else {
  initCart();
}

