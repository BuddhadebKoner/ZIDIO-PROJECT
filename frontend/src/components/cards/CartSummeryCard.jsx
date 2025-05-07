import React, { useMemo, useState } from 'react';
import { Shield, Tag, Truck, ChevronDown, ChevronUp, ShoppingBag, AlertTriangle } from 'lucide-react';
import { formatIndianCurrency } from '../../utils/amountFormater';
import { Link } from 'react-router-dom';
import Checkout from '../shared/Checkout';

const CartSummaryCard = ({ cartData, productAvailable }) => {
  const [isItemsOpen, setIsItemsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const summaryData = useMemo(() => {
    if (!cartData || !cartData.items) return {};

    let totalOriginalAmount = 0;
    let totalAfterDiscountAmount = 0;
    let totalSavings = 0;

    cartData.items.forEach(item => {
      const itemOriginalTotal = item.originalPrice * item.quantity;
      const itemCurrentTotal = item.price * item.quantity;

      totalOriginalAmount += itemOriginalTotal;
      totalAfterDiscountAmount += itemCurrentTotal;

      if (item.hasDiscount && item.offer && item.offer.active) {
        const itemSavings = itemOriginalTotal - itemCurrentTotal;
        totalSavings += itemSavings;
      }
    });

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
    return <div className="p-6 rounded-lg shadow-sm text-center">Loading summary...</div>;
  }

  const toggleItems = () => setIsItemsOpen(!isItemsOpen);

  const handleCheckout = () => {
    if (productAvailable) {
      setShowCheckout(true);
      // console.log("Opening checkout with data:", summaryData, cartData);
    } else {
      console.log("Some items are out of stock");
    }
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
  };

  return (
    <>
      <div className="rounded-lg p-6 shadow-sm sticky top-20 glass-morphism red-velvet-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text">Order Summary</h2>
          <div className="flex items-center text-success text-xs">
            <Shield className="mr-1" size={14} />
            <span>Secure & Protected</span>
          </div>
        </div>

        {!productAvailable && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-md flex items-center text-red-600">
            <AlertTriangle size={16} className="mr-2" />
            <span className="text-sm font-medium">Some items are out of stock</span>
          </div>
        )}

        <div className="mb-4">
          <button
            onClick={toggleItems}
            className="w-full flex items-center justify-between py-2 border-b text-left"
          >
            <div className="flex items-center cursor-pointer">
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
                    <div className="text-text">{formatIndianCurrency(item.price * item.quantity)}</div>
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
                            {formatIndianCurrency(item.originalPrice * item.quantity)}
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

        <div className="pb-10">
          <div className="text-sm font-medium mb-2 text-text">Price Details</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Total MRP</span>
              <span className="text-text">{formatIndianCurrency(summaryData.totalOriginalAmount)}</span>
            </div>

            {summaryData.totalSavings > 0 && (
              <div className="flex justify-between text-success">
                <div className="flex items-center">
                  <Tag className="mr-1" size={14} />
                  <span>Discount on Products</span>
                </div>
                <span>-{formatIndianCurrency(summaryData.totalSavings)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-text-muted">Cart Value</span>
              <span className="text-text">{formatIndianCurrency(cartData.cartTotal)}</span>
            </div>

            <div className="flex justify-between">
              <div className="flex items-center">
                <Truck className="mr-1" size={14} />
                <span className="text-text-muted">Delivery Charge</span>
              </div>
              {summaryData.isFreeDelivery ? (
                <span className="text-success">FREE</span>
              ) : (
                <span className="text-text">{formatIndianCurrency(summaryData.deliveryCharge)}</span>
              )}
            </div>

            {summaryData.isFreeDelivery && (
              <div className="text-xs text-success italic text-right">
                Free delivery on orders above ₹1,000
              </div>
            )}

            <div className="border-t my-2 border-gray-700"></div>

            <div className="flex justify-between font-semibold">
              <span className="text-text">Order Total</span>
              <span className="text-text">{formatIndianCurrency(summaryData.finalTotal)}</span>
            </div>

            {summaryData.totalSavings > 0 && (
              <div className="bg-primary-950 p-2 rounded text-xs text-success font-medium text-center">
                You're saving {formatIndianCurrency(summaryData.totalSavings)} ({summaryData.discountPercentage}%) on this order!
              </div>
            )}
          </div>
        </div>

        <button
          className={`w-full py-3 rounded-md font-medium transition-all flex items-center justify-center ${productAvailable
            ? "bg-primary-600 hover:bg-primary-700 text-bg-white cursor-pointer"
            : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          disabled={!productAvailable}
          onClick={handleCheckout}
          title={!productAvailable ? "Some items are out of stock" : "Proceed to checkout"}
        >
          <span className="mr-2">{productAvailable ? "Proceed to Checkout" : "Items Unavailable"}</span>
          {productAvailable && <span>{formatIndianCurrency(summaryData.finalTotal)}</span>}
        </button>

        <Link
          to={"/category"}
          className="block text-center text-secondary-500 hover:text-secondary-400 mt-4 transition-all">
          Continue Shopping
        </Link>
      </div>

      {showCheckout && (
        <Checkout
          onClose={handleCloseCheckout}
          cartData={cartData}
          summaryData={summaryData}
        />
      )}
    </>
  );
};

export default CartSummaryCard;