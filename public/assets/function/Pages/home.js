import { startPreloader, endPreloader } from "../Util/preloader.js";
import { supabase } from "../Data/db.js";
import { loadPage } from "../Routes/route.js";
import { addToCart } from "../Shop/cart.js";
import { showNotification } from "../Util/notification.js";
import { formatMoneyAmount } from "../Util/format.js";
import { displayView } from "../Shop/modalView.js";
import { trackPageVisit } from "/assets/function/Util/analyticsLogger.js";

const defaultImg = new URL('/assets/images/default.png', import.meta.url).href;
const fallbackImg = new URL('/assets/images/products/armless-braid-hair-1.png', import.meta.url).href;

export default async function home(renderPageHTML) {
  startPreloader();
  window.scrollTo(0, 0);
  trackPageVisit({ page: "home" });

  // Fetch products from Supabase
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  endPreloader(500);

  if (error || !products) {
    renderPageHTML.innerHTML = `
      <div class="p-8 text-center text-red-600 text-lg font-semibold">
        Failed to load products. Please try again later.
      </div>
    `;
    return;
  }

  // Helper: Filter by category/tag/type
  const filterByCategory = (cat) =>
    products.filter((p) =>
      (p.categories || [])
        .map((c) => c.toLowerCase())
        .includes(cat.toLowerCase())
    );

  // Helper: Remove products already in a set
  function excludeProducts(list, excludeSet) {
    return list.filter((p) => !excludeSet.has(p.id));
  }

  // --- HOT ITEMS: 3 most recent, in stock ---
  const hotItems = products
    .filter((p) => p.stock > 0)
    .slice(0, 3);

  // --- Trending Tabs: 6 per category, show tags/names/types ---
  function trendingList(cat) {
    return products
      .filter((p) =>
        (p.categories || [])
          .map((c) => c.toLowerCase())
          .includes(cat.toLowerCase())
      )
      .slice(0, 6);
  }

  // --- On Sale: 4 most recent ---
  let usedIds = new Set();
  const onSale = products
    .filter((p) => {
      if (usedIds.has(p.id)) return false;
      usedIds.add(p.id);
      return true;
    })
    .slice(0, 4);

  // --- Best Seller: 4 highest price, not in onSale ---
  const bestSeller = excludeProducts(
    [...products]
      .sort((a, b) => (b.price || 0) - (a.price || 0)),
    new Set(onSale.map((p) => p.id))
  ).slice(0, 4);
  bestSeller.forEach((p) => usedIds.add(p.id));

  // --- Top View: 4 most reviews, not in onSale or bestSeller ---
  const topView = excludeProducts(
    [...products]
      .sort((a, b) => (b.review_count || 0) - (a.review_count || 0)),
    new Set([...onSale, ...bestSeller].map((p) => p.id))
  ).slice(0, 4);

  // Helper: Render product card
  const renderProductCard = (product, showQuickView = true) => {
    const img =
      (product.images && product.images[0]?.url) ||
      defaultImg;
    return `
      <div class="bg-white rounded-xl shadow hover:shadow-lg transition duration-300 flex flex-col group relative overflow-hidden js-product-card" data-product-id="${product.id}">
        <div class="relative">
          <img src="${img}" alt="${product.name}" loading="lazy" class="w-full h-56 object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-500" onerror="this.src='${fallbackImg}';" />
          ${showQuickView
        ? `<button class="absolute top-3 right-3 bg-white/80 hover:bg-pink-500 hover:text-white text-gray-700 rounded-full p-2 shadow transition z-10 quick-view-btn" data-product-id="${product.id}" title="Quick View">
                  <i class="fas fa-eye"></i>
                </button>`
        : ""
      }
        </div>
        <div class="p-4 flex-1 flex flex-col">
          <h3 class="text-lg font-semibold text-gray-800 mb-1">
            <a class="product-name-link cursor-pointer" data-product-id="${product.id}">${product.name}</a>
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
            ${(product.tags || [])
        .map(
          (tag) =>
            `<span class="px-2 py-0.5 text-xs bg-pink-100 text-pink-600 rounded-full">#${tag}</span>`
        )
        .join("")}
            ${product.type ? `<span class="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full">${product.type}</span>` : ""}
          </div>
          <div class="flex-1"></div>
          <button class="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 add-to-cart-btn" data-product-id="${product.id}">
            <i class="fas fa-shopping-cart mr-2"></i> Add to Cart
          </button>
        </div>
      </div>
    `;
  };

  // Helper: Render product list
  const renderProductList = (list, showQuickView = true) =>
    list.map((p) => renderProductCard(p, showQuickView)).join("");

  // Main HTML
  renderPageHTML.innerHTML = `
    <!-- Hero Section -->
    <section class="relative bg-cover bg-center bg-no-repeat min-h-[500px] flex items-center" style="background-image: url('./assets/images/theme/theme-5.jpg')">
      <div class="max-w-7xl mx-auto px-4 w-full">
        <div class="lg:ml-auto lg:w-1/2 bg-white bg-opacity-90 p-8 rounded-lg shadow-lg animate-fade-in-up">
          <h1 class="text-3xl sm:text-4xl font-extrabold text-primary leading-tight mb-4">
            <span class="text-pink-600">UP TO 20% OFF</span><br />Explore & Experience
          </h1>
          <p class="text-gray-700 mb-6 text-base sm:text-lg">
            The Amazing best offers<br />with reliable lookout,<br />and remarkable wears to fit our pride.
          </p>
          <button id="shop-now-btn" class="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition font-semibold shadow-md">
            Shop Now!
          </button>
        </div>
      </div>
    </section>

    <!-- Small Banner Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Banner 1 -->
          <div class="relative overflow-hidden rounded-xl shadow group">
            <img src="./assets/images/theme/hero-banner-2.jpg" alt="Hair Collection" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-center text-white p-6">
              <p class="text-sm tracking-wide mb-1">Hair Collections</p>
              <h3 class="text-xl md:text-2xl font-semibold leading-tight mb-3">Weekend Outing<br />Collection</h3>
              <button id="hair-collection" class="cursor-pointer inline-block bg-white text-primary px-5 py-2 text-sm rounded hover:bg-pink-600 hover:text-white transition">Discover Now</button>
            </div>
          </div>
          <!-- Banner 2 -->
          <div class="relative overflow-hidden rounded-xl shadow group">
            <img src="./assets/images/theme/hero-banner-3.jpg" alt="Dress Collection" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-center text-white p-6">
              <p class="text-sm tracking-wide mb-1">Dress Collections</p>
              <h3 class="text-xl md:text-2xl font-semibold leading-tight mb-3">Awesome Dress<br />2024</h3>
              <button id="dress-collection" class="cursor-pointer inline-block bg-white text-primary px-5 py-2 text-sm rounded hover:bg-pink-600 hover:text-white transition">Shop Now</button>
            </div>
          </div>
          <!-- Banner 3 -->
          <div class="relative overflow-hidden rounded-xl shadow group">
            <img src="./assets/images/theme/hero-banner-4.jpg" alt="Flash Sale" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-center text-white p-6">
              <p class="text-sm tracking-wide mb-1">Flash Sale</p>
              <h3 class="text-xl md:text-2xl font-semibold leading-tight mb-3">Mid Season<br />Up to <span class="text-pink-400 font-bold">20%</span> Off</h3>
              <button id="shop-collection" class="cursor-pointer inline-block bg-white text-primary px-5 py-2 text-sm rounded hover:bg-pink-600 hover:text-white transition">Discover Now</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trending Items Tabs -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-2xl md:text-3xl font-bold text-center mb-8">Trending Items</h2>
        <div class="flex justify-center gap-6 mb-8">
          <button id="women-trend" class="border-b-2 border-primary text-primary font-medium cursor-pointer">Women</button>
          <button id="hair-trend" class="cursor-pointer hover:text-primary">Hair</button>
          <button id="cosmetics-trend" class="cursor-pointer hover:text-primary">Cosmetics</button>
          <button id="dressing-trend" class="cursor-pointer hover:text-primary">Dressing</button>
        </div>
        <div id="trending-list" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-6">
          ${renderProductList(trendingList("women"))}
        </div>
      </div>
    </section>

    <!-- Medium Banner Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="relative overflow-hidden rounded-xl shadow group">
          <img src="./assets/images/theme/theme-4.png" alt="Women Hair" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div class="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-center text-white p-6">
            <p class="text-sm tracking-wide mb-1">Extraordinary Look</p>
            <h3 class="text-xl md:text-2xl font-semibold leading-tight mb-3">Women Hair<br />Up to <span class="text-pink-400 font-bold">20%</span></h3>
            <button id="hair-product-btn" class="inline-block bg-white text-primary px-5 py-2 text-sm rounded hover:bg-pink-600 hover:text-white transition">Shop Now</button>
          </div>
        </div>
        <div class="relative overflow-hidden rounded-xl shadow group">
          <img src="/assets/images/theme/theme-5.jpg" alt="Dressing Sensation" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div class="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-center text-white p-6">
            <p class="text-sm tracking-wide mb-1">Dressing Sensation</p>
            <h3 class="text-xl md:text-2xl font-semibold leading-tight mb-3">Mid Season<br />Up to <span class="text-pink-400 font-bold">10%</span></h3>
            <button id="dress-btn" class="inline-block bg-white text-primary px-5 py-2 text-sm rounded hover:bg-pink-600 hover:text-white transition">Shop Now</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Hot Items Section -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-800">Hot Items</h2>
        </div>
        <div id="hot-items-list" class="flex flex-wrap justify-center gap-6">
          ${renderProductList(hotItems)}
        </div>
      </div>
    </section>

    <!-- Shop Home List Section -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <!-- On Sale -->
          <div>
            <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">On Sale</h2>
            <div id="on-sale-list" class="space-y-4">
              ${renderProductList(onSale, false)}
            </div>
          </div>
          <!-- Best Seller -->
          <div>
            <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Best Seller</h2>
            <div id="best-seller-list" class="space-y-4">
              ${renderProductList(bestSeller, false)}
            </div>
          </div>
          <!-- Top Viewed -->
          <div>
            <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Top Viewed</h2>
            <div id="top-view-list" class="space-y-4">
              ${renderProductList(topView, false)}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Instagram Post Section -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">From Our Stories</h2>
          <p class="text-gray-500">See the latest highlights from our Instagram feed</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="instagram-feed">
          <div class="flex justify-center">
            <iframe src="https://www.instagram.com/p/C7ln8pVNvod/embed" loading="lazy" allowtransparency="true" allowfullscreen="true" class="w-full max-w-md h-[420px] border-2 border-pink-400 rounded-xl overflow-hidden shadow-lg hover:shadow-pink-300 transition duration-300 bg-white"></iframe>
          </div>
          <div class="flex justify-center">
            <iframe src="https://www.instagram.com/reel/C8hFGActjoA/embed" loading="lazy" allowtransparency="true" allowfullscreen="true" class="w-full max-w-md h-[420px] border-2 border-pink-400 rounded-xl overflow-hidden shadow-lg hover:shadow-pink-300 transition duration-300 bg-white"></iframe>
          </div>
          <div class="flex justify-center">
            <iframe src="https://www.instagram.com/p/C7eEsTFtUsa/embed" loading="lazy" allowtransparency="true" allowfullscreen="true" class="w-full max-w-md h-[420px] border-2 border-pink-400 rounded-xl overflow-hidden shadow-lg hover:shadow-pink-300 transition duration-300 bg-white"></iframe>
          </div>
        </div>
        <div class="text-center mt-10">
          <a href="https://www.instagram.com/mk_signasures" target="_blank"
            class="inline-flex items-center gap-2 px-6 py-2 bg-pink-500 text-white rounded-full shadow hover:bg-pink-600 transition">
            <i class="fab fa-instagram text-xl"></i>
            Follow @mk_signasures
          </a>
        </div>
      </div>
    </section>

    <!-- Shop Services Area -->
    <section class="bg-white py-16">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div class="p-6 rounded-lg shadow hover:shadow-lg transition duration-300">
            <div class="text-4xl text-primary mb-4"><i class="fas fa-shipping-fast"></i></div>
            <h4 class="text-lg font-semibold mb-1">Free Shipping</h4>
            <p class="text-gray-500 text-sm">Orders over #100K</p>
          </div>
          <div class="p-6 rounded-lg shadow hover:shadow-lg transition duration-300">
            <div class="text-4xl text-primary mb-4"><i class="fas fa-undo"></i></div>
            <h4 class="text-lg font-semibold mb-1">Free Return</h4>
            <p class="text-gray-500 text-sm">Within 30 days returns</p>
          </div>
          <div class="p-6 rounded-lg shadow hover:shadow-lg transition duration-300">
            <div class="text-4xl text-primary mb-4"><i class="fas fa-lock"></i></div>
            <h4 class="text-lg font-semibold mb-1">Secure Payment</h4>
            <p class="text-gray-500 text-sm">100% secure payment</p>
          </div>
          <div class="p-6 rounded-lg shadow hover:shadow-lg transition duration-300">
            <div class="text-4xl text-primary mb-4"><i class="fas fa-tags"></i></div>
            <h4 class="text-lg font-semibold mb-1">Best Price</h4>
            <p class="text-gray-500 text-sm">Guaranteed price</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Shop Newsletter -->
    <section class="bg-primary py-16">
      <div class="max-w-3xl mx-auto text-center text-white px-4">
        <h4 class="text-2xl font-semibold mb-2">Newsletter</h4>
        <p class="mb-6 text-sm">
          Subscribe to our newsletter and get
          <span class="text-pink-300 font-bold">10%</span> off your shipping cost
        </p>
        <form name="contact-form" class="flex flex-col sm:flex-row justify-center gap-4 js-newsletter-form">
          <input type="email" name="EMAIL" id="nEmail" placeholder="Your email address" required
            class="w-full sm:w-auto px-4 py-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500" />
          <button type="submit"
            class="bg-white text-primary px-6 py-2 rounded-md font-semibold hover:bg-pink-600 hover:text-white transition">
            Subscribe
          </button>
        </form>
      </div>
    </section>
    <div id="modal-placeholder"></div>
  `;

  // Event Listeners
  setHomeEventListeners(products, renderProductCard, trendingList);
}

function setHomeEventListeners(products, renderProductCard, trendingList) {
  // Shop Now button
  document
    .getElementById("shop-now-btn")
    ?.addEventListener("click", () => loadPage("shop"));

  // Banner buttons
  document
    .getElementById("hair-collection")
    ?.addEventListener("click", () => loadPage("hair"));
  document
    .getElementById("dress-collection")
    ?.addEventListener("click", () => loadPage("women"));
  document
    .getElementById("shop-collection")
    ?.addEventListener("click", () => loadPage("shop"));
  document
    .getElementById("hair-product-btn")
    ?.addEventListener("click", () => loadPage("hair"));
  document
    .getElementById("dress-btn")
    ?.addEventListener("click", () => loadPage("women"));

  // Trending Tabs
  const trendingTabs = [
    { id: "women-trend", cat: "women" },
    { id: "hair-trend", cat: "hair" },
    { id: "cosmetics-trend", cat: "cosmetics" },
    { id: "dressing-trend", cat: "dressing" },
  ];
  trendingTabs.forEach(({ id, cat }) => {
    document.getElementById(id)?.addEventListener("click", () => {
      trendingTabs.forEach(({ id: tabId }) => {
        document
          .getElementById(tabId)
          ?.classList.remove("border-b-2", "border-primary", "text-primary");
      });
      document
        .getElementById(id)
        ?.classList.add("border-b-2", "border-primary", "text-primary");
      const filtered = trendingList(cat);
      document.getElementById("trending-list").innerHTML = filtered
        .map((p) => renderProductCard(p))
        .join("");
      setProductCardEvents(products, renderProductCard);
    });
  });

  // Product Card Events (Quick View, Add to Cart)
  setProductCardEvents(products, renderProductCard);

  // Newsletter
  document
    .querySelector(".js-newsletter-form")
    ?.addEventListener("submit", (e) => {
      e.preventDefault();
      showNotification("Subscribed successfully!", "success");
      e.target.reset();
    });
}

function setProductCardEvents(products, renderProductCard) {
  // Quick View
  document.querySelectorAll(".quick-view-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const productId = btn.getAttribute("data-product-id");
      const supabase = (await import("../Data/db.js")).supabase;
      displayView(btn, supabase);
    });
  });

  // Add to Cart
  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const productId = btn.getAttribute("data-product-id");
      addToCart(productId);
      showNotification("Added to cart!", "success");
    });
  });

  // Product name click
  document.querySelectorAll(".product-name-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const productId = link.dataset.productId;
      if (!productId) return;
      loadPage("productDetail", productId);
    });
  });

  // Card click
  document.querySelectorAll(".js-product-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (
        e.target.closest(".quick-view-btn") ||
        e.target.closest(".add-to-cart-btn") ||
        e.target.closest(".product-name-link")
      )
        return;
      const productId = card.getAttribute("data-product-id");
      if (!productId) return;
      loadPage("productDetail", productId);
    });
  });
}