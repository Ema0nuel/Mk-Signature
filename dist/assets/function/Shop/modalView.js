import { startPreloader, endPreloader } from "../Util/preloader.js";
import { formatMoneyAmount } from "../Util/format.js";
import { addToCart } from "./cart.js";

// Append modal directly to document.body with animation
export async function displayView(viewBtn, supabase) {
  const productId = viewBtn.getAttribute("data-product-id");

  startPreloader();

  let product = null,
    error = null;
  try {
    const res = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();
    product = res.data;
    error = res.error;
  } catch (e) {
    error = e;
  }

  endPreloader(10);

  // Remove any existing modal
  document.getElementById("product-modal")?.remove();

  if (error || !product) {
    const errorModal = document.createElement("div");
    errorModal.id = "product-modal";
    errorModal.className =
      "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8";
    errorModal.innerHTML = `
      <div class="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center animate-modal-in">
        <h2 class="text-xl font-bold text-red-600 mb-4">Product Not Found</h2>
        <p class="text-gray-600 mb-6">Sorry, we couldn't load this product.</p>
        <button id="close-modal" class="bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-pink-700 transition">Close</button>
      </div>
    `;
    document.body.appendChild(errorModal);
    document.getElementById("close-modal").onclick = () => closeModal();
    document.body.classList.add("overflow-hidden");
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

  // Only show up to 2 variant types (e.g. color, size)
  // Find all keys used in variants, then pick the first two unique keys (excluding stock/price)
  let variantKeys = [];
  variants.forEach((v) => {
    Object.keys(v).forEach((k) => {
      if (!variantKeys.includes(k) && !["stock", "price"].includes(k)) {
        variantKeys.push(k);
      }
    });
  });
  variantKeys = variantKeys.slice(0, 2);

  // Stock logic
  const inStock = typeof product.stock === "number" ? product.stock > 0 : true;

  // Modal HTML
  const modal = document.createElement("div");
  modal.id = "product-modal";
  modal.className =
    "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8 overflow-y-auto";
  modal.innerHTML = `
    <div class="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl animate-modal-in p-6 md:p-8">
      <button id="close-modal" class="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-xl transition">
        <i class="fas fa-times"></i>
      </button>
      <div class="flex flex-col md:flex-row gap-6">
        <div class="w-full md:w-1/2">
          <img id="main-modal-img" src="${
            images[0]?.url || "/assets/images/default.png"
          }"
               alt="${product.name}"
               class="rounded-xl w-full object-cover shadow-md"
               loading="lazy"
               onerror="this.src='/assets/images/default.png';" />
          ${images.length > 1
            ? `<div class="flex gap-2 mt-3" id="modal-thumbnails">
                  ${images
                    .slice(0, 4)
                    .map(
                      (img, idx) =>
                        `<img src="${
                          img.url
                        }" alt="thumb" data-idx="${idx}" class="w-12 h-12 object-cover rounded border hover:ring-2 hover:ring-pink-400 transition cursor-pointer ${
                          idx === 0 ? "ring-2 ring-pink-400" : ""
                        }" loading="lazy" onerror="this.src='/assets/images/default.png';" />`
                    )
                    .join("")}
                </div>`
              : ""
          }
        </div>
        <div class="w-full md:w-1/2 space-y-4">
          <h2 class="text-2xl font-semibold text-gray-800">${product.name}</h2>
          <p class="text-sm text-gray-500">
            by <span class="font-medium text-indigo-600">${
              product.brand || ""
            }</span>
          </p>
          <p class="text-xl text-green-600 font-bold"><i class="fa-solid fa-naira-sign"></i>${formatMoneyAmount(
            product.price
          )}</p>
          <div class="flex items-center text-yellow-400 space-x-1">
            <i class="fas fa-star"></i>
            <span class="text-sm text-gray-700">${
              product.average_rating || 0
            } / 5</span>
            <span class="text-sm text-gray-500"> (${
              product.review_count || 0
            } reviews)</span>
          </div>
          <p class="text-sm ${inStock ? "text-green-700" : "text-red-600"}">
            <i class="fas ${
              inStock ? "fa-check-circle" : "fa-times-circle"
            } mr-1"></i>
            ${inStock ? "In Stock" : "Out of Stock"}
          </p>
          <p class="text-gray-600 text-sm mt-2">${product.description || ""}</p>
          ${
            variants.length > 0 && variantKeys.length > 0
              ? `
            <div class="mt-6">
              <h4 class="text-sm text-gray-800 font-semibold mb-3 flex items-center gap-2">
                <i class="fas fa-cubes text-purple-600"></i> Product Variants
              </h4>
              <div class="flex flex-col gap-2">
                ${variantKeys
                  .map((key) => {
                    // Get unique values for this key
                    const values = [
                      ...new Set(variants.map((v) => v[key]).filter(Boolean)),
                    ];
                    return values.length
                      ? `<div>
                            <span class="font-semibold capitalize">${key}:</span>
                            ${values
                              .map(
                                (val) =>
                                  `<span class="inline-block px-2 py-1 mx-1 my-1 rounded bg-gray-100 text-gray-700 border border-gray-300">${val}</span>`
                              )
                              .join("")}
                          </div>`
                      : "";
                  })
                  .join("")}
              </div>
            </div>
          `
              : ""
          }
          <div class="flex gap-2 mt-4 flex-wrap">
            ${tags
              .map(
                (tag) =>
                  `<span class="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">#${tag}</span>`
              )
              .join("")}
          </div>
          <p class="text-xs text-gray-400 mt-4">SKU: ${product.sku || ""}</p>
          <div class="mt-6 flex flex-col sm:flex-row gap-3">
            <button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300" id="modal-add-to-cart">
              <i class="fas fa-shopping-cart mr-2"></i> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Animate out and remove modal
  function closeModal() {
    const modalBox = modal.querySelector(".animate-modal-in");
    modalBox.classList.remove("animate-modal-in");
    modalBox.classList.add("animate-modal-out");
    setTimeout(() => {
      modal.remove();
      document.body.classList.remove("overflow-hidden");
    }, 350);
  }

  document.getElementById("close-modal").onclick = closeModal;

  // AddToCart Modal
  document.getElementById("modal-add-to-cart").onclick = () => {
    addToCart(productId);
  };

  // Image thumbnail click: change main image
  if (images.length > 1) {
    const mainImg = document.getElementById("main-modal-img");
    const thumbs = modal.querySelectorAll("#modal-thumbnails img");
    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", function () {
        thumbs.forEach((t) => t.classList.remove("ring-2", "ring-pink-400"));
        this.classList.add("ring-2", "ring-pink-400");
        mainImg.src = this.src;
      });
    });
  }

  // Prevent background scroll
  document.body.classList.add("overflow-hidden");
}

// --- CSS Animations (inject once) ---
if (!document.getElementById("modal-animations")) {
  const style = document.createElement("style");
  style.id = "modal-animations";
  style.innerHTML = `
    @keyframes modalIn {
      0% { opacity: 0; transform: translateY(40px) scale(0.98);}
      100% { opacity: 1; transform: translateY(0) scale(1);}
    }
    @keyframes modalOut {
      0% { opacity: 1; transform: translateY(0) scale(1);}
      100% { opacity: 0; transform: translateY(40px) scale(0.98);}
    }
    .animate-modal-in {
      animation: modalIn 0.35s cubic-bezier(.4,0,.2,1);
    }
    .animate-modal-out {
      animation: modalOut 0.35s cubic-bezier(.4,0,.2,1) forwards;
    }
    /* Toast notification animation */
    @keyframes toastIn {
      0% { opacity: 0; transform: translateY(-30px) scale(0.95);}
      100% { opacity: 1; transform: translateY(0) scale(1);}
    }
    @keyframes toastOut {
      0% { opacity: 1; transform: translateY(0) scale(1);}
      100% { opacity: 0; transform: translateY(-30px) scale(0.95);}
    }
    .animate-toast-in {
      animation: toastIn 0.4s cubic-bezier(.4,0,.2,1);
    }
    .animate-toast-out {
      animation: toastOut 0.4s cubic-bezier(.4,0,.2,1) forwards;
    }
  `;
  document.head.appendChild(style);
}
