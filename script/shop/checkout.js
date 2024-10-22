import { cart } from "./cart.js";
import { products, formateCurrency } from "../data/products.js";

export function renderCartTotal(summary) {
  let productPriceCent = 0;
  let checkProduct = [];
  products.forEach((product) => {
    cart.forEach((item) => {
      if (item.id === product.id) {
        checkProduct.push(product);
      }
    });
  });

  checkProduct.forEach((productItem) => {
    cart.forEach((item) => {
      if (item.id === productItem.id) {
        productPriceCent += productItem.priceCents * item.quantity;
      }
    });
  });
  const taxCents = productPriceCent * 0.1;
  const totalCents = taxCents + productPriceCent;

  const paymentSummaryHTMl = `     <div class="row">
            <div class="col-lg-8 col-md-5 col-12">
                <div class="left"></div>
            </div>
            <div class="col-lg-4 col-md-7 col-12">
                <div class="right">
                <ul>
                    <li>Cart Subtotal<span><i class="fa-solid fa-naira-sign"></i>${formateCurrency(
                      productPriceCent
                    )}</span></li>
                    <li>Shipping<span>Free</span></li>
                    <li>Tax Charges(10%)<span><i class="fa-solid fa-naira-sign"></i>${formateCurrency(
                      taxCents
                    )}</span></li>
                    <li class="last">Total<span><i class="fa-solid fa-naira-sign"></i>${formateCurrency(
                      totalCents
                    )}</span></li>
                </ul>
                <div class="button5">
                    <a href="./checkout.html" class="btn">Checkout</a>
                    <a href="./shop.html" class="btn">Continue shopping</a>
                </div>
                </div>
            </div>
        </div>
            
  `;

  summary.innerHTML = paymentSummaryHTMl;
}
