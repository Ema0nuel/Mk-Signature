import { products, formateCurrency } from "../data/products.js";
import { addToCart, displayShoppingItems } from "./cart.js";

displayShoppingItems();
let html = "";
let activeProductId = localStorage.getItem("productId");
const successMessage = document.getElementById("d-message");
products.forEach((product) => {
  if (product.id === activeProductId) {
    document.title = product.name;
    html = `
    <section class="shop single section">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="row">
              <div class="col-lg-6 col-12">
                <!-- Product Slider -->
                <div class="product-gallery">
                  <!-- Images slider -->
                  <div class="flexslider-thumbnails">
                    <div
                      class="flex-viewport"
                      style="overflow: hidden; position: relative"
                    >
                      <ul
                        class="slides"
                        style="
                          width: 1200%;
                          transition-duration: 0.6s;
                          transform: translate3d(-1968px, 0px, 0px);
                        "
                      >
                        <li
                          data-thumb="../images/products/${product.images[0]}"
                          class="clone"
                          style="width: 492px; float: left; display: block"
                        >
                          <img src="../images/products/${product.images[0]}" />
                        </li>
                        <li
                          data-thumb="../images/products/${product.images[1]}"
                          rel="adjustX:10, adjustY:"
                          class=""
                          style="width: 492px; float: left; display: block"
                        >
                          <img src="../images/products/${
                            product.images[1]
                          }" alt="#" />
                        </li>
                        <li
                          data-thumb="../images/products/${product.images[2]}"
                          class=""
                          style="width: 492px; float: left; display: block"
                        >
                          <img src="../images/products/${
                            product.images[2]
                          }" alt="#" />
                        </li>
                        <li
                          data-thumb="../images/products/${product.images[3]}"
                          style="width: 492px; float: left; display: block"
                          class=""
                        >
                          <img src="../images/products/${
                            product.images[3]
                          }" alt="#" />
                        </li>
                      </ul>
                    </div>
                    <ul class="flex-direction-nav">
                      <li><a class="flex-prev"></a></li>
                      <li><a class="flex-next"></a></li>
                    </ul>
                  </div>
                  <!-- End Images slider -->
                </div>
                <!-- End Product slider -->
              </div>
              <div class="col-lg-6 col-12">
                <div class="product-des">
                  <!-- Description -->
                  <div class="short">
                    <h4>${product.name}</h4>
                    <div class="rating-main">
                      <ul class="rating">
                        <img src="../images/ratings/${product.rating}.png" />
                      </ul>
                      <a class="total-review">(${product.reviews}) Review</a>
                    </div>
                    <p class="price">
                      <span class="discount"><i class="fa-solid fa-naira-sign"></i>${formateCurrency(
                        product.priceCents
                      )}</span><s>${
      product.oldPriceCents === null
        ? ""
        : `<i class="fa-solid fa-naira-sign"></i>${formateCurrency(
            product.oldPriceCents
          )}`
    }</s>
                    </p>
                    <p class="description">
                      ${product.description}
                    </p>
                  </div>
                  <!--/ End Description -->
                  <!-- Color -->
                  <div class="color">
                    <h4>Available Options <span>Color</span></h4>
                    <ul>
                      <li>
                        <a class="${product.colors[0].toLowerCase()}"><i class="ti-check"></i></a>
                      </li>
                      <li>
                        <a class="${product.colors[1].toLowerCase()}"><i class="ti-check"></i></a>
                      </li>
                      <li>
                        <a class="${product.colors[2].toLowerCase()}"><i class="ti-check"></i></a>
                      </li>
                    </ul>
                  </div>
                  <!--/ End Color -->
                  <!-- Size -->
                  <div class="size">
                    <h4>Size</h4>
                    <ul>
                      <li><a class="one">S</a></li>
                      <li><a class="two">M</a></li>
                      <li><a class="three">L</a></li>
                      <li><a class="four">XL</a></li>
                      <li><a class="four">XXL</a></li>
                    </ul>
                  </div>
                  <!--/ End Size -->
                  <!-- Product Buy -->
                  <div class="product-buy">
                    <div class="quantity">
                      <h6>Quantity :</h6>
                      <!-- Input Order -->
                      <div class="input-group">
                        <input
                          type="number"
                          class="input-number js-selected js-selected-quantity"
                          data-min="1"
                          data-max="1000"
                          value="1"
                        />
                      </div>
                      <!--/ End Input Order -->
                    </div>
                    <div class="add-to-cart">
                      <a title="Add to cart" class="btn js-add-to-cart cursor-pointer" data-product-id="${
                        product.id
                      }">Add to cart</a>
                    </div>
                    <p class="cat">Category :<a>${product.category[0]}</a><a>${
      product.category[1]
    }</a></p>
                    <p class="availability">
                      Availability : ${product.availability},Up
                    </p>
                  </div>
                  <!--/ End Product Buy -->
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <div class="product-info">
                  <div class="nav-main">
                    <!-- Tab Nav -->
                    <ul class="nav nav-tabs" id="myTab" role="tablets">
                      <li class="nav-item">
                        <a
                          class="nav-link active"
                          data-toggle="tab"
                          href="#description"
                          role="tab"
                          >Description</a
                        >
                      </li>
                      <li class="nav-item">
                        <a
                          class="nav-link"
                          data-toggle="tab"
                          href="#reviews"
                          role="tab"
                          >Reviews</a
                        >
                      </li>
                    </ul>
                    <!--/ End Tab Nav -->
                  </div>
                  <div class="tab-content" id="myTabContent">
                    <!-- Description Tab -->
                    <div
                      class="tab-pane fade show active"
                      id="description"
                      role="tabpanel"
                    >
                      <div class="tab-single">
                        <div class="row">
                          <div class="col-12">
                            <div class="single-des">
                              <p>
                                ${product.description}
                              </p>
                            </div>
                            <div class="single-des">
                              <p>
                                ${product.description}
                              </p>
                            </div>
                            <div class="single-des">
                              <h4>Product Features:</h4>
                              <ul>
                                <li>long established fact.</li>
                                <li>has a more-or-less normal distribution.</li>
                                <li>many variations of passages of.</li>
                                <li>generators on the Interne.</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!--/ End Description Tab -->
                    <!-- Reviews Tab -->
                    <div class="tab-pane fade" id="reviews" role="tabpanel">
                      <div class="tab-single review-panel">
                        <div class="row">
                          <div class="col-12">
                            <div class="ratting-main">
                              <div class="avg-ratting">
                                <h4>4.5 <span>(Overall)</span></h4>
                                <span>Based on 1 Comments</span>
                              </div>
                              <!-- Single Rating -->
                              <div class="single-rating">
                                <div class="rating-author">
                                  <img src="../images/users/comment1.jpg" alt="#" />
                                </div>
                                <div class="rating-des">
                                  <h6>Animus Ragman</h6>
                                  <div class="ratings">
                                    <ul class="rating">
                                      <li><i class="fa fa-star"></i></li>
                                      <li><i class="fa fa-star"></i></li>
                                      <li><i class="fa fa-star"></i></li>
                                      <li><i class="fa fa-star-half-o"></i></li>
                                      <li><i class="fa fa-star-o"></i></li>
                                    </ul>
                                    <div class="rate-count">
                                      (<span>3.5</span>)
                                    </div>
                                  </div>
                                  <p>
                                    Dubs tincidunt Maurois ac Aleut cone.
                                    Donec vestibulum consent cruses. Aliquam
                                    pellentesque nulls dolor, in impedient.
                                  </p>
                                </div>
                              </div>
                              <!--/ End Single Rating -->
                              <!-- Single Rating -->
                              <div class="single-rating">
                                <div class="rating-author">
                                  <img src="../images/users/comment2.jpg" alt="#" />
                                </div>
                                <div class="rating-des">
                                  <h6>Advil Gera</h6>
                                  <div class="ratings">
                                    <ul class="rating">
                                      <li><i class="fa fa-star"></i></li>
                                      <li><i class="fa fa-star"></i></li>
                                      <li><i class="fa fa-star"></i></li>
                                      <li><i class="fa fa-star"></i></li>
                                      <li><i class="fa fa-star"></i></li>
                                    </ul>
                                    <div class="rate-count">
                                      (<span>5.0</span>)
                                    </div>
                                  </div>
                                  <p>
                                    Dubs tincidunt maurist ac aliquant cone.
                                    Donec vestibulum consult cruses. Aliquam
                                    pellentesque nullo dolor, in impede.
                                  </p>
                                </div>
                              </div>
                              <!--/ End Single Rating -->
                            </div>
                            <!-- Review -->
                            <div class="comment-review">
                              <div class="add-review">
                                <h5>Add A Review</h5>
                                <p>
                                  Your email address will not be published.
                                  Required fields are marked
                                </p>
                              </div>
                              <h4>Your Rating</h4>
                              <div class="review-inner">
                                <div class="ratings">
                                  <ul class="rating">
                                    <li><i class="fa fa-star"></i></li>
                                    <li><i class="fa fa-star"></i></li>
                                    <li><i class="fa fa-star"></i></li>
                                    <li><i class="fa fa-star"></i></li>
                                    <li><i class="fa fa-star"></i></li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <!--/ End Review -->
                            <!-- Form -->
                            <form
                              class="form"
                              
                            >
                              <div class="row">
                                <div class="col-lg-6 col-12">
                                  <div class="form-group">
                                    <label>Your Name<span>*</span></label>
                                    <input
                                      type="text"
                                      name="name"
                                      required="required"
                                      placeholder=""
                                    />
                                  </div>
                                </div>
                                <div class="col-lg-6 col-12">
                                  <div class="form-group">
                                    <label>Your Email<span>*</span></label>
                                    <input
                                      type="email"
                                      name="email"
                                      required="required"
                                      placeholder=""
                                    />
                                  </div>
                                </div>
                                <div class="col-lg-12 col-12">
                                  <div class="form-group">
                                    <label>Write a review<span>*</span></label>
                                    <textarea
                                      name="message"
                                      rows="6"
                                      placeholder=""
                                    ></textarea>
                                  </div>
                                </div>
                                <div class="col-lg-12 col-12">
                                  <div class="form-group button5">
                                    <button type="submit" class="btn">
                                      Submit
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </form>
                            <!--/ End Form -->
                          </div>
                        </div>
                      </div>
                    </div>
                    <!--/ End Reviews Tab -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
        `;
  }
});
document.querySelector(".js-single-product-details").innerHTML = html;
// AddToCart
const addCartBtn = document.querySelector(".js-add-to-cart");
const selectedQuantity = document.querySelector(".js-selected");
addCartBtn.addEventListener("click", () => {
  let selectedItem = Number(selectedQuantity.value);
  if (selectedItem <= 0 || selectedItem >= 100) {
    alert("Invalid Value");
  } else {
    addToCart(addCartBtn, selectedItem);
    successMessage.classList.add("success");
    setTimeout(() => {
      successMessage.classList.remove("success");
    }, 2000);
  }
});
