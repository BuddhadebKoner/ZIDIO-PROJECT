import React, { useMemo, useState } from 'react';
import { Shield, Tag, Truck, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';

const CartSummaryCard = ({ cartData }) => {
  const [isItemsOpen, setIsItemsOpen] = useState(false);

  // Calculate all summary data with accurate discount calculations
  const summaryData = useMemo(() => {
    if (!cartData || !cartData.items) return {};

    // Calculate totals with precise item-by-item approach
    let totalOriginalAmount = 0;
    let totalAfterDiscountAmount = 0;
    let totalSavings = 0;

    cartData.items.forEach(item => {
      const itemOriginalTotal = item.originalPrice * item.quantity;
      const itemCurrentTotal = item.price * item.quantity;

      totalOriginalAmount += itemOriginalTotal;
      totalAfterDiscountAmount += itemCurrentTotal;

      // Only calculate savings for items with discounts
      if (item.hasDiscount && item.offer && item.offer.active) {
        const itemSavings = itemOriginalTotal - itemCurrentTotal;
        totalSavings += itemSavings;
      }
    });

    // Verify that our calculated total matches the cartTotal
    // If there's a small difference due to rounding, use the cartTotal
    if (Math.abs(totalAfterDiscountAmount - cartData.cartTotal) < 1) {
      totalAfterDiscountAmount = cartData.cartTotal;
    }

    const discountPercentage = totalOriginalAmount > 0 ?
      ((totalSavings / totalOriginalAmount) * 100).toFixed(2) : "0.00";

    const isFreeDelivery = cartData.cartTotal >= 1000;
    const deliveryCharge = isFreeDelivery ? 0 : 49;
    const finalTotal = cartData.cartTotal + deliveryCharge;

    return {
      totalOriginalAmount,
      totalAfterDiscountAmount,
      totalSavings,
      discountPercentage,
      isFreeDelivery,
      deliveryCharge,
      finalTotal
    };
  }, [cartData]);

  if (!cartData || !summaryData.totalOriginalAmount) {
    return <div>Loading summary...</div>;
  }

  const toggleItems = () => {
    setIsItemsOpen(!isItemsOpen);
  };

  return (
    <div className="rounded-lg p-6 shadow-sm sticky top-20 glass-morphism">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-text">Order Summary</h2>
        <div className="flex items-center text-success text-xs">
          <Shield className="mr-1" size={14} />
          <span>Secure & Protected</span>
        </div>
      </div>

      {/* Items dropdown */}
      <div className="mb-4">
        <button
          onClick={toggleItems}
          className="w-full flex items-center justify-between py-2 border-b text-left"
        >
          <div className="flex items-center">
            <ShoppingBag size={16} className="mr-2" />
            <span>Items in Cart ({cartData.totalItems})</span>
          </div>
          {isItemsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isItemsOpen && (
          <div className="mt-2 space-y-3">
            {cartData.items.map((item) => (
              <div key={item._id} className="text-sm border-b pb-3">
                <div className="flex justify-between mb-1">
                  <div className="font-medium text-text">{item.title}</div>
                  <div className="text-text">₹{(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div className="flex justify-between text-text-muted">
                  <div className="flex flex-col">
                    <span>Size: {item.selectedSize}</span>
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <div className="text-right">
                    {item.hasDiscount && item.offer && item.offer.active && (
                      <div className="flex flex-col">
                        <span className="line-through text-text-muted">
                          ₹{(item.originalPrice * item.quantity).toFixed(2)}
                        </span>
                        <span className="text-success text-xs">
                          {item.offer.discountValue}% off
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calculation breakdown */}
      <div className="pb-10">
        <div className="text-sm font-medium mb-2 text-text">Price Details</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Total MRP</span>
            <span className="text-text">₹{summaryData.totalOriginalAmount.toFixed(2)}</span>
          </div>

          {summaryData.totalSavings > 0 && (
            <div className="flex justify-between text-success">
              <div className="flex items-center">
                <Tag className="mr-1" size={14} />
                <span>Discount on Products</span>
              </div>
              <span>-₹{summaryData.totalSavings.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-text-muted">Cart Value</span>
            <span className="text-text">₹{cartData.cartTotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <div className="flex items-center">
              <Truck className="mr-1" size={14} />
              <span className="text-text-muted">Delivery Charge</span>
            </div>
            {summaryData.isFreeDelivery ? (
              <span className="text-success">FREE</span>
            ) : (
              <span className="text-text">₹{summaryData.deliveryCharge.toFixed(2)}</span>
            )}
          </div>

          {summaryData.isFreeDelivery && (
            <div className="text-xs text-success italic text-right">
              Free delivery on orders above ₹1000
            </div>
          )}

          <div className="border-t my-2 border-gray-700"></div>

          <div className="flex justify-between font-semibold">
            <span className="text-text">Order Total</span>
            <span className="text-text">₹{summaryData.finalTotal.toFixed(2)}</span>
          </div>

          {summaryData.totalSavings > 0 && (
            <div className="bg-primary-950 p-2 rounded text-xs text-success font-medium text-center">
              You're saving ₹{summaryData.totalSavings.toFixed(2)} ({summaryData.discountPercentage}%) on this order!
            </div>
          )}
        </div>
      </div>

      <button className="w-full py-3 rounded-md bg-primary-600 hover:bg-primary-700 text-bg-white font-medium transition-all flex items-center justify-center">
        <span className="mr-2">Proceed to Checkout</span>
        <span>₹{summaryData.finalTotal.toFixed(2)}</span>
      </button>

      <a href="/" className="block text-center text-secondary-500 hover:text-secondary-400 mt-4 transition-all">
        Continue Shopping
      </a>
    </div>
  );
};

export default CartSummaryCard;