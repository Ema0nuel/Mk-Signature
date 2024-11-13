const modalHTML = document.querySelector(".js-absolute");
const newsletterForm = document.querySelector(".js-newsletter");
let html;
let successIcon = `<dotlottie-player src="./images/success.json" background="transparent" speed="0.4" style="width: auto; height: 300px;" autoplay></dotlottie-player>`;

let errorIcon = `<dotlottie-player src="./images/error.json" background="transparent" speed="1" style="width: auto; height: 300px;" loop autoplay></dotlottie-player>`;

newsletterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  postMail(newsletterForm, "email");
});

function postMail(formData, message) {
  const scriptURL =
    "https://script.google.com/macros/s/AKfycbxBIEpH0QPewSEYoHq9jXcPRfolXZCqavuMhDBQjGL4hPe1FE1Vsjwf1pXh159X-gTW/exec";

  fetch(scriptURL, {
    method: "POST",
    body: new FormData(formData),
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
                          <p>We have successfully received your ${message}</p>
                          <p>We would get back to you shortly.</p>
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
      }, 100);
    })
    .catch((e) => {
      console.error("Error", e.message);
    });
}
