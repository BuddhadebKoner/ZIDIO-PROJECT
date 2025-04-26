import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ChevronDown, ChevronUp, Package, Loader2 } from 'lucide-react';
import SingleImageUploader from '../../../components/shared/SingleImageUploader';
import FindCollections from '../../../components/dataFinding/FindCollections';

const CollectionsSection = ({ initialCollectionId, initialImageUrl, initialImageId }) => {
   const [collection, setCollection] = useState({
      collectionId: initialCollectionId || '',
      imageUrl: initialImageUrl || '',
      imageId: initialImageId || ''
   });

   const [errors, setErrors] = useState({});
   const [loading, setLoading] = useState(false);
   const [expanded, setExpanded] = useState(true);

   const toggleExpanded = () => {
      setExpanded(!expanded);
   };

   const handleCollectionSelection = (collectionId) => {
      setCollection(prevData => ({
         ...prevData,
         collectionId: collectionId
      }));

      if (errors.collection) {
         setErrors(prev => {
            const updated = { ...prev };
            delete updated.collection;
            return updated;
         });
      }
   };

   const handleCollectionImageChange = (url) => {
      setCollection(prevData => ({
         ...prevData,
         imageUrl: url
      }));

      if (errors.collectionImage) {
         setErrors(prev => {
            const updated = { ...prev };
            delete updated.collectionImage;
            return updated;
         });
      }
   };

   const handleCollectionImageIdChange = (id) => {
      setCollection(prevData => ({
         ...prevData,
         imageId: id
      }));
   };

   const validateCollection = () => {
      const collectionErrors = {};

      if (!collection.collectionId) {
         collectionErrors.collection = 'Please select a collection';
      }

      if (!collection.imageUrl && collection.collectionId) {
         collectionErrors.collectionImage = 'Collection image is required';
      }

      return collectionErrors;
   };

   const updateCollection = async () => {
      const collectionErrors = validateCollection();

      if (Object.keys(collectionErrors).length > 0) {
         setErrors(collectionErrors);
         toast.error('Please fix collection errors before updating');
         return;
      }

      setLoading(true);

      try {
         // Mock API call - replace with actual API call
         await new Promise(resolve => setTimeout(resolve, 800));

         toast.success('Featured collection updated successfully');
         setErrors({});
      } catch (error) {
         console.error('Error updating collection:', error);
         toast.error('Failed to update featured collection');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="overflow-hidden rounded-lg border border-amber-800/30 transition-all">
         <div className="flex items-center justify-between p-4 bg-gray-800/60">
            <div className="flex items-center gap-3">
               <div className="p-2.5 rounded-lg bg-amber-900/40">
                  <Package className="w-5 h-5 text-amber-400" />
               </div>
               <h2 className="text-xl font-semibold text-white">Featured Collection</h2>
            </div>
            <div className="flex items-center gap-2">
               <button
                  type="button"
                  onClick={toggleExpanded}
                  className="p-2 text-gray-400 hover:text-white rounded-md transition-colors"
                  aria-expanded={expanded}
                  aria-label={expanded ? "Collapse Featured Collection section" : "Expand Featured Collection section"}
               >
                  {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
               </button>
               <button
                  type="button"
                  onClick={updateCollection}
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
               <div className="space-y-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select Collection
                     </label>
                     <FindCollections
                        onSelectCollection={handleCollectionSelection}
                        selectedCollectionId={collection.collectionId}
                        disabled={loading}
                     />

                     {errors.collection && (
                        <p className="text-red-400 text-sm mt-2">{errors.collection}</p>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default CollectionsSection;