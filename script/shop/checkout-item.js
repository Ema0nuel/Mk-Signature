import { formateCurrency, products } from "../data/products.js";
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  getDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBN0-EoVk8WtMNMkLMqrB1mMl3hSsfhxKU",
  authDomain: "mk-sign.firebaseapp.com",
  projectId: "mk-sign",
  storageBucket: "mk-sign.firebasestorage.app",
  messagingSenderId: "571759764090",
  appId: "1:571759764090:web:a9416c40c1c8e7e27d11c3",
};

const app = initializeApp(firebaseConfig);

const modalHTML = document.querySelector(".js-absolute");
let html;

let successIcon = `<dotlottie-player src="./images/success.json" background="transparent" speed="0.4" style="width: auto; height: 300px;" autoplay></dotlottie-player>`;

let errorIcon = `<dotlottie-player src="./images/error.json" background="transparent" speed="1" style="width: auto; height: 300px;" loop autoplay></dotlottie-player>`;

const uFName = document.getElementById("fName");
const uLName = document.getElementById("lName");
const uEmail = document.getElementById("email");
const uNumber = document.getElementById("number");
const uState = document.getElementById("state");
const uRegion = document.getElementById("region");
const uAddress = document.getElementById("address");
const uPostCode = document.getElementById("post");

let cartItem =
  localStorage.getItem("user-cart") === null
    ? []
    : JSON.parse(localStorage.getItem("user-cart"));
const loggedShopUser = localStorage.getItem("loggedShopUser");

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

const paymentBtn = document.querySelector(".js-payment-btn");

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

paymentBtn.addEventListener("click", async (e) => {
  if (
    uAddress.value === "" ||
    uEmail.value === "" ||
    uFName.value === "" ||
    uLName.value === "" ||
    uNumber.value === "" ||
    uPostCode.value === "" ||
    uRegion.value === "" ||
    uState.value === ""
  ) {
    let timeInterval = setTimeout(() => {
      html = `
          <div class="fixed-div">
          <div
            class="fade show special-modal match-content"
            tabindex="-1"
            role="dialog"
            style="padding-right: 17px; display: block"
          >
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <button
                    type="button"
                    class="close js-close-btn"
                    aria-label="Close"
                  >
                    <span class="ti-close" aria-hidden="true"></span>
                  </button>
                </div>
                <div class="modal-body">
                  <div class="row no-gutters">
                    <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                      <div class="notification-slide">
                        <div class="notification-img">
                          ${errorIcon}
                        </div>
                        <div class="notification-content">
                          <h3>An Error Occurred!</h3>
                          <p>You may not have field the complete or correct details.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      modalHTML.classList.remove("hidden");
      modalHTML.innerHTML = html;
      document.querySelector(".js-close-btn").addEventListener("click", () => {
        modalHTML.classList.add("hidden");
      });

      clearTimeout(timeInterval);
    }, 1000);
  } else if (!loggedShopUser) {
    let timeInterval = setTimeout(() => {
      html = `
          <div class="fixed-div">
        <div
          class="fade show special-modal match-content"
          tabindex="-1"
          role="dialog"
          style="padding-right: 17px; display: block"
        >
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <button
                  type="button"
                  class="close js-close-btn"
                  aria-label="Close"
                >
                  <span class="ti-close" aria-hidden="true"></span>
                </button>
              </div>
              <div class="modal-body">
                <div class="row no-gutters">
                  <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <div class="notification-slide">
                      <div class="notification-img">
                        ${errorIcon}
                      </div>
                      <div class="notification-content">
                        <h3>Sign in here?</h3>
                        <p>Login or create an account in order to check out.</p>
                        <button
                          class="btn"
                          onclick="
                          let loggedShopUser = localStorage.getItem('loggedShopUser')

                          if (loggedShopUser) {
                          window.location.href='./user/user.html'
                          } else {
                          window.location.href='./user/index.html'
                          }"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      `;
      modalHTML.classList.remove("hidden");
      modalHTML.innerHTML = html;
      document.querySelector(".js-close-btn").addEventListener("click", () => {
        modalHTML.classList.add("hidden");
      });

      clearTimeout(timeInterval);
    }, 1000);
  } else if (paymentProperty.totalCents <= 1) {
    let timeInterval = setTimeout(() => {
      html = `
          <div class="fixed-div">
        <div
          class="fade show special-modal match-content"
          tabindex="-1"
          role="dialog"
          style="padding-right: 17px; display: block"
        >
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <button
                  type="button"
                  class="close js-close-btn"
                  aria-label="Close"
                >
                  <span class="ti-close" aria-hidden="true"></span>
                </button>
              </div>
              <div class="modal-body">
                <div class="row no-gutters">
                  <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <div class="notification-slide">
                      <div class="notification-img">
                        ${errorIcon}
                      </div>
                      <div class="notification-content">
                        <h3>No item purchased</h3>
                        <p>You haven't selected any item.</p>
                        <p>Select items of choice to continue checkout</p>
                        <button
                          class="btn"
                          onclick=" window.location.href = './shop.html'"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      `;
      modalHTML.classList.remove("hidden");
      modalHTML.innerHTML = html;
      document.querySelector(".js-close-btn").addEventListener("click", () => {
        modalHTML.classList.add("hidden");
      });

      clearTimeout(timeInterval);
    }, 1000);
  } else {
    payWithPaystack(e);
  }
});
let refid;

function payWithPaystack(e) {
  e.preventDefault();
  let value = (paymentProperty.totalCents / 100) * 100;

  let handler = PaystackPop.setup({
    key: "pk_test_95d0aab29a6a05af958c049b9ee468c7814b72b0",
    email: uEmail.value,
    amount: Math.round(value),
    currency: "NGN",
    ref: "" + Math.floor(Math.random() * 1000000000 + 1),
    onClose: function () {
      alert("Window closed.");
    },
    callback: function (response) {
      let message = "Payment complete! Reference: " + response.reference;
      alert(message);
      refid = response.reference;
      onAuthStateChanged(auth, (user) => {
        updateData(refid);
        setTimeout(() => {
          window.location.href = "./user/user.html";
        }, 5000)
      });
      localStorage.removeItem("user-cart");
    },
  });

  handler.openIframe();
}
const auth = getAuth();
const db = getFirestore();

onAuthStateChanged(auth, (user) => {
  if (loggedShopUser) {
    const docRef = doc(db, "users", loggedShopUser);
    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        const user = docSnap.data();
        uFName.value = user.firstName;
        uLName.value = user.lastName;
        uNumber.value = user.phone;
        uEmail.value = user.email;
        uFName.disabled = true;
        uLName.disabled = true;
        uNumber.disabled = true;
        uEmail.disabled = true;
      }
    });
  }
});

function updateData(refid) {
  const date = new Date();
  let sec = (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
  let min = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
  let hour = (date.getHours() < 10 ? "0" : "") + date.getHours();
  let todayDate = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();
  const docRef = doc(db, "users", loggedShopUser);
  if (loggedShopUser) {
    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        let user = docSnap.data();
        let refArr = user.orderRef;
        let dateArr = user.orderDate;
        let itemArr = user.orderItem;
        refArr.push(refid);
        dateArr.push({
          date: `${todayDate} : ${month} : ${year}`,
          time: `${hour} : ${min} : ${sec}`,
        })
        itemArr.push({
          item: JSON.stringify(cartItem),
          totalAmount: paymentProperty.totalCents,
        })
        let userData = {
          orderRef: refArr,
          orderDate: dateArr,
          orderItem: itemArr,
          country: uState.value,
          state: uRegion.value,
          zip: uPostCode.value,
          address: uAddress.value,      
        };
        updateDoc(docRef, userData);
      }
    });
  }
}
