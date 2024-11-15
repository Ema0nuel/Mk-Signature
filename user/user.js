import { formateCurrency, products } from "../script/data/products.js";
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
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

let loggedShopUser = localStorage.getItem("loggedShopUser");
if (!loggedShopUser) {
  window.location.href = "./index.html";
}
const orderDetails = document.querySelector(".js-order");
const uName = document.getElementById("uName");
const uEmail = document.getElementById("uEmail");
const uPhone = document.getElementById("uPhone");
const uPhoneUpdate = document.getElementById("uPhone-update");
const uAddress = document.getElementById("uAddress");
const uAddressUpdate = document.getElementById("uAddress-update");
const uAddress2 = document.getElementById("uAddress2");
const uAddress2Update = document.getElementById("uAddress2-update");
const uState = document.getElementById("uState");
const uStateUpdate = document.getElementById("uState-update");
const uCountry = document.getElementById("uCountry");
const uCountryUpdate = document.getElementById("uCountry-update");
const uZip = document.getElementById("uZip");
const uZipUpdate = document.getElementById("uZip-update");
const updateBtn = document.getElementById("update-data");
const saveData = document.getElementById("save-data");
const modalHTML = document.querySelector(".js-absolute");
let html = "";
let orderDateArr = [];
let orderItemArr = [];
let orderRefArr = [];

updateBtn.addEventListener("click", () => {
  uPhone.classList.add("hidden");
  uAddress.classList.add("hidden");
  uAddress2.classList.add("hidden");
  uState.classList.add("hidden");
  uCountry.classList.add("hidden");
  uZip.classList.add("hidden");
  uPhoneUpdate.classList.remove("hidden");
  uAddressUpdate.classList.remove("hidden");
  uAddress2Update.classList.remove("hidden");
  uStateUpdate.classList.remove("hidden");
  uCountryUpdate.classList.remove("hidden");
  uZipUpdate.classList.remove("hidden");
  saveData.classList.remove("hidden");
  updateBtn.disabled = true;
  updateBtn.style.cursor = "not-allowed";
});

let successIcon = `<dotlottie-player src="../images/success.json" background="transparent" speed="0.4" style="width: auto; height: 300px;" autoplay></dotlottie-player>`;

let errorIcon = `<dotlottie-player src="../images/error.json" background="transparent" speed="1" style="width: auto; height: 300px;" loop autoplay></dotlottie-player>`;

const auth = getAuth();
const db = getFirestore();

onAuthStateChanged(auth, (user) => {
  if (loggedShopUser) {
    const docRef = doc(db, "users", loggedShopUser);
    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        const user = docSnap.data();
        uName.innerText = `${user.firstName} ${user.lastName}`;
        uEmail.innerText = `${user.email}`;
        uAddress.innerText = `${user.address}`;
        uZip.innerText = `${user.zip}`;
        uState.innerText = ` ${user.state}`;
        uCountry.innerText = `${user.country}`;
        uPhone.innerText = `${user.phone}`;
        uAddress2.innerText = `${user.address2}`;
      }
    });
  }
});

onAuthStateChanged(auth, (user) => {
  if (loggedShopUser) {
    const docRef = doc(db, "users", loggedShopUser);
    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists) {
        const user = docSnap.data();
        orderDateArr = user.orderDate;
        orderItemArr = user.orderItem;
        orderRefArr = user.orderRef;

        // Looping through the Arrays
        if (orderRefArr.length === 0) {
          orderDetails.innerHTML = `<span class="text-center">NO ORDER MADE.</span>`;
        } else {
          orderRefArr.forEach((ref) => {
            let index = orderRefArr.indexOf(ref);
            for (let i = 0; i < orderDateArr.length; i++) {
              let k = orderDateArr.indexOf(orderDateArr[i]);
              for (let j = 0; j < orderItemArr.length; j++) {
                let m = orderItemArr.indexOf(orderItemArr[j]);
                if (index === k && index === m) {
                  let orderRef = ref;
                  let orderTotal = orderItemArr[j].totalAmount;
                  let orderCart = JSON.parse(orderItemArr[j].item);
                  let orderDate = orderDateArr[i].date;
                  let orderTime = orderDateArr[i].time;

                  html += `
                      <div class="order-container">
                        <div class="order-header">
                          <div class="order-header-left-section">
                            <div class="order-date">
                              <div class="order-header-label">Order Placed:</div>
                              <div>${orderDate}/${orderTime}</div>
                            </div>
                            <div class="order-total">
                              <div class="order-header-label">Total:</div>
                              <div><i class="fa-solid fa-naira-sign"></i>${formateCurrency(
                                orderTotal
                              )}</div>
                            </div>
                          </div>
    
                          <div class="order-header-right-section">
                            <div class="order-header-label">Order REF:</div>
                            <div>${orderRef}</div>
                          </div>
                        </div>

                        <div class="order-details-grid">
                              ${generateProducts(orderCart)}
                        </div>
                        </div>`;

                  orderDetails.innerHTML = html;
                }
              }
            }
          });
        }
      }
    });
  }
});

saveData.addEventListener("click", () => {
  onAuthStateChanged(auth, (user) => {
    if (loggedShopUser) {
      const docRef = doc(db, "users", loggedShopUser);
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          const user = docSnap.data();

          if (
            uPhoneUpdate.value === "" ||
            uAddress2Update.value === "" ||
            uStateUpdate.value === "" ||
            uCountryUpdate.value === "" ||
            uZipUpdate.value === "" ||
            uAddressUpdate.value === ""
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
              document
                .querySelector(".js-close-btn")
                .addEventListener("click", () => {
                  modalHTML.classList.add("hidden");
                });

              clearTimeout(timeInterval);
            }, 1000);
          } else {
            let updateData = {
              phone: uPhoneUpdate.value,
              address: uAddressUpdate.value,
              address2: uAddress2Update.value,
              state: uStateUpdate.value,
              country: uCountryUpdate.value,
              zip: uZipUpdate.value,
            };
            updateDoc(docRef, updateData);
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
                              ${successIcon}
                            </div>
                            <div class="notification-content">
                              <h3>Successfully Updated</h3>
                              <p>You have successfully updated your data.</p>
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
              document
                .querySelector(".js-close-btn")
                .addEventListener("click", () => {
                  modalHTML.classList.add("hidden");
                  window.location.href = "./user.html";
                });

              clearTimeout(timeInterval);
            }, 1000);
          }
        }
      });
    }
  });
});

function generateProducts(orderCart) {
  let html = "";
  products.forEach((product) => {
    orderCart.forEach((item) => {
      if (product.id === item.id) {
        html += `
        <div class="order-product">
          <div class="order-product-image">
            <img
              src="../images/products/${product.images[0]}"/>
          </div>
          <div class="order-product-details">
            <div class="order-product-name">${product.name}</div>
            <div class="order-product-price">
              <i class="fa-solid fa-naira-sign"></i>${formateCurrency(
                product.priceCents
              )}
            </div>
            <div class="order-product-quantity">Quantity: ${item.quantity}</div>
          </div>
        </div>
              `;
      }
    });
  });

  return html;
}

const signOutBtn = document.getElementById("signOut");
signOutBtn.addEventListener("click", () => {
  localStorage.removeItem("loggedShopUser");
  signOut(auth)
    .then(() => {
      window.location.href = "../index.html";
    })
    .catch((error) => {
      console.log("Failed to log out", error);
    });
});
