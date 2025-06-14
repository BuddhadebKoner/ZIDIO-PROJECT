import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ChevronDown, ChevronUp, ShoppingBag, Loader2 } from 'lucide-react';
import FindProducts from '../../../components/dataFinding/FindProducts';
import { updateHomeContent } from '../../../lib/api/admin.api';
import { useAuth } from '../../../context/AuthContext';

const ExclusiveProductsSection = ({ initialProducts }) => {
   const { getToken } = useAuth();
   const [products, setProducts] = useState(initialProducts || []);
   const [errors, setErrors] = useState(null);
   const [loading, setLoading] = useState(false);
   const [expanded, setExpanded] = useState(false);
   const [hasChanges, setHasChanges] = useState(false);

   // Helper function to extract product IDs for comparison
   const extractProductIds = (products) => {
      if (!products) return [];
      return products.map(product =>
         typeof product === 'object' ? product.productId : product
      );
   };

   // Reset hasChanges when initialProducts change
   useEffect(() => {
      setHasChanges(false);
   }, [initialProducts]);

   const toggleExpanded = () => {
      setExpanded(!expanded);
   };

   const handleProductsSelection = (productIds) => {
      const newProducts = productIds.map(id => ({ productId: id }));
      setProducts(newProducts);
      setErrors(null);

      // Compare selected products with initial products to detect changes
      const initialIds = extractProductIds(initialProducts);

      // Check if arrays have the same elements (regardless of order)
      const hasChanged =
         initialIds.length !== productIds.length ||
         !initialIds.every(id => productIds.includes(id)) ||
         !productIds.every(id => initialIds.includes(id));

      setHasChanges(hasChanged);
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
         const formtedProdcts = {
            exclusiveProducts: products.map(product => (
               { productId: product.productId }
            )),
         }

         const token = await getToken();
         if (!token) {
            toast.error("You need to be logged in to access this page");
            return;
         }
         const response = await updateHomeContent(formtedProdcts, token);

         if (response && response.success) {
            toast.success('Exclusive products updated successfully');
            setErrors(null);
            setHasChanges(false);
         } else {
            const errorMessage = response?.message || 'Failed to update exclusive products';
            toast.error(errorMessage);
            setErrors(errorMessage);
         }
      } catch (error) {
         console.error('Error updating exclusive products:', error);
         const errorMessage = error.response?.data?.message || 'Failed to update exclusive products';
         toast.error(errorMessage);
         setErrors(errorMessage);
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
                  className="p-2 text-gray-400 hover:text-white rounded-md transition-colors cursor-pointer"
                  aria-expanded={expanded}
                  aria-label={expanded ? "Collapse Exclusive Products section" : "Expand Exclusive Products section"}
               >
                  {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
               </button>
               <button
                  type="button"
                  onClick={updateProducts}
                  disabled={loading || !hasChanges}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 rounded-md font-medium text-sm transition-colors duration-200 flex items-center"
               >
                  {loading ? (
                     <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        <span>Updating...</span>
                     </>
                  ) : (
                     <span>{hasChanges ? "Update" : "No Changes"}</span>
                  )}
               </button>
            </div>
         </div>

         <div className={`transition-all duration-300 ${expanded ? 'max-h-fit opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="p-5 border-t border-gray-800">
               <div className="space-y-4">
                  <p className="text-gray-300 mb-4">
                     Select products to feature in the exclusive products section. These products will be prominently displayed on your homepage.
                  </p>

                  <FindProducts
                     onSelectProducts={handleProductsSelection}
                     selectedProductIds={initialProducts}
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