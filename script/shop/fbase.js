let loggedShopUser = localStorage.getItem("loggedShopUser");
const newsletterForm = document.querySelector(".js-newsletter-form");
const newsletterMail = document.getElementById("nEmail");
const modalHTML = document.querySelector(".js-absolute");
let html;

let successIcon = `<dotlottie-player src="./images/success.json" background="transparent" speed="0.4" style="width: auto; height: 300px;" autoplay></dotlottie-player>`;

let errorIcon = `<dotlottie-player src="./images/error.json" background="transparent" speed="1" style="width: auto; height: 300px;" loop autoplay></dotlottie-player>`;

if (!loggedShopUser) {
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
                        <h3>Not a customer yet?</h3>
                        <p>Sign in to continue shopping exclusive content</p>
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
  }, 10000);
}

newsletterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  postMail();
});
function postMail() {
  const scriptURL =
    "https://script.google.com/macros/s/AKfycbxBIEpH0QPewSEYoHq9jXcPRfolXZCqavuMhDBQjGL4hPe1FE1Vsjwf1pXh159X-gTW/exec";

  fetch(scriptURL, {
    method: "POST",
    body: new FormData(newsletterForm),
  })
    .then((response) => {
      let setInterval = setTimeout(() => {
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
                        <h3>Successful</h3>
                        <p>Welcome on board to our newsletter</p>
                        <p>We are glad you are here with us</p>
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

        clearTimeout(setInterval);
        newsletterMail.value = ""
      }, 100);
    })
    .catch((e) => {
      console.error("Error", e.message);
    });
}

const userBtn = document.querySelector(".js-user")
userBtn.addEventListener("click", () => {
  if (loggedShopUser) {
    window.location.href = `./user/user.html`
  }
})