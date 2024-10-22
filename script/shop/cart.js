import { products, formateCurrency } from "../data/products.js";
import { generateActiveProduct } from "./modal.js";

export let cart = undefined;
cart = localStorage.getItem("user-cart")
  ? JSON.parse(localStorage.getItem("user-cart"))
  : [];

export function saveToStorage() {
  localStorage.setItem("user-cart", JSON.stringify(cart));
}

// AddToCart Function
export function addToCart(addCartBtn, selectedItem = 1) {
  const { productId } = addCartBtn.dataset;
  let matchingItem;
  cart.forEach((cartItem) => {
    if (cartItem.id === productId) {
      matchingItem = cartItem;
    }
  });

  if (matchingItem) {
    matchingItem.quantity += Number(selectedItem);
  } else {
    cart.push({
      id: productId,
      quantity: Number(selectedItem),
    });
  }
  saveToStorage();
  displayShoppingItems();
}
// Display MiniCart
export function displayShoppingItems() {
  let html = "";
  let totalCents = 0;

  let cartArr = cart.slice(0, 3);
  cartArr.forEach((shopItem) => {
    products.forEach((product) => {
      if (shopItem.id === product.id) {
        html += `
            <li>
                <a class="cart-img js-active-product" data-product-id="${
                  product.id
                }"
                  ><img src="../images/products/${product.images[0]}"
                /></a>
                <h4><a class="title js-active-product cursor-pointer" data-product-id="${
                  product.id
                }">${product.name}</a></h4>
                <p class="quantity">
                  ${
                    shopItem.quantity
                  }x - <span class="amount"><i class="fa-solid fa-naira-sign"></i>${formateCurrency(
          product.priceCents
        )}</span>
                </p>
            </li>
        `;
        totalCents += Number(product.priceCents) * Number(shopItem.quantity);
        document.querySelector(
          ".js-quantity-count"
        ).innerHTML = `${cartArr.length}`;
        document.querySelector(
          ".js-quantity"
        ).innerHTML = `${cartArr.length} Items`;
      }
    });
  });

  document.querySelector(".js-amount").innerHTML = `<i class="fa-solid fa-naira-sign"></i>${formateCurrency(
    totalCents
  )}`;
  document.querySelector(".js-shop-item").innerHTML = html;
  // Initial Active Product
  document.querySelectorAll(".js-active-product").forEach((activeProduct) => {
    activeProduct.addEventListener("click", () => {
      generateActiveProduct(activeProduct);
    });
  });
}

export function updateCartQuantity(productId, newQuantity, totalHTML) {
  let matchingItem;

  cart.forEach((cartItem) => {
    if (productId === cartItem.id) {
      matchingItem = cartItem;
    }
  });

  if (matchingItem) {
    matchingItem.quantity = newQuantity;
  }
  products.forEach((product) => {
    if (product.id === productId) {
      matchingItem = product;
    }
  });

  let html = `<i class="fa-solid fa-naira-sign"></i>${formateCurrency(matchingItem.priceCents * newQuantity)}`;
  totalHTML.innerHTML = html;
  saveToStorage();
}
export function removeFromCart(productId) {
  const newCart = [];
  cart.forEach((item) => {
    if (item.id !== productId) {
      newCart.push(item);
    }
  });
  cart = newCart;
  saveToStorage();
}
