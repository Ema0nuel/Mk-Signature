// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc,
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let successIcon = `<dotlottie-player src="../images/success.json" background="transparent" speed="0.4" style="width: auto; height: 300px;" autoplay></dotlottie-player>`;
let errorIcon = `<dotlottie-player src="../images/error.json" background="transparent" speed="1" style="width: auto; height: 300px;" loop autoplay></dotlottie-player>`;

const messageDiv = document.querySelector(".js-absolute");
const loggedEmail = document.getElementById("lEmail");
const loggedPassword = document.getElementById("lPassword");
const loginForm = document.getElementById("login");
const signUpName = document.getElementById("sName");
const signUpEmail = document.getElementById("sEmail");
const signUpPhone = document.getElementById("sNumber");
const signUpLName = document.getElementById("sLast");
const dob = document.getElementById("sDate");
const eye = document.querySelector(".js-eye");
const signUpPassword = document.getElementById("sPassword");
const signUpForm = document.getElementById("signup");
const regBtn = document.getElementById("reg");
const logBtn = document.getElementById("log");
let a = 0;

eye.addEventListener("click", () => {
  if (a == 0) {
    signUpPassword.type = "text";
    eye.innerHTML = `<i class="fas fa-eye-slash"></i>`;
    a = 1;
  } else if (a == 1) {
    signUpPassword.type = "password";
    eye.innerHTML = `<i class="fas fa-eye"></i>`;
    a = 0;
  }
});

regBtn.addEventListener("click", () => {
  signUpForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});
logBtn.addEventListener("click", () => {
  signUpForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
});

signUpForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const auth = getAuth();

  const db = getFirestore();
  createUserWithEmailAndPassword(auth, signUpEmail.value, signUpPassword.value)
    .then((userCredential) => {
      const user = userCredential.user;
      const userData = {
        firstName: signUpName.value,
        lastName: signUpLName.value,
        dob: dob.value,
        phone: signUpPhone.value,
        orderDate: [],
        orderRef: [],
        orderItem: [],
        email: signUpEmail.value,
        country: "Nigeria",
      };

      const docRef = doc(db, "users", user.uid);
      setDoc(docRef, userData)
        .then(() => {
          messageDiv.classList.remove("hidden");
          messageDiv.innerHTML = successMessage(
            "Account Created",
            "Continue to sign in.",
            successIcon
          );
          setTimeout(() => {
            messageDiv.classList.add("hidden");
            window.location.href = "./index.html";
          }, 5000);
        })
        .catch((error) => {
          console.error("Error Writing document", error);
        });
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode == "auth/email-already-in-use") {
        messageDiv.classList.remove("hidden");
        messageDiv.innerHTML = successMessage(
          "Email Address Registered Already",
          "Register with a different email or sign-in.",
          errorIcon
        );
        setTimeout(() => {
          messageDiv.classList.add("hidden");
        }, 5000);
      } else {
        messageDiv.classList.remove("hidden");
        messageDiv.innerHTML = successMessage(
          "Error Creating Customer",
          "Try again...",
          errorIcon
        );
        setTimeout(() => {
          messageDiv.classList.add("hidden");
        }, 5000);
      }
    });
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const auth = getAuth();
  signInWithEmailAndPassword(auth, loggedEmail.value, loggedPassword.value)
    .then((userCredential) => {
      messageDiv.classList.remove("hidden");
      messageDiv.innerHTML = successMessage(
        "Welcome Back",
        "Click to Continue shopping",
        successIcon,
        "../index.html"
      );
      const user = userCredential.user;
      localStorage.setItem("loggedShopUser", user.uid);
      setTimeout(() => {
        window.location.href = "./user.html";
      }, 10000);
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode == "auth/invalid-credential") {
        messageDiv.classList.remove("hidden");
        messageDiv.innerHTML = successMessage(
          "Invalid Details",
          "input correct email and password",
          errorIcon
        );
        setTimeout(() => {
          messageDiv.classList.add("hidden");
        }, 5000);
      } else {
        messageDiv.classList.remove("hidden");
        messageDiv.innerHTML = successMessage(
          "Account doesn't exist",
          "Create new account to start shopping.",
          errorIcon
        );
        setTimeout(() => {
          messageDiv.classList.add("hidden");
        }, 5000);
      }
    });
});

function successMessage(message, messageNote, icon, href = './index.html') {
  let html = `
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
                        ${icon}
                      </div>
                      <div class="notification-content">
                        <h3>${message}</h3>
                        <p>${messageNote}</p>
                        <button
                          class="btn"
                           onclick="window.location.href = '${href}'"
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
      </div>`;

  return html;
}
