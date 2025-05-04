import React, { useState } from 'react'
import { useGetCartProducts } from '../../lib/query/queriesAndMutation'
import { Link } from 'react-router-dom'
import CartProductCard from '../../components/cards/CartProductCard'
import CartSummeryCard from '../../components/cards/CartSummeryCard'
import FullPageLoader from '../../components/loaders/FullPageLoader'

const Cart = () => {
  const {
    data,
    isLoading,
    isError,
  } = useGetCartProducts();

  console.log("Cart data: ", data);

  if (isLoading) return (
    <>
      <FullPageLoader />
    </>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-xl font-medium mb-4">Error loading cart items</div>
      <Link to="/" className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-all">
        Return to homepage
      </Link>
    </div>
  );

  if (!data || !data.items || data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <p className="text-base mb-6">Looks like you haven't added any items to your cart yet.</p>
        <Link to="/" className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-all">
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items List */}
        <div className="lg:w-2/3 space-y-4">
          {data.items.map((item) => (
            <CartProductCard
              key={item._id}
              item={item}
            />
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:w-1/3 mt-6 lg:mt-0">
          <CartSummeryCard cartData={data} />
        </div>
      </div>
    </div>
  )
}

export default Cart