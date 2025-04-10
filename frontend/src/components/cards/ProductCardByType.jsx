const ProductCardByType = ({ product }) => {
   // Get correct image path from the product type showcase object
   const productImage = product.image || "https://picsum.photos/300/400";

   return (
      <div className="cursor-pointer w-full mb-6">
         <div className="relative w-full h-[550px] overflow-hidden rounded-lg">
            {/* Product image with gradient overlay */}
            <img
               src={productImage}
               alt={product.type}
               className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-70"></div>
            
            <div className="absolute bottom-0 left-0 w-full p-6 text-white">
               <h3 className="font-bold text-2xl tracking-wide">{product.type}</h3>
            </div>
         </div>
      </div>
   )
}

export default ProductCardByType