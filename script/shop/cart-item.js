import { formateCurrency, products } from "../data/products.js";
import { cart, updateCartQuantity, removeFromCart } from "./cart.js";
import { generateActiveProduct } from "./modal.js";
import { renderCartTotal } from "./checkout.js";

const cartItemHTML = document.querySelector(".js-cart-item");
const successMessage = document.getElementById("d-message");
const paymentSummaryHTML = document.querySelector(".js-payment-summary");
let html = "";
renderCartTotal(paymentSummaryHTML);
products.forEach((product) => {
  if (cart.length === 0) {
    html = `<tr><td></td><td></td><td data-title="Price"><h6 class="text-center">No Item to display <a href="./shop.html" class="btn cursor-pointer text-white">Shop Now</a></h6></td></tr>`;
  } else {
    cart.forEach((cartItem) => {
      if (cartItem.id === product.id) {
        html += `
            <tr data-product-id="${product.id}" class="js-cart-item-container-${
          product.id
        }">
                  <td class="image" data-title="No">
                    <img src="./images/products/${product.images[0]}" />
                  </td>
                  <td class="product-des" data-title="Description">
                    <p class="product-name"><a class="js-active-product" data-product-id="${
                      product.id
                    }">${product.name}</a></p>
                    <p class="product-des">
                     <span class="title">Category: </span>${
                       product.category[0]
                     }, ${product.category[1]}
                    </p>
                  </td>
                  <td class="price" data-title="Price">
                    <span><i class="fa-solid fa-naira-sign"></i>${formateCurrency(product.priceCents)}</span>
                  </td>
                  <td class="qty" data-title="Qty">
                    <!-- Input Order -->
                    <div class="input-group">
                      <input
                        type="number"
                        class="input-number js-selected-quantity"
                        data-min="1"
                        data-max="100"
                        data-product-id="${product.id}"
                        value=${cartItem.quantity}
                      />
                  </td>
                  <td class="total-amount" data-title="Total">
                    <span class="js-total-${product.id}"><i class="fa-solid fa-naira-sign"></i>${formateCurrency(
          product.priceCents * cartItem.quantity
        )}</span>
                  </td>
                  <td class="action" data-title="Remove">
                    <a class="js-remove-item" data-product-id="${
                      product.id
                    }"><i class="ti-trash remove-icon"></i></a>
                  </td>
                  </tr>
                  `;
      }
    });
  }
});
cartItemHTML.innerHTML = html;
document.querySelectorAll(".js-selected-quantity").forEach((quantityItem) => {
  quantityItem.addEventListener("keypress", (e) => {
    const { productId } = quantityItem.dataset;
    let totalHtml = document.querySelector(`.js-total-${productId}`);
    let target = e.key;
    let value = Number(quantityItem.value);
    if (target === "Enter") {
      if (value <= 0 || value >= 100) {
        alert("Invalid Input");
      } else {
        updateCartQuantity(productId, value, totalHtml);
        quantityItem.blur();
        renderCartTotal(paymentSummaryHTML);
        successMessage.classList.add("success");
        successMessage.innerHTML = `<h6 class="active-message">
          <i class="fas fa-check-circle"></i> <span> Item Updated</span>
        </h6>`;
        setTimeout(() => {
          successMessage.classList.remove("success");
          successMessage.innerHTML = `<h6 class="active-message">
          <i class="fas fa-check-circle"></i> <span> Item deleted</span>
        </h6>`;
        }, 2000);
      }
    }
  });
});

document.querySelectorAll(".js-remove-item").forEach((deleteLink) => {
  deleteLink.addEventListener("click", () => {
    const { productId } = deleteLink.dataset;
    removeFromCart(productId);
    const container = document.querySelector(
      `.js-cart-item-container-${productId}`
    );
    container.remove();
    renderCartTotal(paymentSummaryHTML);
    if (cart.length === 0) {
      cartItemHTML.innerHTML = `<tr><td></td><td></td><td data-title="Price"><h6 class="text-center">No Item to display <a href="./shop.html" class="btn cursor-pointer text-white">Shop Now</a></h6></td></tr>`;
    }
    successMessage.classList.add("success");
    setTimeout(() => {
      successMessage.classList.remove("success");
    }, 2000);
  });
});

document.querySelectorAll(".js-active-product").forEach((activeProduct) => {
  activeProduct.addEventListener("click", () => {
    generateActiveProduct(activeProduct);
  });
});
