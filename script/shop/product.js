import { products, formateCurrency } from "../data/products.js";
import {
  addToCart,
  displayShoppingItems,
} from "./cart.js";
import { generateActiveProduct, activateModal } from "./modal.js";
displayShoppingItems();
const womenSingleProductHTML = document.getElementById(
  "js-women-single-product"
);
// const searchInput = document.getElementById("js-search-input");
// const searchBtn = document.querySelector(".js-search-btn");
const successMessage = document.getElementById("d-message");
const hairSingleProductHTML = document.getElementById("js-hair-single-product");
const cosmeticsSingleProductHTML = document.getElementById(
  "js-cosmetics-single-product"
);
const dressingSingleProductHTML = document.getElementById(
  "js-dressing-single-product"
);
const womenSingleProductBtn = document.getElementById(
  "js-women-single-product-btn"
);
const hairSingleProductBtn = document.getElementById(
  "js-hair-single-product-btn"
);
const cosmeticsSingleProductBtn = document.getElementById(
  "js-cosmetics-single-product-btn"
);
const dressingSingleProductBtn = document.getElementById(
  "js-dressing-single-product-btn"
);
const trendingProductHTML = document.querySelector(".js-trending-product");
const onSaleHTML = document.querySelector(".js-sale-product");
const bestSellerHTML = document.querySelector(".js-best-seller");
const topViewHTML = document.querySelector(".js-top-view");
let womenHtml = "";
let hairHtml = "";
let trending = "";
let saleProduct = "";
products.slice(0, 16).forEach((product) => {
  // Women HTML
  for (let i = 0; i < product.category.length; i++) {
    let j = product.category[i];
    if (j === "Clothing" && product.showCase) {
      womenHtml += `
                <div class="col-xl-3 col-lg-4 col-md-4 col-12" id="${
                  product.id
                }" data-product-id="${product.id}">
				<div class="single-product">
					<div class="product-img">
						<a class="js-active-product" data-product-id="${product.id}">
							<img class="default-img"
								src="../images/products/${product.showCase}" >
							<img class="hover-img" src="../images/products/${product.showCase}"
								alt="#">
						</a>
						<div class="button-head">
							<div class="product-action">
							<a data-toggle="modal" data-product-id="${
                product.id
              }" title="Quick View" class="js-target"><i
							class=" ti-eye"></i><span>Quick Shop</span></a>
							</div>
						<div class="product-action-2">
							<a title="Add to cart" class="js-add-to-cart" data-product-id="${
                product.id
              }">Add to cart</a>
							</div>
							</div>
							</div>
							<div class="product-content">
								<h3><a class="js-active-product cursor-pointer" data-product-id="${
                  product.id
                }">${product.name}</a></h3>
								<div class="product-price">
									<span><i class="fa-solid fa-naira-sign"></i>${formateCurrency(product.priceCents)}</span>
								</div>
							</div>
						</div>
				</div>
             `;
    }
  }
  // Hair HTML
  for (let i = 0; i < product.category.length; i++) {
    let j = product.category[i];
    if (j === "Hair" && product.showCase) {
      hairHtml += `
                <div class="col-xl-3 col-lg-4 col-md-4 col-12" id="${
                  product.id
                }" data-product-id="${product.id}" >
				<div class="single-product">
					<div class="product-img">
						<a class="js-active-product" data-product-id="${product.id}">
							<img class="default-img"
								src="../images/products/${product.showCase}" >
							<img class="hover-img" src="../images/products/${product.showCase}"
								alt="#">
						</a>
						<div class="button-head">
							<div class="product-action">
							<a data-toggle="modal" data-product-id="${
                product.id
              }" title="Quick View" class="js-target"><i
							class=" ti-eye"></i><span>Quick Shop</span></a>
							</div>
						<div class="product-action-2">
							<a title="Add to cart" class="js-add-to-cart" data-product-id="${
                product.id
              }">Add to cart</a>
							</div>
							</div>
							</div>
							<div class="product-content">
								<h3><a class="js-active-product cursor-pointer" data-product-id="${
                  product.id
                }">${product.name}</a></h3>
								<div class="product-price">
									<span><i class="fa-solid fa-naira-sign"></i>${formateCurrency(product.priceCents)}</span>
								</div>
							</div>
						</div>
				</div>  
		`;
    }
  }

  // Trending product
  let j = product.level;
  if (j === "Trending") {
    trending += `<div class="single-product">
                <div class="product-img">
                  <a class="js-active-product" data-product-id="${product.id}">
                    <img
                      class="default-img"
                      src="./images/products/${product.images[0]}"
                      alt="#"
                    />
                    <img
                      class="hover-img"
                      src="./images/products/${product.images[0]}"
                      alt="#"
                    />
                    <span class="out-of-stock">${product.category[0]}</span>
                  </a>
                  <div class="button-head">
                    <div class="product-action">
                      <a data-toggle="modal" data-product-id="${
                        product.id
                      }" title="Quick View" class="js-target"><i class=" ti-eye"></i><span>Quick Shop</span></a>
                    </div>
                    <div class="product-action-2">
                      <a title="Add to cart" class="js-add-to-cart" data-product-id="${
                        product.id
                      }">Add to cart</a>
                    </div>
                  </div>
                </div>
                <div class="product-content">
                  <h3><a class="js-active-product cursor-pointer" data-product-id="${
                    product.id
                  }">${product.name}</a></h3>
								<div class="product-price">
									<span><i class="fa-solid fa-naira-sign"></i>${formateCurrency(product.priceCents)}</span>
								</div>
                  </div>
                </div>
              </div>`;
  }

  if (j === "New") {
    saleProduct += `
      <div class="single-list">
        <div class="row">
          <div class="col-lg-6 col-md-6 col-12">
            <div class="list-image overlay">
              <img src="./images/products/${product.images[0]}" />
              <a class="buy js-active-product" data-product-id="${product.id}"
                ><i class="fa fa-shopping-bag"></i
              ></a>
            </div>
          </div>
          <div class="col-lg-6 col-md-6 col-12 no-padding">
            <div class="content">
                <h4><a class="title js-active-product cursor-pointer" data-product-id="${
                  product.id
                }">${product.name}</a></h4>
              <p class="price with-discount"><i class="fa-solid fa-naira-sign"></i>${formateCurrency(
                product.priceCents
              )}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
});
womenSingleProductHTML.innerHTML = womenHtml;
hairSingleProductHTML.innerHTML = hairHtml;
trendingProductHTML.innerHTML = trending;
onSaleHTML.innerHTML = trending;
topViewHTML.innerHTML = trending;
bestSellerHTML.innerHTML = trending;
womenSingleProductBtn.addEventListener("click", () => {
  womenSingleProductHTML.innerHTML = womenHtml;
  // Modal
  document.querySelectorAll(".js-target").forEach((targetBtn) => {
    targetBtn.addEventListener("click", () => {
      activateModal(targetBtn);
    });
  });
  // AddToCart
  document.querySelectorAll(".js-add-to-cart").forEach((addCartBtn) => {
    addCartBtn.addEventListener("click", () => {
      addToCart(addCartBtn);
      successMessage.classList.add("success");
      setTimeout(() => {
        successMessage.classList.remove("success");
      }, 2000);
    });
  });
  // Active Product
  document.querySelectorAll(".js-active-product").forEach((activeProduct) => {
    activeProduct.addEventListener("click", () => {
      generateActiveProduct(activeProduct);
    });
  });
});
hairSingleProductBtn.addEventListener("click", () => {
  hairSingleProductHTML.innerHTML = hairHtml;
  // Modal
  document.querySelectorAll(".js-target").forEach((targetBtn) => {
    targetBtn.addEventListener("click", () => {
      activateModal(targetBtn);
    });
  });
  // AddToCart
  document.querySelectorAll(".js-add-to-cart").forEach((addCartBtn) => {
    addCartBtn.addEventListener("click", () => {
      addToCart(addCartBtn);
      successMessage.classList.add("success");
      setTimeout(() => {
        successMessage.classList.remove("success");
      }, 2000);
    });
  });
  // Active Product
  document.querySelectorAll(".js-active-product").forEach((activeProduct) => {
    activeProduct.addEventListener("click", () => {
      generateActiveProduct(activeProduct);
    });
  });
});
cosmeticsSingleProductBtn.addEventListener("click", () => {
  console.log(cosmeticsSingleProductHTML.innerHTML);
});
dressingSingleProductBtn.addEventListener("click", () => {});

// Initial Modal
document.querySelectorAll(".js-target").forEach((targetBtn) => {
  targetBtn.addEventListener("click", () => {
    activateModal(targetBtn);
  });
});
// Initial addToCart
document.querySelectorAll(".js-add-to-cart").forEach((addCartBtn) => {
  addCartBtn.addEventListener("click", () => {
    addToCart(addCartBtn);
    successMessage.classList.add("success");
    setTimeout(() => {
      successMessage.classList.remove("success");
    }, 2000);
  });
});

// Initial Active Product
document.querySelectorAll(".js-active-product").forEach((activeProduct) => {
  activeProduct.addEventListener("click", () => {
    generateActiveProduct(activeProduct);
  });
});
