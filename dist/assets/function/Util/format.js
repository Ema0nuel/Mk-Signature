// Format number as Naira currency (₦)
export function formatMoneyAmount(amount) {
  if (typeof amount !== "number") amount = Number(amount) || 0;
  return amount.toLocaleString("en-NG", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
