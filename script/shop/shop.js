import { products, formateCurrency } from "../data/products.js";
import { addToCart, displayShoppingItems } from "./cart.js";
import { activateModal, generateActiveProduct } from "./modal.js";

displayShoppingItems();
const searchForm = document.querySelector(".js-search-field");
const searchInput = document.getElementById("js-search-input");
const searchBtn = document.querySelector(".js-search-btn");
searchForm.addEventListener("submit", (e) => e.preventDefault());

const newShopProductHTML = document.querySelector(".js-shop-new-product");
const hairShopProductHTML = document.querySelector(".js-shop-hair-product");
const successMessage = document.getElementById("d-message");

let newProduct = "";
let hairProduct = "";
products.forEach((product) => {
  if (product.level === "New") {
    newProduct += `
       <div class="col-xl-3 col-lg-4 col-md-4 col-12" id="${
         product.id
       }" data-product-id="${product.id}" class="product-div">
				<div class="single-product">
					<div class="product-img">
						<a class="js-active-product" data-product-id="${product.id}">
							<img class="default-img"
								src="./images/products/${product.images[0]}" />
								<span class="out-of-stock">${product.category[0]}</span>
							<img class="hover-img" src="./images/products/${product.images[0]}"
								/>
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
									<span><i class="fa-solid fa-naira-sign"></i>${formateCurrency(
                    product.priceCents
                  )}</span>
								</div>
							</div>
						</div>
				</div>
    `;
  }
  for (let i = 0; i < product.category.length; i++) {
    let j = product.category[i];
    if (j === "Hair" && product.level !== "New") {
      hairProduct += `
            <div class="col-xl-3 col-lg-4 col-md-4 col-12" id="${
              product.id
            }" data-product-id="${product.id}" class="product-div">
				<div class="single-product">
					<div class="product-img">
						<a class="js-active-product" data-product-id="${product.id}">
							<img class="default-img"
								src="./images/products/${product.images[0]}" >
							<img class="hover-img" src="./images/products/${product.images[0]}"
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
									<span><i class="fa-solid fa-naira-sign"></i>${formateCurrency(
                    product.priceCents
                  )}</span>
								</div>
							</div>
						</div>
				</div>
        `;
    }
  }
});

newShopProductHTML.innerHTML = newProduct;
hairShopProductHTML.innerHTML = hairProduct;
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

// SearchField
searchInput.addEventListener("input", () => {
  let value = searchInput.value.toLowerCase();
  // searchFunction(value);
})

function searchFunction() {
  const productsDiv = document.querySelectorAll("product-div")
 console.log(productsDiv.length);
}
searchFunction();