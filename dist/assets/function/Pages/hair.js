import {
  fetchAllProducts,
  filterProductsByCategory,
  renderProductList,
  attachProductCardEvents,
  searchProducts,
} from "../Shop/ShopFunction.js";
import { trackPageVisit } from "/assets/function/Util/analyticsLogger.js";

export default async function hair(renderPageHTML) {
  window.scrollTo(0, 0);
  trackPageVisit({ page: "hair" });
  renderPageHTML.innerHTML = `
    <section class="py-10 bg-gray-50 min-h-screen">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 class="text-3xl font-bold text-gray-800">Hair Products</h1>
          <div class="flex items-center gap-2">
            <input type="text" id="hair-search" placeholder="Search hair products..." class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 w-64" />
            <button id="hair-search-btn" class="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"><i class="fas fa-search"></i></button>
          </div>
        </div>
        <div id="hair-products" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"></div>
      </div>
    </section>
  `;

  const allProducts = await fetchAllProducts();
  let hairProducts = filterProductsByCategory(allProducts, "hair");
  const productsContainer = renderPageHTML.querySelector("#hair-products");

  // Initial render
  productsContainer.innerHTML = renderProductList(hairProducts);
  attachProductCardEvents(productsContainer, hairProducts);

  // Search functionality
  const searchInput = renderPageHTML.querySelector("#hair-search");
  const searchBtn = renderPageHTML.querySelector("#hair-search-btn");

  function doSearch() {
    const query = searchInput.value;
    const filtered = searchProducts(hairProducts, query);
    productsContainer.innerHTML = renderProductList(filtered);
    attachProductCardEvents(productsContainer, filtered);
  }

  searchInput.addEventListener("input", doSearch);
  searchBtn.addEventListener("click", doSearch);
}
