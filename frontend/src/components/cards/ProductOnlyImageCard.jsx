const ProductOnlyImageCard = ({ product }) => {
   // Ensure we have valid image URL
   const productImage = Array.isArray(product.image) && product.image.length > 0
      ? product.image[0]
      : "https://picsum.photos/300/400";

   return (
      <div
         className="cursor-pointer w-full max-w-[400px] sm:max-w-[220px] md:max-w-[400px] lg:max-w-[280px] "
         radius="lg"
         shadow="sm"
      >
         <div className="p-0 overflow-hidden relative">
            <div className="relative w-full h-[450px] sm:h-[400px] md:h-[400px] overflow-hidden">
               {/* Single product image */}
               <img
                  src={productImage}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
               />
            </div>
         </div>

         <div className="flex flex-col items-center gap-2 px-3 py-3">
            <h3 className="font-medium text-gray-100 text-base">{product.name}</h3>
            <div className="flex justify-center items-center w-full">
               <span className="text-gray-100 font-semibold">₹{product.price.current}</span>
            </div>
         </div>
      </div>
   )
}

export default ProductOnlyImageCard