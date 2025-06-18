/**
 * Show a dynamic spinner in a container element.
 * @param {HTMLElement} container - The element to show the spinner in.
 * @param {number} duration - Duration in ms before removing spinner (default 900ms).
 * @returns {Promise} Resolves when spinner is removed.
 */
export function showSpinner(container, duration = 900) {
    // Remove any existing spinner
    const old = container.querySelector(".mk-spinner");
    if (old) old.remove();

    // Spinner HTML (centered vertically and horizontally in container)
    const spinner = document.createElement("div");
    spinner.className = `
    mk-spinner
    flex
    justify-center
    items-center
    w-full
    h-full
    min-h-[200px]
    min-w-[100px]
    absolute
    left-0
    top-0
    z-10
  `.replace(/\s+/g, ' ');

    spinner.innerHTML = `
    <div class="animate-spin rounded-full border-4 border-pink-500 border-t-transparent h-12 w-12"></div>
  `;

    // Set container to relative if not already positioned
    if (getComputedStyle(container).position === "static") {
        container.style.position = "relative";
    }

    container.appendChild(spinner);

    return new Promise((resolve) => {
        setTimeout(() => {
            spinner.remove();
            resolve();
        }, duration);
    });
}