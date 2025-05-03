import React from 'react'

const CartProductCard = ({ item, onRemoveItem, onUpdateQuantity }) => {
  return (
    <div className="flex flex-col md:flex-row border rounded-lg p-4 mb-4">
      {/* Product Image */}
      <div className="md:w-1/4 mb-4 md:mb-0">
        <img 
          src={item.images[0].imageUrl} 
          alt={item.title} 
          className="w-full h-40 object-cover rounded"
        />
      </div>
      
      {/* Product Details */}
      <div className="md:w-3/4 md:pl-6 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-semibold">{item.title}</h3>
          <p className="text-gray-600">{item.subTitle}</p>
          
          <div className="flex items-center mt-2">
            {item.hasValidOffer ? (
              <>
                <span className="text-lg font-medium">₹{item.discountedPrice}</span>
                <span className="text-gray-500 line-through ml-2">₹{item.price}</span>
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  {item.discountValue}% OFF
                </span>
              </>
            ) : (
              <span className="text-lg font-medium">₹{item.price}</span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-end mt-4">
          <div className="flex items-center">
            <span className="mr-2">Quantity:</span>
            <div className="border rounded-md flex items-center">
              <button 
                className="px-3 py-1 border-r"
                onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span className="px-3">{item.quantity}</span>
              <button 
                className="px-3 py-1 border-l"
                onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              >
                +
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="font-semibold">₹{item.subTotal}</span>
            <button 
              className="text-red-600 hover:text-red-800"
              onClick={() => onRemoveItem(item.productId)}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartProductCard