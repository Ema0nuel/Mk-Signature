import { Navbar } from "../components/Navbar.js"
import { showSpinner } from "../components/spinner.js";

export default async function adminSettings(renderPageHTML) {
    let body = document.querySelector("body");
    body.innerHTML =
        `
      ${Navbar("settings")}
    
      <div class="w-full" id="main-section"></div>
      `;
    
      // In your admin page loader:
      const mainSection = document.getElementById("main-section"); // or any container
      await showSpinner(mainSection, 1200); // optional custom duration
      mainSection.innerHTML = "...your page content...";
    
}