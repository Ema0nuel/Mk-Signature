import { formateCurrency, products } from "../data/products.js";

let cartItem =
  localStorage.getItem("user-cart") === null
    ? []
    : JSON.parse(localStorage.getItem("user-cart"));

let productPriceCent = 0;
let totalCents = 0;
let taxCents = 0;

cartItem.forEach((item) => {
  products.forEach((product) => {
    if (item.id === product.id) {
      productPriceCent += item.quantity * product.priceCents;
    }
  });
});
taxCents = productPriceCent * 0.1;
totalCents = productPriceCent + taxCents;

let paymentProperty = {
  productPriceCent,
  totalCents,
  taxCents,
};

const uFName = document.getElementById("fName");
const uLName = document.getElementById("lName");
const uEmail = document.getElementById("email");
const uNumber = document.getElementById("number");
const uState = document.getElementById("state");
const uRegion = document.getElementById("region");
const uAddress = document.getElementById("address");
const uPostCode = document.getElementById("post");
const checkoutForm = document.querySelector(".js-checkout-form");
const paymentBtn = document.querySelector(".js-payment-btn");

console.log();

document.querySelector(".js-payment-summary").innerHTML = `
        <ul>
            <li>Sub Total<span><i class="fa-solid fa-naira-sign"></i>${formateCurrency(
              paymentProperty.productPriceCent
            )}</span></li>
            <li>(+) Shipping<span>Free</span></li>
            <li>Tax Charges(10%)<span><i class="fa-solid fa-naira-sign"></i>${formateCurrency(
              paymentProperty.taxCents
            )}</span></li>
            <li class="last">Total<span><i class="fa-solid fa-naira-sign"></i>${formateCurrency(
              paymentProperty.totalCents
            )}</span></li>
        </ul>
    `;

function getUserData(e) {
  let userData;
  if (
    uEmail.value === "" ||
    uAddress.value === "" ||
    uFName.value === "" ||
    uLName.value === "" ||
    uNumber.value === "" ||
    uState.value === "" ||
    uRegion.value === "" ||
    uPostCode.value === ""
  ) {
    alert("Please Input Field");
  } else {
    userData = {
      fName: uFName.value,
      lName: uLName.value,
      email: uEmail.value,
      number: uNumber.value,
      state: uState.value,
      region: uRegion.value,
      address: uAddress.value,
      postCode: uPostCode.value,
    };
  }
  return userData();
}

paymentBtn.addEventListener("click", async (e) => {
  payWithPaystack(e);
});

function payWithPaystack(e) {
  e.preventDefault();
  let value = (paymentProperty.totalCents / 100) * 100;

  let handler = PaystackPop.setup({
    key: "pk_live_b447d34c1bec4e612edaa1862cba8555dfbc6788", // Replace with your public key
    email: uEmail.value,
    amount: Math.round(value),
    currency: "NGN",
    ref: "" + Math.floor(Math.random() * 1000000000 + 1), // generates a pseudo-unique reference. Please replace with a reference you generated. Or remove the line entirely so our API will generate one for you
    // label: "Optional string that replaces customer email"
    onClose: function () {
      alert("Window closed.");
    },
    callback: function (response) {
      let message = "Payment complete! Reference: " + response.reference;
      alert(message);
    },
  });

  handler.openIframe();
}
