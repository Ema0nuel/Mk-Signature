import {
  fetchAllProducts,
  renderProductList,
  attachProductCardEvents,
  searchProducts,
} from "../Shop/ShopFunction.js";

import { trackPageVisit } from "/assets/function/Util/analyticsLogger.js";

export default async function shop(renderPageHTML) {
  window.scrollTo(0, 0);
  trackPageVisit({ page: "shop" });
  renderPageHTML.innerHTML = `
    <section class="py-10 bg-gray-50 min-h-screen">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 class="text-3xl font-bold text-gray-800">Shop All Products</h1>
          <div class="flex items-center gap-2">
            <input type="text" id="shop-search" placeholder="Search products..." class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 w-64" />
            <button id="shop-search-btn" class="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"><i class="fas fa-search"></i></button>
          </div>
        </div>
        <div id="shop-products" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"></div>
      </div>
    </section>
  `;

  const products = await fetchAllProducts();
  const productsContainer = renderPageHTML.querySelector("#shop-products");
  let currentProducts = products;

  // Initial render
  productsContainer.innerHTML = renderProductList(currentProducts);
  attachProductCardEvents(productsContainer, currentProducts);

  // Search functionality
  const searchInput = renderPageHTML.querySelector("#shop-search");
  const searchBtn = renderPageHTML.querySelector("#shop-search-btn");

  function doSearch() {
    const query = searchInput.value;
    const filtered = searchProducts(products, query);
    currentProducts = filtered;
    productsContainer.innerHTML = renderProductList(filtered);
    attachProductCardEvents(productsContainer, filtered);
  }

  searchInput.addEventListener("input", doSearch);
  searchBtn.addEventListener("click", doSearch);
}
