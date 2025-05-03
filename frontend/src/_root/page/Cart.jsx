import React, { useState } from 'react'
import { useGetCartProducts } from '../../lib/query/queriesAndMutation'
import { Link } from 'react-router-dom'
import CartProductCard from '../../components/cards/CartProductCard'
import CartSummeryCard from '../../components/cards/CartSummeryCard'

const Cart = () => {
  const {
    data,
    isLoading,
    isError,
  } = useGetCartProducts();

  // Handlers for cart item operations
  const handleRemoveItem = (productId) => {
    // Implement item removal logic here
    console.log(`Remove product with ID: ${productId}`);
  }

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    // Implement quantity update logic here
    console.log(`Update quantity for product ${productId} to ${newQuantity}`);
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      Loading cart...
    </div>
  );
  
  if (isError) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      Error loading cart items
    </div>
  );
  
  if (!data || !data.items || data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <Link to="/" className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-all">
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-10">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items List */}
        <div className="lg:w-2/3">
          {data.items.map((item) => (
            <CartProductCard 
              key={item.productId}
              item={item}
              onRemoveItem={handleRemoveItem}
              onUpdateQuantity={handleUpdateQuantity}
            />
          ))}
        </div>
        
        {/* Cart Summary */}
        <div className="lg:w-1/3">
          <CartSummeryCard cartData={data} />
        </div>
      </div>
    </div>
  )
}

export default Cart