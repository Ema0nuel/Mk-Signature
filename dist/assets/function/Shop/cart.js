// Simple localStorage-based cart logic

const CART_KEY = "mk_signature_cart";

// Get cart from localStorage
export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

// Save cart to localStorage
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(productId, quantity = 1, variants = {}) {
  let cart = getCart();
  // Check for same product and same variants
  const existing = cart.find(
    (item) =>
      item.productId === productId &&
      JSON.stringify(item.variants || {}) === JSON.stringify(variants || {})
  );
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity, variants });
  }
  saveCart(cart);
  updateCartCount && updateCartCount();
}

// Remove product from cart
export function removeFromCart(productId) {
  let cart = getCart().filter((item) => item.productId !== productId);
  saveCart(cart);
  updateCartCount();
}

// Update product quantity
export function updateCartQuantity(productId, quantity) {
  let cart = getCart();
  const item = cart.find((item) => item.productId === productId);
  if (item) {
    item.quantity = quantity;
    if (item.quantity <= 0) {
      cart = cart.filter((item) => item.productId !== productId);
    }
    saveCart(cart);
    updateCartCount();
  }
}

// Clear cart
export function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartCount();
}

/**
 * Updates the cart count badge everywhere in the app.
 */
export function updateCartCount() {
  let cart = [];
  try {
    cart = getCart() || [];
  } catch {
    cart = [];
  }
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartCountEl = document.getElementById("cart-count");
  if (cartCountEl) {
    cartCountEl.textContent = cartCount > 0 ? cartCount : "";
  }
}

// Listen for cart changes (for dynamic update)
window.addEventListener("storage", (e) => {
  if (e.key === "mk_signature_cart") updateCartCount();
});

// Optionally, update on DOMContentLoaded
window.addEventListener("DOMContentLoaded", updateCartCount);
