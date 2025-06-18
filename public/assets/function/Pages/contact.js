import { showNotification } from "../Util/notification.js";

export default function contact(renderPageHTML) {
  window.scrollTo(0, 0);
  renderPageHTML.innerHTML = `
    <section id="contact-us" class="contact-us section py-10 bg-gray-50 min-h-screen animate-fade-in-up">
      <div class="max-w-6xl mx-auto px-4">
        <div class="mb-8 text-center">
          <h2 class="text-3xl md:text-4xl font-bold text-pink-600 mb-2">Get in touch</h2>
          <p class="text-gray-600 text-lg">We'd love to hear from you! Fill out the form below or reach us via phone or email.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Contact Form -->
          <div class="md:col-span-2 bg-white rounded-xl shadow p-8">
            <h3 class="text-xl font-semibold mb-4">Write us a message</h3>
            <form class="js-contact-form space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block font-semibold mb-1">Your Name<span class="text-pink-600">*</span></label>
                  <input name="cName" type="text" placeholder="John Doe" required class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Your Subject<span class="text-pink-600">*</span></label>
                  <input name="cSubject" type="text" placeholder="Title" required class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Your Email<span class="text-pink-600">*</span></label>
                  <input name="cEmail" type="email" placeholder="example@email.com" required class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Your Phone<span class="text-pink-600">*</span></label>
                  <input name="cPhone" type="tel" placeholder="+1234567890" required class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" />
                </div>
              </div>
              <div>
                <label class="block font-semibold mb-1">Your Message<span class="text-pink-600">*</span></label>
                <textarea name="cMessage" placeholder="This is a message" required class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500"></textarea>
              </div>
              <button type="submit" class="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow animate-bounce flex items-center justify-center gap-2">
                <i class="fas fa-paper-plane"></i> Send Message
              </button>
            </form>
          </div>
          <!-- Contact Info -->
          <div class="bg-white rounded-xl shadow p-8 flex flex-col gap-6">
            <div>
              <i class="fa fa-phone text-pink-600 text-2xl mb-2"></i>
              <h4 class="font-bold text-gray-800 mb-1">Call us Now:</h4>
              <ul class="text-gray-600">
                <li><a href="tel:+2348101510096" class="hover:text-primary"
                  >+2348101510096</a
                ></li>
              </ul>
            </div>
            <div>
              <i class="fa fa-envelope-open text-pink-600 text-2xl mb-2"></i>
              <h4 class="font-bold text-gray-800 mb-1">Email:</h4>
              <ul class="text-gray-600">
                <li><a
                  href="mailto:mksignasures@gmail.com"
                  class="hover:text-primary"
                  >mksignasures@gmail.com</a
                ></li>
              </ul>
            </div>
            <div>
              <i class="fa fa-location-arrow text-pink-600 text-2xl mb-2"></i>
              <h4 class="font-bold text-gray-800 mb-1">Our Address:</h4>
              <ul class="text-gray-600">
                <li>Shop 52, Igbogo Rd, Choba</li>
              <li>Port Harcourt, Rivers State</li>
              </ul>
            </div>
            <div>
              <h4 class="font-bold text-gray-800 mb-1">Follow Us</h4>
              <div class="flex gap-4 mt-2">
                <a href="https://api.whatsapp.com/send/?phone=2348101510096&text&type=phone_number&app_absent=0" class="text-green-500 text-2xl hover:scale-125 transition"><i class="fab fa-whatsapp"></i></a>
                <a href="https://www.instagram.com/mk_signasures/" class="text-pink-500 text-2xl hover:scale-125 transition"><i class="fab fa-instagram"></i></a>
              </div>
            </div>
          </div>
        </div>
        <!-- Newsletter -->
        <div class="max-w-2xl mx-auto mt-16 bg-white rounded-xl shadow p-8 text-center">
          <h4 class="text-xl font-bold mb-2">Newsletter</h4>
          <p class="text-gray-600 mb-4">Subscribe to our newsletter and get <span class="text-pink-600 font-bold">10%</span> off your first purchase</p>
          <form class="newsletter-inner js-newsletter flex flex-col sm:flex-row gap-2 justify-center">
            <input name="EMAIL" placeholder="Your email address" required type="email" class="flex-1 border rounded px-3 py-2 focus:ring-2 focus:ring-pink-500" />
            <button type="submit" class="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition">Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  `;

  // Contact form handler
  const form = renderPageHTML.querySelector(".js-contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      showNotification("Thank you for contacting us! We'll get back to you soon.", "success");
      form.reset();
    });
  }

  // Newsletter form handler
  const newsletter = renderPageHTML.querySelector(".js-newsletter");
  if (newsletter) {
    newsletter.addEventListener("submit", (e) => {
      e.preventDefault();
      showNotification("Subscribed to newsletter!", "success");
      newsletter.reset();
    });
  }
}