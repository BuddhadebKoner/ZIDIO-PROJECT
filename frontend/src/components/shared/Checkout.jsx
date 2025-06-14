import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom';
import { X, AlertTriangle, MapPin, CreditCard, Wallet, DollarSign, CreditCard as CardIcon, CheckCircle } from 'lucide-react';
import { formatIndianCurrency } from '../../utils/amountFormater';
import { toast } from 'react-toastify';
import { usePlaceOrderOnlinePayment, usePlaceOrderCashOnDelivery, usePlaceOrderCashAndOnlineMixed } from '../../lib/query/queriesAndMutation';

const Checkout = ({ onClose, cartData, summaryData }) => {
   const { currentUser, isLoading } = useAuth();
   const navigate = useNavigate();
   const [paymentProcessing, setPaymentProcessing] = useState(false);
   const [paymentMethod, setPaymentMethod] = useState('ONLINE');
   const [checkoutStatus, setCheckoutStatus] = useState({ success: false, error: null });
   const [addressErrors, setAddressErrors] = useState([]);
   const [partialPaymentAmount, setPartialPaymentAmount] = useState(1000);
   const [partialPaymentError, setPartialPaymentError] = useState('');

   const [addressData, setAddressData] = useState(currentUser?.address || {});

   // Initialize payment mutation hooks
   const placeOnlineOrderMutation = usePlaceOrderOnlinePayment();
   const placeCODOrderMutation = usePlaceOrderCashOnDelivery();
   const placeMixedOrderMutation = usePlaceOrderCashAndOnlineMixed();

   useEffect(() => {
      if (currentUser?.address) {
         setAddressData(currentUser.address);
         validateAddress(currentUser.address);
      } else {
         validateAddress({});
      }
   }, [currentUser]);

   const validateAddress = (address) => {
      const errors = [];
      if (!address || Object.keys(address).length === 0) {
         errors.push("No address information found");
         setAddressErrors(errors);
         return errors;
      }

      if (!address.name && !currentUser?.fullName) errors.push("Name is required");
      if (!address.phone && !currentUser?.phone) errors.push("Phone number is required");
      if (!address.city) errors.push("City is required");
      if (!address.state) errors.push("State is required");
      if (!address.pincode && !address.postalCode) errors.push("Postal code is required");

      setAddressErrors(errors);
      return errors;
   };

   const hasValidAddress = addressErrors.length === 0;

   const handleRedirectToAddress = () => {
      onClose();
      navigate('/profile/address', {
         state: {
            returnToCheckout: true,
            missingFields: addressErrors
         }
      });
   };

   const validateOrderData = (orderData) => {

      if (!orderData.purchaseProducts || orderData.purchaseProducts.length === 0) {
         throw new Error("No items in cart");
      }

      if (!currentUser.address ||
         !currentUser.address._id ||
         !currentUser.address.city ||
         !currentUser.address.state ||
         !currentUser.address.country ||
         !currentUser.address.postalCode ||
         !currentUser.address.addressLine1 ||
         !currentUser.fullName ||
         !currentUser.phone
      ) {
         throw new Error("Incomplete shipping address");
      }

      return true;
   };

   const validatePartialPayment = (amount) => {
      const numAmount = parseFloat(amount);
      
      if (numAmount > summaryData.finalTotal) {
         setPartialPaymentError('Amount cannot exceed total order value');
         return false;
      }
      
      setPartialPaymentError('');
      return true;
   };

   const handlePartialAmountChange = (e) => {
      const value = e.target.value;
      setPartialPaymentAmount(value);
      validatePartialPayment(value);
   };

   const handleCreateOrder = () => {
      const purchaseProducts = cartData.items.map(item => {
         return {
            productId: item._id,
            title: item.title,
            subTitle: item.subTitle,
            slug: item.slug,
            imagesUrl: item.images && item.images.length > 0 ? item.images[0].imageUrl : "",
            selectedSize: item.selectedSize,
            quantity: item.quantity,
            payableAmount: item.subTotal
         };
      });

      // Cart total without delivery charges
      const cartTotal = cartData.cartTotal;
      
      // Get delivery charge from summary data
      const deliveryCharge = summaryData.isFreeDelivery ? 0 : summaryData.deliveryCharge;
      
      // Total payable amount (cart total + delivery charge)
      const payableAmount = cartTotal + deliveryCharge;

      const totalDiscount = cartData.items.reduce((total, item) => {
         if (item.hasDiscount && item.originalPrice && item.price) {
            return total + ((item.originalPrice - item.price) * item.quantity);
         }
         return total;
      }, 0);

      let payInCashAmount = 0;
      let payInOnlineAmount = 0;
      let orderType = 'ONLINE';

      if (paymentMethod === 'cod') {
         payInCashAmount = payableAmount;
         orderType = 'COD';
      } else if (paymentMethod === 'ONLINE') {
         payInOnlineAmount = payableAmount;
         orderType = 'ONLINE';
      } else if (paymentMethod === 'partial') {
         // Use custom amount for partial payment
         payInOnlineAmount = parseFloat(partialPaymentAmount);
         payInCashAmount = payableAmount - payInOnlineAmount;
         orderType = 'COD+ONLINE';
      }

      const orderData = {
         user: currentUser?._id,
         purchaseProducts: purchaseProducts,
         deliveryAddress: addressData._id,
         cartTotal: cartTotal,
         deliveryCharge: deliveryCharge, // Add separate delivery charge field
         payableAmount: payableAmount,
         totalDiscount: totalDiscount,
         orderType: orderType,
         payInCashAmount: payInCashAmount,
         payInOnlineAmount: payInOnlineAmount
      };
      return orderData;
   };

   const handlePayment = async (orderData) => {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (paymentMethod === 'cod') {
         return { success: true, transactionId: null };
      }

      const txnId = 'txn_' + Math.random().toString(36).substr(2, 9);
      return { success: true, transactionId: txnId };
   };

   const handleCheckout = async () => {
      try {
         setPaymentProcessing(true);
         setCheckoutStatus({ success: false, error: null });

         // Validate partial payment amount when that method is selected
         if (paymentMethod === 'partial' && !validatePartialPayment(partialPaymentAmount)) {
            setPaymentProcessing(false);
            return;
         }

         const orderData = handleCreateOrder();

         try {
            validateOrderData(orderData);
            console.log("Order data validated successfully", orderData);
         } catch (validationError) {
            throw new Error(`Validation failed: ${validationError.message}`);
         }

         const paymentResponse = await handlePayment(orderData);

         if (paymentResponse.success) {
            // Select the appropriate mutation based on payment method
            let orderResponse;

            if (paymentMethod === 'cod') {
               orderResponse = await placeCODOrderMutation.mutateAsync(orderData);
            } else if (paymentMethod === 'ONLINE') {
               orderResponse = await placeOnlineOrderMutation.mutateAsync(orderData);
            } else if (paymentMethod === 'partial') {
               orderResponse = await placeMixedOrderMutation.mutateAsync(orderData);
            }

            console.log("Order response:", orderResponse);

            if (orderResponse.success) {
               if (paymentMethod === 'cod') {
                  // For COD orders, redirect to order confirmation page
                  setCheckoutStatus({
                     success: true,
                     error: null,
                     orderId: orderResponse.data?.orderId
                  });
                  setPaymentProcessing(false);

                  // Redirect to order success page
                  navigate(`/profile/orders`);
               } else {
                  // For ONLINE/partial payment methods, check for payment URL
                  if (!orderResponse.data?.paymentUrl) {
                     toast.error(orderResponse.message || "Failed to create payment session");
                     throw new Error(orderResponse.message || "Failed to create payment session");
                  }

                  // Redirect to payment URL
                  window.location.href = orderResponse.data.paymentUrl;

                  setCheckoutStatus({
                     success: true,
                     error: null,
                     orderId: orderResponse.data?.orderId
                  });
                  setPaymentProcessing(false);
               }
            } else {
               throw new Error(orderResponse.message || "Failed to place order");
            }
         } else {
            throw new Error("Payment processing failed");
         }
      } catch (error) {
         console.error("Checkout failed:", error);
         setPaymentProcessing(false);
         setCheckoutStatus({ success: false, error: error.message });
      }
   };

   if (isLoading) {
      return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/40 bg-opacity-50">
            <div className="relative w-full max-w-md p-6 mx-4 rounded-lg glass-morphism">
               <div className="flex flex-col items-center justify-center p-6">
                  <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-text">Loading your checkout information...</p>
               </div>
            </div>
         </div>
      );
   }

   const getButtonText = () => {
      if (paymentProcessing) return "Processing...";

      switch (paymentMethod) {
         case 'cod':
            return `Place Order - ${formatIndianCurrency(summaryData.finalTotal)}`;
         case 'ONLINE':
            return `Pay ${formatIndianCurrency(summaryData.finalTotal)}`;
         case 'partial':
            const onlineAmount = parseFloat(partialPaymentAmount) || 0;
            const codAmount = summaryData.finalTotal - onlineAmount;
            return `Pay ${formatIndianCurrency(onlineAmount)} now & ${formatIndianCurrency(codAmount)} on delivery`;
         default:
            return `Pay ${formatIndianCurrency(summaryData.finalTotal)}`;
      }
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/40 bg-opacity-50">
         <div className="relative w-full max-w-md p-6 mx-4 rounded-lg glass-morphism red-velvet-border">
            <button
               onClick={onClose}
               className="absolute top-4 right-4 text-text-muted hover:text-text transition-colors cursor-pointer"
               aria-label="Close checkout"
            >
               <X size={20} />
            </button>

            <h2 className="mb-6 text-xl font-semibold text-text">Checkout</h2>

            {checkoutStatus.error && (
               <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-md flex items-start">
                  <AlertTriangle size={18} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-300">{checkoutStatus.error}</p>
               </div>
            )}

            {!hasValidAddress ? (
               <div className="mb-6 p-4 bg-gray-800 rounded-md">
                  <div className="flex items-center justify-center mb-4">
                     <MapPin size={20} className="mr-2 text-primary-400" />
                     <h3 className="font-medium">Address Information Required</h3>
                  </div>

                  {addressErrors.length > 0 && (
                     <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-md">
                        <p className="text-sm text-red-300 mb-2 font-medium">Please complete the following required fields:</p>
                        <ul className="list-disc pl-5 text-sm text-red-300">
                           {addressErrors.map((error, index) => (
                              <li key={index}>{error}</li>
                           ))}
                        </ul>
                     </div>
                  )}

                  <p className="text-text-muted mb-4">
                     Please complete your shipping address to continue with checkout.
                  </p>
                  <button
                     onClick={handleRedirectToAddress}
                     className="w-full py-2 font-medium bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
                  >
                     {addressData && Object.keys(addressData).length > 0 ? 'Update Address' : 'Add Address'}
                  </button>
               </div>
            ) : (
               <>
                  <div className="mb-6">
                     <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                           <MapPin size={18} className="mr-2 text-primary-400" />
                           <h3 className="font-medium">Shipping Address</h3>
                        </div>
                        <button
                           onClick={handleRedirectToAddress}
                           className="text-sm text-secondary-500 hover:text-secondary-400"
                        >
                           Edit
                        </button>
                     </div>

                     <div className="p-3 bg-gray-800 rounded-md">
                        <p className="font-medium">{addressData.name || currentUser?.fullName}</p>
                        <p className="text-sm text-text-muted">{addressData.phone || currentUser?.phone}</p>
                        {/* <p className="text-sm text-text-muted">{addressData.street}</p> */}
                        <p className="text-sm text-text-muted">
                           {addressData.city}, {addressData.state} - {addressData.postalCode || addressData.pincode}
                        </p>
                     </div>
                  </div>

                  <div className="mb-6">
                     <div className="flex items-center mb-3">
                        <CreditCard size={18} className="mr-2 text-primary-400" />
                        <h3 className="font-medium">Payment Summary</h3>
                     </div>

                     <div className="space-y-2">
                        <div className="flex justify-between">
                           <span className="text-text-muted">Cart Value</span>
                           <span>{formatIndianCurrency(cartData.cartTotal)}</span>
                        </div>

                        <div className="flex justify-between">
                           <span className="text-text-muted">Delivery Charge</span>
                           {summaryData.isFreeDelivery ? (
                              <span className="text-green-500">FREE</span>
                           ) : (
                              <span>{formatIndianCurrency(summaryData.deliveryCharge)}</span>
                           )}
                        </div>

                        <div className="border-t border-gray-700 my-2"></div>

                        <div className="flex justify-between font-semibold">
                           <span>Total</span>
                           <span>{formatIndianCurrency(summaryData.finalTotal)}</span>
                        </div>
                     </div>
                  </div>

                  <div className="mb-6">
                     <div className="flex items-center mb-3">
                        <Wallet size={18} className="mr-2 text-primary-400" />
                        <h3 className="font-medium">Payment Method</h3>
                     </div>

                     <div className="grid grid-cols-3 gap-2">
                        <label
                           className={`flex flex-col items-center justify-center p-3 rounded-md border cursor-pointer transition-all ${paymentMethod === 'cod'
                              ? 'border-primary-500 bg-primary-950'
                              : 'border-gray-700 bg-gray-800'
                              }`}>
                           <input
                              type="radio"
                              name="paymentMethod"
                              value="cod"
                              checked={paymentMethod === 'cod'}
                              onChange={() => setPaymentMethod('cod')}
                              className="sr-only"
                              aria-label="Cash on Delivery"
                           />
                           <DollarSign size={24} className={paymentMethod === 'cod' ? 'text-primary-400' : 'text-text-muted'} />
                           <span className={`text-xs mt-2 text-center ${paymentMethod === 'cod' ? 'text-text' : 'text-text-muted'}`}>
                              Cash on Delivery
                           </span>
                        </label>

                        <label
                           className={`flex flex-col items-center justify-center p-3 rounded-md border cursor-pointer transition-all ${paymentMethod === 'ONLINE'
                              ? 'border-primary-500 bg-primary-950'
                              : 'border-gray-700 bg-gray-800'
                              }`}>
                           <input
                              type="radio"
                              name="paymentMethod"
                              value="ONLINE"
                              checked={paymentMethod === 'ONLINE'}
                              onChange={() => setPaymentMethod('ONLINE')}
                              className="sr-only"
                              aria-label="ONLINE Payment"
                           />
                           <CardIcon size={24} className={paymentMethod === 'ONLINE' ? 'text-primary-400' : 'text-text-muted'} />
                           <span className={`text-xs mt-2 text-center ${paymentMethod === 'ONLINE' ? 'text-text' : 'text-text-muted'}`}>
                              ONLINE Payment
                           </span>
                        </label>

                        <label
                           className={`flex flex-col items-center justify-center p-3 rounded-md border cursor-pointer transition-all ${paymentMethod === 'partial'
                              ? 'border-primary-500 bg-primary-950'
                              : 'border-gray-700 bg-gray-800'
                              }`}>
                           <input
                              type="radio"
                              name="paymentMethod"
                              value="partial"
                              checked={paymentMethod === 'partial'}
                              onChange={() => setPaymentMethod('partial')}
                              className="sr-only"
                              aria-label="Partial Payment"
                           />
                           <div className="flex">
                              <CardIcon size={16} className={paymentMethod === 'partial' ? 'text-primary-400' : 'text-text-muted'} />
                              <span className="mx-1">+</span>
                              <DollarSign size={16} className={paymentMethod === 'partial' ? 'text-primary-400' : 'text-text-muted'} />
                           </div>
                           <span className={`text-xs mt-2 text-center ${paymentMethod === 'partial' ? 'text-text' : 'text-text-muted'}`}>
                              Pay Partial
                           </span>
                        </label>
                     </div>

                     {paymentMethod === 'partial' && (
                        <div className="mt-3 p-2 bg-gray-800 rounded-md text-xs text-text-muted">
                           <p>Pay a custom amount ONLINE now and the remaining on delivery.</p>
                           <div className="mt-2">
                              <input
                                 type="number"
                                 value={partialPaymentAmount}
                                 onChange={handlePartialAmountChange}
                                 className="w-full p-2 rounded-md bg-gray-700 text-text"
                                 placeholder="Enter amount"
                              />
                              {partialPaymentError && (
                                 <p className="text-red-500 text-xs mt-1">{partialPaymentError}</p>
                              )}
                           </div>
                        </div>
                     )}
                  </div>

                  <button
                     onClick={handleCheckout}
                     disabled={paymentProcessing}
                     className={`w-full py-3 rounded-md font-medium transition-all flex items-center justify-center ${paymentProcessing
                        ? "bg-primary-700 cursor-not-allowed"
                        : "bg-primary-600 hover:bg-primary-700 cursor-pointer"
                        }`}
                  >
                     {paymentProcessing ? (
                        <>
                           <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                           {getButtonText()}
                        </>
                     ) : (
                        getButtonText()
                     )}
                  </button>
               </>
            )}
         </div>
      </div>
   );
};

export default Checkout;