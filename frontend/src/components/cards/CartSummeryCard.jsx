import React from 'react'
import { Link } from 'react-router-dom'

const CartSummeryCard = ({ cartData }) => {
  return (
    <div className="border rounded-lg p-6 shadow-sm sticky top-4">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span>Items ({cartData.totalItems})</span>
          <span>₹{cartData.cartTotal}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className="border-t my-2"></div>
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>₹{cartData.cartTotal}</span>
        </div>
      </div>
      
      <button className="w-full bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 transition-all mt-4">
        Proceed to Checkout
      </button>
      
      <Link to="/" className="block text-center text-blue-600 hover:text-blue-800 mt-4">
        Continue Shopping
      </Link>
    </div>
  )
}

export default CartSummeryCard