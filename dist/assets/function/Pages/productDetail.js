import { supabase } from "../Data/db.js";
import { addToCart } from "../Shop/cart.js";
import { showNotification } from "../Util/notification.js";
import { formatMoneyAmount } from "../Util/format.js";
import { startPreloader, endPreloader } from "../Util/preloader.js";
import { trackPageVisit } from "/assets/function/Util/analyticsLogger.js";

// Small spinner for buttons and inline loading
const smallSpinner = `
  <span class="inline-block align-middle ml-2">
    <svg class="animate-spin h-5 w-5 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
  </span>
`;

// Large spinner for image loading
const spinnerHTML = `
  <div class="absolute inset-0 flex justify-center items-center bg-white/70 z-10" id="img-spinner">
    <svg class="animate-spin h-12 w-12 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
  </div>
`;

export default async function productDetail(renderPageHTML, productId) {
  startPreloader();
  window.scrollTo(0, 0);
  trackPageVisit({ page: "productDetail", productId });

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
  const tags =
    Array.isArray(product.categories) && product.categories.length > 0
      ? product.categories
      : Array.isArray(product.tags)
        ? product.tags
        : [];

  // --- Flexible Variant Logic ---
  // product.variants = [{ name: "Length", options: ["1cm", "2cm", "3cm"] }, ...]
  const variants = Array.isArray(product.variants) ? product.variants : [];
  // Build variant selection state
  const variantSelections = {};
  variants.forEach(v => {
    if (Array.isArray(v.options) && v.options.length > 0) {
      variantSelections[v.name] = v.options[0];
    }
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
            <span class="font-semibold text-pink-700">${review.user || "Anonymous"
          }</span>
            <span class="text-yellow-400"><i class="fas fa-star"></i> ${review.rating || 0
          }</span>
            <span class="text-xs text-gray-400">${review.created_at
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

  // Render variant selectors (flexible)
  function renderVariantSelectors() {
    if (!variants.length) return "";
    return `
      <div class="mb-4">
        <h4 class="text-sm text-gray-800 font-semibold mb-2">Choose Options</h4>
        <div class="flex flex-col gap-2">
          ${variants
        .map(
          (variant) => `
            <div>
              <label class="font-semibold capitalize">${variant.name}:</label>
              <select name="variant-${variant.name}" class="variant-select border rounded px-2 py-1 ml-2 focus:ring-2 focus:ring-pink-400">
                ${Array.isArray(variant.options)
              ? variant.options
                .map(
                  (val, idx) =>
                    `<option value="${val}" ${idx === 0 ? "selected" : ""
                    }>${val}</option>`
                )
                .join("")
              : ""
            }
              </select>
            </div>
          `
        )
        .join("")}
        </div>
      </div>
    `;
  }

  // Render attributes
  function renderAttributes() {
    if (
      !product.attributes ||
      typeof product.attributes !== "object" ||
      Object.keys(product.attributes).length === 0
    ) {
      return "";
    }
    return `<div class="mt-4">
      <h4 class="font-semibold mb-2">Attributes</h4>
      <ul class="list-disc ml-6 text-gray-600">
        ${Object.entries(product.attributes)
        .map(
          ([key, value]) =>
            `<li><span class="font-semibold capitalize">${key}:</span> ${value}</li>`
        )
        .join("")}
      </ul>
    </div>`;
  }

  // Render HTML
  renderPageHTML.innerHTML = `
    <section class="py-10 bg-gray-50 min-h-screen animate-fade-in-up">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex flex-col md:flex-row gap-10">
          <!-- Product Images -->
          <div class="md:w-1/2 w-full">
            <div class="bg-white rounded-xl shadow p-4 relative" id="img-spinner-container">
              ${spinnerHTML}
              <img id="main-detail-img" src="${mainImg}" alt="${product.name
    }" class="w-full h-96 object-cover rounded-xl transition-all duration-300 opacity-0" loading="lazy" onerror="this.src='/assets/images/default.png';" />
              ${images.length > 1
      ? `<div class="flex gap-2 mt-4" id="detail-thumbnails">
                      ${images
        .slice(0, 5)
        .map(
          (img, idx) =>
            `<img src="${img.url
            }" alt="thumb" data-idx="${idx}" class="w-16 h-16 object-cover rounded border hover:ring-2 hover:ring-pink-400 transition cursor-pointer ${idx === 0 ? "ring-2 ring-pink-400" : ""
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
            <h1 class="text-3xl font-bold text-gray-800 mb-2 animate-fade-in-up">${product.name
    }</h1>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-yellow-400 text-lg"><i class="fas fa-star"></i></span>
              <span class="text-gray-700 font-semibold" id="average-rating">${product.average_rating || 0} / 5</span>
              <span class="text-gray-400" id="review-count">(${product.review_count || 0} reviews)</span>
            </div>
            <div class="mb-4">
              <span class="text-2xl font-bold text-green-600"><i class="fa-solid fa-naira-sign"></i>${formatMoneyAmount(
      product.price
    )}</span>
              ${product.old_price
      ? `<span class="ml-2 text-lg text-gray-400 line-through"><i class="fa-solid fa-naira-sign"></i>${formatMoneyAmount(
        product.old_price
      )}</span>`
      : ""
    }
            </div>
            <div class="mb-4">
              <span class="text-sm ${inStock ? "text-green-700" : "text-red-600"
    } font-semibold">
                <i class="fas ${inStock ? "fa-check-circle" : "fa-times-circle"
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
              <span class="text-xs text-gray-400">SKU: ${product.sku || ""
    }</span>
            </div>
            <div class="flex items-center gap-4 mb-6">
              <label for="detail-quantity" class="text-sm font-medium">Quantity:</label>
              <input id="detail-quantity" type="number" min="1" max="100" value="1" class="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-pink-400" />
            </div>
            <button id="detail-add-to-cart" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold text-lg shadow transition-all duration-300 flex items-center justify-center">
              <i class="fas fa-shopping-cart mr-2"></i> Add to Cart
              <span id="cart-spinner" class="hidden">${smallSpinner}</span>
            </button>
          </div>
        </div>
        <!-- Tabs for Description, Reviews, and Full Description -->
        <div class="mt-12 bg-white rounded-xl shadow p-6">
          <div class="flex gap-8 border-b mb-6">
            <button class="tab-btn font-semibold text-gray-700 border-b-2 border-indigo-600 pb-2" data-tab="desc">Description</button>
            <button class="tab-btn font-semibold text-gray-500 hover:text-indigo-600 pb-2" data-tab="reviews">Reviews</button>
            <button class="tab-btn font-semibold text-gray-500 hover:text-indigo-600 pb-2" data-tab="full-desc">Full Description</button>
          </div>
          <div id="tab-desc" class="tab-content">
            <h3 class="text-lg font-bold mb-2">Product Description</h3>
            <p class="text-gray-700 mb-4">${product.description || "No description available."
    }</p>
            ${renderAttributes()}
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
              <button type="submit" class="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition flex items-center justify-center" id="review-submit-btn">
                <span>Submit Review</span>
                <span id="review-spinner" class="hidden">${smallSpinner}</span>
              </button>
            </form>
          </div>
          <div id="tab-full-desc" class="tab-content hidden">
            <h3 class="text-lg font-bold mb-2">Full Product Details</h3>
            <div class="text-gray-700 mb-4 whitespace-pre-line">
              ${product.full_description ? product.full_description : `<span class="text-gray-400">No details available.</span>`}
            </div>
          </div>
          <div>
      </div>
    </section>
  `;

  // --- JS Interactivity ---

  // Spinner for images
  const mainImgEl = renderPageHTML.querySelector("#main-detail-img");
  const imgSpinnerContainer = renderPageHTML.querySelector("#img-spinner-container");
  const imgSpinner = imgSpinnerContainer.querySelector("#img-spinner");
  mainImgEl.onload = () => {
    mainImgEl.classList.remove("opacity-0");
    imgSpinner?.remove();
  };
  // If image fails to load, remove spinner anyway
  mainImgEl.onerror = () => {
    mainImgEl.classList.remove("opacity-0");
    imgSpinner?.remove();
    mainImgEl.src = "/assets/images/default.png";
  };

  // Tab switching
  const tabBtns = renderPageHTML.querySelectorAll(".tab-btn");
  const tabDesc = renderPageHTML.querySelector("#tab-desc");
  const tabReviews = renderPageHTML.querySelector("#tab-reviews");
  const tabFullDesc = renderPageHTML.querySelector("#tab-full-desc");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) =>
        b.classList.remove("border-indigo-600", "text-gray-700")
      );
      btn.classList.add("border-indigo-600", "text-gray-700");
      tabDesc.classList.add("hidden");
      tabReviews.classList.add("hidden");
      tabFullDesc.classList.add("hidden");
      if (btn.dataset.tab === "desc") tabDesc.classList.remove("hidden");
      if (btn.dataset.tab === "reviews") tabReviews.classList.remove("hidden");
      if (btn.dataset.tab === "full-desc") tabFullDesc.classList.remove("hidden");
    });
  });

  // Image thumbnail click: change main image
  if (images.length > 1) {
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
  const cartSpinner = renderPageHTML.querySelector("#cart-spinner");
  const quantityInput = renderPageHTML.querySelector("#detail-quantity");
  addCartBtn.addEventListener("click", () => {
    const qty = Math.max(1, Math.min(100, Number(quantityInput.value) || 1));
    // Collect selected variants
    const selectedVariants = {};
    variants.forEach((variant) => {
      const select = renderPageHTML.querySelector(
        `select[name="variant-${variant.name}"]`
      );
      selectedVariants[variant.name] = select ? select.value : (Array.isArray(variant.options) ? variant.options[0] : "");
    });
    if (!inStock) {
      showNotification("Product is out of stock. Delivery may take longer than usual.", "warning");
      return;
    }
    cartSpinner.classList.remove("hidden");
    setTimeout(() => {
      addToCart(product.id, qty, selectedVariants);
      showNotification("Added to cart!", "success");
      addCartBtn.classList.add("animate-bounce");
      cartSpinner.classList.add("hidden");
      setTimeout(() => addCartBtn.classList.remove("animate-bounce"), 700);
    }, 600);
  });

  // --- Review form functionality ---
  const reviewForm = renderPageHTML.querySelector("#review-form");
  const reviewsList = renderPageHTML.querySelector("#reviews-list");
  const reviewSubmitBtn = renderPageHTML.querySelector("#review-submit-btn");
  const reviewSpinner = renderPageHTML.querySelector("#review-spinner");
  reviewForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    reviewSpinner.classList.remove("hidden");
    reviewSubmitBtn.setAttribute("disabled", "disabled");
    const formData = new FormData(reviewForm);
    const user = formData.get("user")?.trim() || "Anonymous";
    const rating = Math.max(
      1,
      Math.min(5, Number(formData.get("rating")) || 5)
    );
    const comment = formData.get("comment")?.trim() || "";
    const created_at = new Date().toISOString();

    // Defensive: ensure reviews is array and append, not replace
    let reviews = Array.isArray(product.reviews) ? [...product.reviews] : [];
    reviews.push({ user, rating, comment, created_at });

    // Calculate new average rating and review count
    const review_count = reviews.length;
    const average_rating =
      Math.round(
        (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
          review_count) *
        10
      ) / 10;

    // Update Supabase (append, not replace)
    const { error: updateError } = await supabase
      .from("products")
      .update({ reviews, review_count, average_rating })
      .eq("id", product.id);

    reviewSpinner.classList.add("hidden");
    reviewSubmitBtn.removeAttribute("disabled");

    if (updateError) {
      showNotification("Failed to submit review. Please try again.", "error");
      return;
    }

    // Update UI
    reviewsList.innerHTML = renderReviews(reviews);
    renderPageHTML.querySelector("#average-rating").textContent = `${average_rating} / 5`;
    renderPageHTML.querySelector("#review-count").textContent = `(${review_count} reviews)`;
    showNotification("Thank you for your review!", "success");
    reviewForm.reset();
    // Also update product.reviews for next review
    product.reviews = reviews;
  });
}