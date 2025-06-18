import { supabase } from "../Data/db.js";
import { addToCart } from "../Shop/cart.js";
import { showNotification } from "../Util/notification.js";
import { formatMoneyAmount } from "../Util/format.js";
import { startPreloader, endPreloader } from "../Util/preloader.js";

export default async function productDetail(renderPageHTML, productId) {
  startPreloader();
  window.scrollTo(0, 0);

  // Fetch product by ID
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  endPreloader(100);

  if (error || !product) {
    renderPageHTML.innerHTML = `
      <div class="p-8 text-center text-red-600 text-lg font-semibold">
        Product not found. Please try again later.
      </div>
    `;
    return;
  }

  // Defensive: always arrays
  const images = Array.isArray(product.images) ? product.images : [];
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const tags =
    Array.isArray(product.categories) && product.categories.length > 0
      ? product.categories
      : Array.isArray(product.tags)
      ? product.tags
      : [];

  // Collect all variant keys (e.g. size, color)
  let variantKeys = [];
  variants.forEach((v) => {
    Object.keys(v).forEach((k) => {
      if (!variantKeys.includes(k) && !["stock", "price"].includes(k)) {
        variantKeys.push(k);
      }
    });
  });

  // Build variant options for selects
  const variantOptions = {};
  variantKeys.forEach((key) => {
    variantOptions[key] = [
      ...new Set(variants.map((v) => v[key]).filter(Boolean)),
    ];
  });

  // Default variant selection (first available)
  const defaultVariant = {};
  variantKeys.forEach((key) => {
    defaultVariant[key] = variantOptions[key][0];
  });

  // Stock logic
  const inStock = typeof product.stock === "number" ? product.stock > 0 : true;
  const mainImg =
    images[0]?.url || "/assets/images/default.png";

  // Helper: Render reviews
  function renderReviews(reviews) {
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return `<p class="text-gray-500">No reviews yet. Be the first to review this product!</p>`;
    }
    return reviews
      .map(
        (review) => `
        <div class="mb-4 border-b pb-4 bg-gray-50 rounded-lg px-4 py-2">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-semibold text-pink-700">${
              review.user || "Anonymous"
            }</span>
            <span class="text-yellow-400"><i class="fas fa-star"></i> ${
              review.rating || 0
            }</span>
            <span class="text-xs text-gray-400">${
              review.created_at
                ? new Date(review.created_at).toLocaleDateString()
                : ""
            }</span>
          </div>
          <p class="text-gray-700 italic">"${review.comment || ""}"</p>
        </div>
      `
      )
      .join("");
  }

  // Render variant selectors
  function renderVariantSelectors() {
    if (!variantKeys.length) return "";
    return `
      <div class="mb-4">
        <h4 class="text-sm text-gray-800 font-semibold mb-2">Choose Options</h4>
        <div class="flex flex-col gap-2">
          ${variantKeys
            .map(
              (key) => `
            <div>
              <label class="font-semibold capitalize">${key}:</label>
              <select name="variant-${key}" class="variant-select border rounded px-2 py-1 ml-2 focus:ring-2 focus:ring-pink-400">
                ${variantOptions[key]
                  .map(
                    (val) =>
                      `<option value="${val}" ${
                        val === defaultVariant[key] ? "selected" : ""
                      }>${val}</option>`
                  )
                  .join("")}
              </select>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  // Render HTML
  renderPageHTML.innerHTML = `
    <section class="py-10 bg-gray-50 min-h-screen animate-fade-in-up">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex flex-col md:flex-row gap-10">
          <!-- Product Images -->
          <div class="md:w-1/2 w-full">
            <div class="bg-white rounded-xl shadow p-4">
              <img id="main-detail-img" src="${mainImg}" alt="${
    product.name
  }" class="w-full h-96 object-cover rounded-xl transition-all duration-300" loading="lazy" onerror="this.src='/assets/images/default.png';" />
              ${
                images.length > 1
                  ? `<div class="flex gap-2 mt-4" id="detail-thumbnails">
                      ${images
                        .slice(0, 5)
                        .map(
                          (img, idx) =>
                            `<img src="${
                              img.url
                            }" alt="thumb" data-idx="${idx}" class="w-16 h-16 object-cover rounded border hover:ring-2 hover:ring-pink-400 transition cursor-pointer ${
                              idx === 0 ? "ring-2 ring-pink-400" : ""
                            }" loading="lazy" onerror="this.src='/assets/images/default.png';" />`
                        )
                        .join("")}
                    </div>`
                  : ""
              }
            </div>
          </div>
          <!-- Product Details -->
          <div class="md:w-1/2 w-full flex flex-col">
            <h1 class="text-3xl font-bold text-gray-800 mb-2 animate-fade-in-up">${
              product.name
            }</h1>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-yellow-400 text-lg"><i class="fas fa-star"></i></span>
              <span class="text-gray-700 font-semibold">${
                product.average_rating || 0
              } / 5</span>
              <span class="text-gray-400">(${
                product.review_count || 0
              } reviews)</span>
            </div>
            <div class="mb-4">
              <span class="text-2xl font-bold text-green-600"><i class="fa-solid fa-naira-sign"></i>${formatMoneyAmount(
                product.price
              )}</span>
              ${
                product.old_price
                  ? `<span class="ml-2 text-lg text-gray-400 line-through"><i class="fa-solid fa-naira-sign"></i>${formatMoneyAmount(
                      product.old_price
                    )}</span>`
                  : ""
              }
            </div>
            <div class="mb-4">
              <span class="text-sm ${
                inStock ? "text-green-700" : "text-red-600"
              } font-semibold">
                <i class="fas ${
                  inStock ? "fa-check-circle" : "fa-times-circle"
                } mr-1"></i>
                ${inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
            <div class="mb-4">
              <p class="text-gray-600">${product.description || ""}</p>
            </div>
            ${renderVariantSelectors()}
            <div class="mb-4 flex gap-2 flex-wrap">
              ${tags
                .map(
                  (tag) =>
                    `<span class="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">#${tag}</span>`
                )
                .join("")}
            </div>
            <div class="mb-4">
              <span class="text-xs text-gray-400">SKU: ${
                product.sku || ""
              }</span>
            </div>
            <div class="flex items-center gap-4 mb-6">
              <label for="detail-quantity" class="text-sm font-medium">Quantity:</label>
              <input id="detail-quantity" type="number" min="1" max="100" value="1" class="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-pink-400" />
            </div>
            <button id="detail-add-to-cart" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold text-lg shadow transition-all duration-300">
              <i class="fas fa-shopping-cart mr-2"></i> Add to Cart
            </button>
          </div>
        </div>
        <!-- Tabs for Description and Reviews -->
        <div class="mt-12 bg-white rounded-xl shadow p-6">
          <div class="flex gap-8 border-b mb-6">
            <button class="tab-btn font-semibold text-gray-700 border-b-2 border-indigo-600 pb-2" data-tab="desc">Description</button>
            <button class="tab-btn font-semibold text-gray-500 hover:text-indigo-600 pb-2" data-tab="reviews">Reviews</button>
          </div>
          <div id="tab-desc" class="tab-content">
            <h3 class="text-lg font-bold mb-2">Product Description</h3>
            <p class="text-gray-700 mb-4">${
              product.description || "No description available."
            }</p>
            <ul class="list-disc ml-6 text-gray-600">
              <li>High quality and durable</li>
              <li>Modern design</li>
              <li>Fast delivery</li>
              <li>Best for you</li>
            </ul>
            ${
              product.attributes && typeof product.attributes === "object"
                ? `<div class="mt-4">
                    <h4 class="font-semibold mb-2">Attributes</h4>
                    <ul class="list-disc ml-6 text-gray-600">
                      ${Object.entries(product.attributes)
                        .map(
                          ([key, value]) =>
                            `<li><span class="font-semibold capitalize">${key}:</span> ${value}</li>`
                        )
                        .join("")}
                    </ul>
                  </div>`
                : ""
            }
          </div>
          <div id="tab-reviews" class="tab-content hidden">
            <h3 class="text-lg font-bold mb-2">Customer Reviews</h3>
            <div id="reviews-list">
              ${renderReviews(product.reviews)}
            </div>
            <form id="review-form" class="mt-6">
              <h4 class="font-semibold mb-2">Add a Review</h4>
              <div class="flex gap-4 mb-2">
                <input type="text" name="user" placeholder="Your Name" required class="border px-2 py-1 rounded w-1/2" />
                <input type="number" name="rating" min="1" max="5" placeholder="Rating (1-5)" required class="border px-2 py-1 rounded w-1/4" />
              </div>
              <textarea name="comment" rows="3" placeholder="Your review..." required class="border px-2 py-1 rounded w-full mb-2"></textarea>
              <button type="submit" class="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition">Submit Review</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  `;

  // --- JS Interactivity ---

  // Tab switching
  const tabBtns = renderPageHTML.querySelectorAll(".tab-btn");
  const tabDesc = renderPageHTML.querySelector("#tab-desc");
  const tabReviews = renderPageHTML.querySelector("#tab-reviews");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) =>
        b.classList.remove("border-indigo-600", "text-gray-700")
      );
      btn.classList.add("border-indigo-600", "text-gray-700");
      if (btn.dataset.tab === "desc") {
        tabDesc.classList.remove("hidden");
        tabReviews.classList.add("hidden");
      } else {
        tabDesc.classList.add("hidden");
        tabReviews.classList.remove("hidden");
      }
    });
  });

  // Image thumbnail click: change main image
  if (images.length > 1) {
    const mainImgEl = renderPageHTML.querySelector("#main-detail-img");
    const thumbs = renderPageHTML.querySelectorAll("#detail-thumbnails img");
    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", function () {
        thumbs.forEach((t) => t.classList.remove("ring-2", "ring-pink-400"));
        this.classList.add("ring-2", "ring-pink-400");
        mainImgEl.src = this.src;
      });
    });
  }

  // Add to Cart with variants
  const addCartBtn = renderPageHTML.querySelector("#detail-add-to-cart");
  const quantityInput = renderPageHTML.querySelector("#detail-quantity");
  addCartBtn.addEventListener("click", () => {
    const qty = Math.max(1, Math.min(100, Number(quantityInput.value) || 1));
    // Collect selected variants
    const selectedVariants = {};
    variantKeys.forEach((key) => {
      const select = renderPageHTML.querySelector(
        `select[name="variant-${key}"]`
      );
      selectedVariants[key] = select ? select.value : defaultVariant[key];
    });
    addToCart(product.id, qty, selectedVariants);
    showNotification("Added to cart!", "success");
    addCartBtn.classList.add("animate-bounce");
    setTimeout(() => addCartBtn.classList.remove("animate-bounce"), 700);
  });

  // --- Review form functionality ---
  const reviewForm = renderPageHTML.querySelector("#review-form");
  const reviewsList = renderPageHTML.querySelector("#reviews-list");
  reviewForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(reviewForm);
    const user = formData.get("user")?.trim() || "Anonymous";
    const rating = Math.max(
      1,
      Math.min(5, Number(formData.get("rating")) || 5)
    );
    const comment = formData.get("comment")?.trim() || "";
    const created_at = new Date().toISOString();

    // Defensive: ensure reviews is array
    let reviews = Array.isArray(product.reviews) ? [...product.reviews] : [];
    reviews.unshift({ user, rating, comment, created_at });

    // Update Supabase
    const { error: updateError } = await supabase
      .from("products")
      .update({ reviews })
      .eq("id", product.id);

    if (updateError) {
      showNotification("Failed to submit review. Please try again.", "error");
      return;
    }

    // Update UI
    reviewsList.innerHTML = renderReviews(reviews);
    showNotification("Thank you for your review!", "success");
    reviewForm.reset();
  });
}
