import { Link } from "react-router-dom";

const ProductOnlyImageCard = ({ product }) => {
   // Ensure we have valid image URL
   const productImageUrl = product.image && product.image.imageUrl
      ? product.image.imageUrl
      : "https://picsum.photos/300/400";

   // Calculate discounted price if offer exists
   const discountedPrice = product.offer && product.offer.discountValue > 0
      ? Math.round(product.price - (product.price * product.offer.discountValue / 100))
      : product.price;

   return (
      <div
         className="cursor-pointer w-full max-w-[400px] sm:max-w-[220px] md:max-w-[400px] lg:max-w-[280px]"
         radius="lg"
         shadow="sm"
      >
         <div className="p-0 overflow-hidden relative">
            <div className="relative w-full h-[450px] sm:h-[400px] md:h-[400px] overflow-hidden">
               {/* Single product image */}
               <Link
                  to={`/product/${product.slug}`}
               >
                  <img
                     src={productImageUrl}
                     alt={product.title}
                     className="w-full h-full object-cover rounded-lg"
                  />
               </Link>
            </div>
         </div>

         <div className="flex flex-col items-center gap-2 px-3 py-3">
            <h3 className="font-medium text-gray-100 text-base">{product.title}</h3>
            <div className="flex justify-center items-center w-full gap-2">
               {product.offer && product.offer.discountValue > 0 ? (
                  <>
                     <span className="font-semibold text-xs sm:text-sm">₹{discountedPrice}</span>
                     <span className="text-gray-400 text-xs line-through">₹{product.price}</span>
                     <span className="text-green-500 text-xs font-medium bg-green-500/10 px-1.5 py-0.5 rounded">
                        {product.offer.discountValue}% OFF
                     </span>
                  </>
               ) : (
                  <span className="font-semibold text-xs sm:text-sm">₹{product.price}</span>
               )}
            </div>
         </div>
      </div>
   )
}

export default ProductOnlyImageCard