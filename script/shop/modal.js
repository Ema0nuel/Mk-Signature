import { products, formateCurrency } from "../data/products.js";
// Modal Function
export function activateModal(targetBtn) {
  const { productId } = targetBtn.dataset;
  let modal;
  products.forEach((product) => {
    if (product.id === productId) {
      modal = product;
    }
  });
  let html = `
    <div class="fixed-div">
    <div class="fade show special-modal" id="${
      modal.id
    }" tabindex="-1" role="dialog" style="padding-right: 17px; display: block;">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close js-close-btn" aria-label="Close">
              <span class="ti-close" aria-hidden="true"></span>
            </button>
          </div>
          <div class="modal-body">
            <div class="row no-gutters">
            <div class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
            <!-- Product Slider -->
                <div class="product-gallery">
                  <div class="single-slider">
                    <img src="/images/products/${modal.images[0]}" />
                  </div>
                </div>
                <!-- End Product slider -->
              </div>
              <div class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
                <div class="quickview-content">
                  <h2>${modal.name}</h2>
                  <div class="quickview-ratting-review">
                    <div class="quickview-ratting-wrap">
                      <div class="quickview-ratting">
                        <img class="rating" src="./images/ratings/${
                          modal.rating
                        }.png" />
                      </div>
                      <a> (${modal.reviews} customer review)</a>
                    </div>
                    <div class="quickview-stock">
                      <span><i class="fa fa-check-circle-o"></i> ${
                        modal.availability === undefined
                          ? "..."
                          : modal.availability
                      } Up</span>
                    </div>
                  </div>
                  <h3><i class="fa-solid fa-naira-sign"></i>${formateCurrency(modal.priceCents)}</h3>
                  <div class="quickview-peragraph">
                    <p>
                      ${modal.description}
                    </p>
                  </div>
                  <div class="size">
                    <div class="row">
                      <div class="col-lg-6 col-12">
                        <h5 class="title">Size</h5>
                        <select style="display: none">
                          <option selected="selected">${modal.size[0]}</option>
                          <option>${modal.size[1]}</option>
                          <option>${modal.size[2]}</option>
                          <option>${modal.size[3]}</option>
                          <option>${modal.size[4]}</option>
                        </select>
                        <div class="nice-select" tabindex="0">
                          <span class="current">s</span>
                          <ul class="list">
                            <li data-value="${
                              modal.size[0]
                            }" class="option selected">${modal.size[0]}</li>
                            <li data-value="${modal.size[1]}" class="option">${
    modal.size[1]
  }</li>
                            <li data-value="${modal.size[2]}" class="option">${
    modal.size[2]
  }</li>
                            <li data-value="${modal.size[3]}" class="option">${
    modal.size[3]
  }</li>
                            <li data-value="${modal.size[4]}" class="option">${
    modal.size[4]
  }</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="default-social">
                    <h4 class="share-now">Share:</h4>
                    <ul>
                      <li>
                        <a class="facebook" href="#"><i class="fa fa-facebook"></i></a>
                      </li>
                      <li>
                        <a class="twitter" href="#"><i class="fa fa-twitter"></i></a>
                      </li>
                      <li>
                        <a class="youtube" href="#"><i class="fa fa-pinterest-p"></i></a>
                      </li>
                      <li>
                        <a class="dribbble" href="#"><i class="fa fa-google-plus"></i></a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      </div>`;
  let modalHTML = document.querySelector(".js-absolute");
  modalHTML.innerHTML = html;
  modalHTML.classList.remove("hidden");
  document.querySelector(".js-close-btn").addEventListener("click", () => {
    modalHTML.innerHTML = "";
    modalHTML.classList.add("hidden");
  });
}

export function generateActiveProduct(activeProduct) {
  const { productId } = activeProduct.dataset;
  localStorage.setItem(`productId`, productId);
  window.location.href = "./shop/product-detail.html";
}
