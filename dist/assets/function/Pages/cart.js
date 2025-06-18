import {
  getCart,
  removeFromCart,
  updateCartQuantity,
  updateCartCount,
} from "../Shop/cart.js";
import { fetchAllProducts } from "../Shop/ShopFunction.js";
import { formatMoneyAmount } from "../Util/format.js";
import { showNotification } from "../Util/notification.js";

export default async function cart(renderPageHTML) {
  window.scrollTo(0, 0);

  const allProducts = await fetchAllProducts();
  let cartItems = getCart();

  function getProduct(productId) {
    return allProducts.find((p) => p.id === productId);
  }

  function renderCartTable() {
    if (!cartItems.length) {
      return `<div class="text-center py-16 text-gray-400 text-xl font-semibold">Your cart is empty.</div>`;
    }
    return `
      <table class="min-w-full bg-white rounded-xl shadow overflow-hidden">
        <thead>
          <tr class="bg-gray-100 text-gray-700 text-sm">
            <th class="p-4">Product</th>
            <th class="p-4">Name</th>
            <th class="p-4 text-center">Unit Price</th>
            <th class="p-4 text-center">Quantity</th>
            <th class="p-4 text-center">Total</th>
            <th class="p-4 text-center">Remove</th>
          </tr>
        </thead>
        <tbody>
          ${cartItems
            .map((item) => {
              const product = getProduct(item.productId);
              if (!product) return "";
              const img =
                (product.images && product.images[0]?.url) ||
                "/assets/images/products/armless-braid-hair-1.png";
              return `
                <tr class="border-b hover:bg-gray-50 transition">
                  <td class="p-4">
                    <img src="${img}" alt="${
                product.name
              }" class="w-16 h-16 object-cover rounded shadow" />
                  </td>
                  <td class="p-4 font-semibold">${product.name}</td>
                  <td class="p-4 text-center text-green-600 font-bold"><i class="fa-solid fa-naira-sign"></i>${formatMoneyAmount(
                    product.price
                  )}</td>
                  <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button class="decrease-qty-btn bg-gray-200 hover:bg-pink-200 text-pink-600 rounded px-2 py-1" data-product-id="${
                        item.productId
                      }" title="Decrease"><i class="fas fa-minus"></i></button>
                      <input type="number" min="1" max="99" value="${
                        item.quantity
                      }" class="cart-qty-input w-12 text-center border rounded" data-product-id="${
                item.productId
              }" />
                      <button class="increase-qty-btn bg-gray-200 hover:bg-pink-200 text-pink-600 rounded px-2 py-1" data-product-id="${
                        item.productId
                      }" title="Increase"><i class="fas fa-plus"></i></button>
                    </div>
                  </td>
                  <td class="p-4 text-center font-semibold text-indigo-700"><i class="fa-solid fa-naira-sign"></i>${formatMoneyAmount(
                    product.price * item.quantity
                  )}</td>
                  <td class="p-4 text-center">
                    <button class="delete-cart-btn bg-red-100 hover:bg-red-400 text-red-600 hover:text-white rounded-full p-2 transition" data-product-id="${
                      item.productId
                    }" title="Remove">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    `;
  }

  function renderSummary() {
    const total = cartItems.reduce((sum, item) => {
      const product = getProduct(item.productId);
      return product ? sum + product.price * item.quantity : sum;
    }, 0);
    return `
      <div class="bg-white rounded-xl shadow p-6 mb-6">
        <h2 class="text-xl font-bold mb-4">Cart Totals</h2>
        <div class="flex justify-between mb-2">
          <span class="font-semibold">Subtotal</span>
          <span class="text-green-700 font-bold"><i class="fa-solid fa-naira-sign"></i>${formatMoneyAmount(
            total
          )}</span>
        </div>
        <div class="flex justify-between mb-2">
          <span class="font-semibold">Shipping</span>
          <span class="text-gray-500">Calculated at checkout</span>
        </div>
        <div class="flex justify-between text-lg font-bold border-t pt-4">
          <span>Total</span>
          <span class="text-indigo-700"><i class="fa-solid fa-naira-sign"></i>${formatMoneyAmount(
            total
          )}</span>
        </div>
        <button id="proceed-checkout-btn" class="block mt-6 w-full bg-pink-600 hover:bg-pink-700 text-white text-center py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow">Proceed to Checkout</button>
      </div>
    `;
  }

  // Initial render
  renderPageHTML.innerHTML = `
    <section class="py-10 bg-gray-50 min-h-screen animate-fade-in-up">
      <div class="max-w-5xl mx-auto px-4">
        <h1 class="text-3xl font-bold text-gray-800 mb-8">Your Shopping Cart</h1>
        <div class="overflow-x-auto mb-8" id="cart-table-container">${renderCartTable()}</div>
        <div id="cart-summary-container">${renderSummary()}</div>
      </div>
    </section>
  `;

  // --- Event Listeners ---
  function refreshCartUI() {
    cartItems = getCart();
    // Only update the cart table and summary, not the whole section
    const tableContainer = renderPageHTML.querySelector(
      "#cart-table-container"
    );
    const summaryContainer = renderPageHTML.querySelector(
      "#cart-summary-container"
    );
    if (tableContainer) tableContainer.innerHTML = renderCartTable();
    if (summaryContainer) summaryContainer.innerHTML = renderSummary();
    attachCartEvents();
    updateCartCount();
  }

  function attachCartEvents() {
    // Delete
    renderPageHTML.querySelectorAll(".delete-cart-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.getAttribute("data-product-id");
        removeFromCart(productId);
        showNotification("Item removed from cart", "success");
        refreshCartUI();
      });
    });

    // Quantity input
    renderPageHTML.querySelectorAll(".cart-qty-input").forEach((input) => {
      input.addEventListener("change", () => {
        const productId = input.getAttribute("data-product-id");
        let qty = parseInt(input.value, 10);
        if (isNaN(qty) || qty < 1) qty = 1;
        updateCartQuantity(productId, qty);
        showNotification("Cart updated", "success");
        refreshCartUI();
      });
    });

    // Increase/Decrease
    renderPageHTML.querySelectorAll(".increase-qty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.getAttribute("data-product-id");
        const item = cartItems.find((i) => i.productId === productId);
        if (item) {
          updateCartQuantity(productId, item.quantity + 1);
          refreshCartUI();
        }
      });
    });
    renderPageHTML.querySelectorAll(".decrease-qty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const productId = btn.getAttribute("data-product-id");
        const item = cartItems.find((i) => i.productId === productId);
        if (item && item.quantity > 1) {
          updateCartQuantity(productId, item.quantity - 1);
          refreshCartUI();
        }
      });
    });

    // Proceed to Checkout (SPA navigation)
    const checkoutBtn = renderPageHTML.querySelector("#proceed-checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.loadPage) {
          window.loadPage("checkout");
        } else {
          window.location.href = "/checkout";
        }
      });
    }
  }

  attachCartEvents();
  updateCartCount();
}
