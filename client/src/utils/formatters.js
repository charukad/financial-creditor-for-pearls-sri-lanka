// client/src/utils/formatters.js

// Format a date in a localized, human-readable format
export const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Format a number as currency (LKR)
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format a percentage
export const formatPercent = (value) => {
  return new Intl.NumberFormat("en-LK", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

// Format a number with thousands separators
export const formatNumber = (value) => {
  return new Intl.NumberFormat("en-LK").format(value);
};
