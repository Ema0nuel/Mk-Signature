import { showNotificationToastr } from "../Util/notification.js";

// Load Paystack script if not already loaded
function loadPaystackScript() {
  return new Promise((resolve) => {
    if (window.PaystackPop) return resolve();
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = resolve;
    document.body.appendChild(script);
  });
}

/**
 * Launch Paystack payment modal and validate payment on client side
 * @param {Object} options - {email, amount, reference, onSuccess, onCancel}
 */
export async function payWithPaystack(options) {
  await loadPaystackScript();

  if (!window.PaystackPop) {
    showNotificationToastr("Payment system failed to load.", "error");
    return false;
  }

  // Defensive: Ensure callbacks are always functions
  const onSuccess =
    typeof options.onSuccess === "function" ? options.onSuccess : () => {};
  const onCancel =
    typeof options.onCancel === "function" ? options.onCancel : () => {};

  try {
    const handler = window.PaystackPop.setup({
      key: "pk_test_eed3a34e6bdd1af5f4e0df16bc4b9366df475d9d", // <-- Your Paystack PUBLIC key
      email: options.email,
      amount: Math.round(options.amount * 100), // Paystack expects amount in kobo
      currency: "NGN",
      ref: options.reference,
      callback: function (response) {
        // Client-side validation: check if reference exists
        if (response && response.reference) {
          showNotificationToastr("Payment successful!", "success");
          onSuccess(response);
        } else {
          showNotificationToastr("Payment could not be validated.", "error");
          onCancel();
        }
      },
      onClose: function () {
        showNotificationToastr("Payment was cancelled.", "warning");
        onCancel();
      },
    });

    handler.openIframe();
  } catch (err) {
    showNotificationToastr("Payment could not be initialized.", "error");
    onCancel();
  }
}
