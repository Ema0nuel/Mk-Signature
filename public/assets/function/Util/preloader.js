window.addEventListener("load", function () {
  const preloader = document.getElementById("preloader");
  const page = document.getElementById("root");

  if (!preloader || !page) return;

  // Function to check if #root has rendered content
  const checkPageReady = () => {
    // You can customize this condition based on your app's structure
    return page.children.length > 0 || page.innerHTML.trim() !== "";
  };

  const waitForPageContent = () => {
    const interval = setInterval(() => {
      if (checkPageReady()) {
        clearInterval(interval);
        setTimeout(() => {
          preloader.classList.add("hidden");
          page.classList.add("animate-after-load");
        }, 500); // Optional delay
      }
    }, 100); // Check every 100ms
  };

  waitForPageContent();
});

export function startPreloader() {
  const preloader = document.getElementById("preloader");
  const page = document.getElementById("root");
  if (preloader || page) {
    preloader.classList.remove("hidden");
    page.classList.remove("animate-after-load");
  }
}

export function endPreloader(duration = 500) {
  const preloader = document.getElementById("preloader");
  const page = document.getElementById("root");
  if (!preloader || !page) return;

  // Function to check if #root has rendered content
  const checkPageReady = () => {
    // You can customize this condition based on your app's structure
    return page.children.length > 0 || page.innerHTML.trim() !== "";
  };

  const waitForPageContent = () => {
    const interval = setInterval(() => {
      if (checkPageReady()) {
        clearInterval(interval);
        setTimeout(() => {
          preloader.classList.add("hidden");
          page.classList.add("animate-after-load");
        }, duration); // Optional delay
      }
    }, 100); // Check every 100ms
  };

  waitForPageContent();
}
