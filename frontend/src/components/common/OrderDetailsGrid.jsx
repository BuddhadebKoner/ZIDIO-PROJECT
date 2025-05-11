import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatIndianCurrency } from '../../utils/amountFormater';

const OrderDetailsGrid = ({ products }) => {
   return (
      <div className="rounded-lg shadow-sm p-6 lg:col-span-2">
         <div className="flex items-center mb-4">
            <ShoppingBag className="h-5 w-5 text-text-muted mr-2" />
            <h2 className="text-lg font-semibold text-text">Order Items ({products.length})</h2>
         </div>

         <div className="flex flex-wrap gap-4">
            {products.map((product) => (
               <div key={product._id} className="w-full glass-morphism py-4 px-5 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row gap-4 p-2 rounded-md transition-all duration-300">
                     <div className="w-full sm:w-20 h-20 rounded overflow-hidden flex-shrink-0 comic-border red-velvet-border">
                        <img
                           src={product.imagesUrl}
                           alt={product.title}
                           className="w-full h-full object-cover"
                        />
                     </div>

                     <div className="flex-1">
                        <Link
                           to={`/product/${product.slug}`}
                           className="font-medium text-text hover:text-primary-400 transition-colors"
                        >
                           {product.title}
                        </Link>
                        <p className="text-text-muted text-sm mt-1">{product.subTitle}</p>

                        <div className="flex flex-wrap gap-3 mt-2">
                           <span className="text-xs px-2 py-1 text-text-muted rounded">
                              Size: {product.selectedSize}
                           </span>
                           <span className="text-xs px-2 py-1 text-text-muted rounded">
                              Qty: {product.quantity}
                           </span>
                        </div>
                     </div>

                     <div className="text-right">
                        <span className="font-semibold text-primary-400">{formatIndianCurrency(product.payableAmount)}</span>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

export default OrderDetailsGrid;