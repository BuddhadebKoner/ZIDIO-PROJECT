import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ChevronDown, ChevronUp, ShoppingBag, Loader2 } from 'lucide-react';
import FindProducts from '../../../components/dataFinding/FindProducts';

const ExclusiveProductsSection = ({ initialProducts }) => {
   const [products, setProducts] = useState(initialProducts || []);
   const [errors, setErrors] = useState(null);
   const [loading, setLoading] = useState(false);
   const [expanded, setExpanded] = useState(true);

   const toggleExpanded = () => {
      setExpanded(!expanded);
   };

   const handleProductsSelection = (productIds) => {
      setProducts(productIds.map(id => ({ productId: id })));
      setErrors(null);
   };

   const validateProducts = () => {
      if (products.length === 0) {
         return 'Please select at least one exclusive product';
      }
      return null;
   };

   const updateProducts = async () => {
      const error = validateProducts();

      if (error) {
         setErrors(error);
         toast.error(error);
         return;
      }

      setLoading(true);

      try {
         // Mock API call - replace with actual API call
         await new Promise(resolve => setTimeout(resolve, 800));

         toast.success('Exclusive products updated successfully');
         setErrors(null);
      } catch (error) {
         console.error('Error updating exclusive products:', error);
         toast.error('Failed to update exclusive products');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="overflow-hidden rounded-lg border border-purple-800/30 transition-all">
         <div className="flex items-center justify-between p-4 bg-gray-800/60">
            <div className="flex items-center gap-3">
               <div className="p-2.5 rounded-lg bg-purple-900/40">
                  <ShoppingBag className="w-5 h-5 text-purple-400" />
               </div>
               <h2 className="text-xl font-semibold text-white">Exclusive Products</h2>
            </div>
            <div className="flex items-center gap-2">
               <button
                  type="button"
                  onClick={toggleExpanded}
                  className="p-2 text-gray-400 hover:text-white rounded-md transition-colors"
                  aria-expanded={expanded}
                  aria-label={expanded ? "Collapse Exclusive Products section" : "Expand Exclusive Products section"}
               >
                  {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
               </button>
               <button
                  type="button"
                  onClick={updateProducts}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 rounded-md font-medium text-sm transition-colors duration-200 flex items-center"
               >
                  {loading ? (
                     <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        <span>Updating...</span>
                     </>
                  ) : (
                     <span>Update</span>
                  )}
               </button>
            </div>
         </div>

         <div className={`transition-all duration-300 ${expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="p-5 border-t border-gray-800">
               <div className="space-y-4">
                  <p className="text-gray-300 mb-4">
                     Select products to feature in the exclusive products section. These products will be prominently displayed on your homepage.
                  </p>

                  <FindProducts
                     onSelectProducts={handleProductsSelection}
                     selectedProductIds={products.map(p => p.productId)}
                     disabled={loading}
                  />

                  {errors && (
                     <p className="text-red-400 text-sm mt-2">{errors}</p>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default ExclusiveProductsSection;