export const formatIndianCurrency = (num) => {
   if (num === null || num === undefined) return "₹0.00";

   // Convert to 2 decimal places and split by decimal point
   const parts = num.toFixed(2).toString().split('.');

   // Format the integer part with commas for Indian numbering system
   // First 3 digits from right get a comma, then every 2 digits get a comma
   const integerPart = parts[0];
   const lastThree = integerPart.length > 3 ? integerPart.substring(integerPart.length - 3) : integerPart;
   const remaining = integerPart.length > 3 ? integerPart.substring(0, integerPart.length - 3) : '';
   const formattedInteger = remaining ? remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree : lastThree;

   // Add the decimal part back
   return '₹' + formattedInteger + '.' + parts[1];
};