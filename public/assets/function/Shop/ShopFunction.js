import { supabase } from "../Data/db.js";
import { showNotification } from "../Util/notification.js";
import { formatMoneyAmount } from "../Util/format.js";
import { displayView } from "./modalView.js";
import { addToCart, getCart } from "./cart.js";

/**
 * Fetch all products from Supabase, ordered by created_at DESC
 */
export async function fetchAllProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * Filter products by category (case-insensitive)
 */
export function filterProductsByCategory(products, category) {
  return products.filter((p) =>
    (p.categories || []).map((c) => c.toLowerCase()).includes(category.toLowerCase())
  );
}

/**
 * Search products by name, brand, or category
 */
export function searchProducts(products, query) {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const brand = (p.brand || "").toLowerCase();
    const cats = (p.categories || []).join(" ").toLowerCase();
    return name.includes(q) || brand.includes(q) || cats.includes(q);
  });
}

/**
 * Render a single product card (Tailwind, FontAwesome)
 */
export function renderProductCard(product) {
  const img =
    (product.images && product.images[0]?.url) ||
    "/assets/images/default.png";
  return `
    <div class="bg-white rounded-xl shadow hover:shadow-xl transition duration-300 flex flex-col group relative overflow-hidden js-product-card" data-product-id="${product.id}">
      <div class="relative">
        <img src="${img}" alt="${product.name}" loading="lazy" class="w-full h-56 object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-500" onerror="this.src='/assets/images/default.png';" />
        <button class="absolute top-3 right-3 bg-white/80 hover:bg-pink-500 hover:text-white text-gray-700 rounded-full p-2 shadow transition z-10 quick-view-btn" data-product-id="${product.id}" title="Quick View">
          <i class="fas fa-eye"></i>
        </button>
      </div>
      <div class="p-4 flex-1 flex flex-col">
        <h3 class="text-lg font-semibold text-gray-800 mb-1">
          <a href="product/${product.id}" class="product-name-link" data-product-id="${product.id}">${product.name}</a>
        </h3>
        <p class="text-xs text-gray-500 mb-2">by <span class="font-medium text-indigo-600">${product.brand || ""}</span></p>
        <div class="flex items-center text-yellow-400 text-sm mb-2">
          <i class="fas fa-star"></i>
          <span class="ml-1 text-gray-700">${product.average_rating || 0} / 5</span>
          <span class="ml-2 text-gray-400">(${product.review_count || 0})</span>
        </div>
        <div class="flex items-center mb-2">
          <span class="text-xl font-bold text-green-600"><i class="fa-solid fa-naira-sign"></i>${formatMoneyAmount(product.price)}</span>
        </div>
        <div class="flex gap-2 flex-wrap mb-2">
          ${(product.categories || [])
            .map(
              (cat) =>
                `<span class="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">#${cat}</span>`
            )
            .join("")}
        </div>
        <div class="flex-1"></div>
        <button class="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 add-to-cart-btn" data-product-id="${product.id}">
          <i class="fas fa-shopping-cart mr-2"></i> Add to Cart
        </button>
      </div>
    </div>
  `;
}

/**
 * Render a list of product cards
 */
export function renderProductList(products) {
  if (!products.length) {
    return `<div class="col-span-full text-center text-gray-400 py-12 text-lg">No products found.</div>`;
  }
  return products.map(renderProductCard).join("");
}

/**
 * Attach all event listeners for product cards (quick view, add to cart, product detail)
 */
export function attachProductCardEvents(container, products) {
  // Quick View
  container.querySelectorAll(".quick-view-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const productId = btn.getAttribute("data-product-id");
      displayView(btn, supabase);
    });
  });

  // Add to Cart
  container.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const productId = btn.getAttribute("data-product-id");
      addToCart(productId);
      showNotification("Added to cart!", "success");
      // Optionally update cart badge here
    });
  });

  // Product name click: show product detail
  container.querySelectorAll(".product-name-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const productId = link.dataset.productId;
      window.loadPage && window.loadPage("productDetail", productId);
    });
  });

  // Make entire card clickable (except buttons)
  container.querySelectorAll(".js-product-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (
        e.target.closest(".quick-view-btn") ||
        e.target.closest(".add-to-cart-btn") ||
        e.target.closest(".product-name-link")
      )
        return;
      const productId = card.getAttribute("data-product-id");
      window.loadPage && window.loadPage("productDetail", productId);
    });
  });
}