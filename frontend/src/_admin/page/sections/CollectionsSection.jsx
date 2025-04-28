import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ChevronDown, ChevronUp, Package, Loader2, Trash2 } from 'lucide-react';
import SingleImageUploader from '../../../components/shared/SingleImageUploader';
import { updateHomeContent } from '../../../lib/api/admin.api';

const CollectionsSection = ({ initialCollections = [] }) => {
   const [originalCollections, setOriginalCollections] = useState([]);
   const [collections, setCollections] = useState(initialCollections.length > 0 ? initialCollections : [
      { imageUrl: '', imageId: '', path: '/' }
   ]);
   const [hasChanges, setHasChanges] = useState(false);
   const [errors, setErrors] = useState({});
   const [loading, setLoading] = useState(false);
   const [expanded, setExpanded] = useState(true);

   // console.log('Collections:', initialCollections);

   // Store the initial collections for comparison
   useEffect(() => {
      setOriginalCollections(JSON.parse(JSON.stringify(collections)));
   }, []);

   // Check for changes whenever collections are modified
   useEffect(() => {
      const checkForChanges = () => {
         if (originalCollections.length !== collections.length) {
            setHasChanges(true);
            return;
         }

         for (let i = 0; i < collections.length; i++) {
            const current = collections[i];
            const original = originalCollections[i];

            if (!original ||
               current.imageUrl !== original.imageUrl ||
               current.imageId !== original.imageId ||
               current.path !== original.path) {
               setHasChanges(true);
               return;
            }
         }

         setHasChanges(false);
      };

      if (originalCollections.length > 0) {
         checkForChanges();
      }
   }, [collections, originalCollections]);

   const toggleExpanded = () => {
      setExpanded(!expanded);
   };

   const handleCollectionImageChange = (url, index) => {
      if (!url) return;

      setCollections(prevCollections => {
         const updatedCollections = [...prevCollections];
         updatedCollections[index] = {
            ...updatedCollections[index],
            imageUrl: url
         };
         return updatedCollections;
      });

      // Clear errors for this field if they exist
      clearFieldError(`collections[${index}].imageUrl`);
   };

   const handleCollectionImageIdChange = (id, index) => {
      setCollections(prevCollections => {
         const updatedCollections = [...prevCollections];
         updatedCollections[index] = {
            ...updatedCollections[index],
            imageId: id
         };
         return updatedCollections;
      });
   };

   const handleCollectionPathChange = (path, index) => {
      setCollections(prevCollections => {
         const updatedCollections = [...prevCollections];
         updatedCollections[index] = {
            ...updatedCollections[index],
            path: path
         };
         return updatedCollections;
      });

      // Clear errors for this field if they exist
      clearFieldError(`collections[${index}].path`);
   };

   const clearFieldError = (fieldName) => {
      if (errors[fieldName]) {
         setErrors(prev => {
            const updated = { ...prev };
            delete updated[fieldName];
            return updated;
         });
      }
   };

   const handleAddCollection = () => {
      setCollections(prev => [...prev, { imageUrl: '', imageId: '', path: '/' }]);
   };

   const handleRemoveCollection = (index) => {
      setCollections(prevCollections => prevCollections.filter((_, i) => i !== index));

      // Clean up any errors for the removed collection
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach(key => {
         if (key.startsWith(`collections[${index}]`)) {
            delete newErrors[key];
         }
      });
      setErrors(newErrors);
   };

   const validateCollections = () => {
      const newErrors = {};
      let isValid = true;

      collections.forEach((collection, index) => {
         if (!collection.imageUrl) {
            newErrors[`collections[${index}].imageUrl`] = 'Collection image is required';
            isValid = false;
         }

         // Path is optional but if provided should be valid
         if (collection.path && !collection.path.startsWith('/')) {
            newErrors[`collections[${index}].path`] = 'Path must start with /';
            isValid = false;
         }
      });

      setErrors(newErrors);
      return isValid;
   };

   const updateCollections = async () => {
      if (!validateCollections()) {
         toast.error('Please fix the errors before updating.');
         return;
      }

      setLoading(true);

      try {
         const formattedData = {
            collections: collections.map(collection => ({
               imageUrl: collection.imageUrl,
               imageId: collection.imageId,
               path: collection.path || '/'
            }))
         };

         console.log('Formatted Data:', formattedData);

         const res = await updateHomeContent(formattedData);
         console.log('Response:', res);

         setTimeout(() => {
            toast.success('Collection settings updated successfully');
            setLoading(false);
            // Update original collections after successful update
            setOriginalCollections(JSON.parse(JSON.stringify(collections)));
            setHasChanges(false);
         }, 800);

      } catch (error) {
         toast.error(error.message || 'Failed to update collection settings');
         setLoading(false);
      }
   };

   return (
      <div className="overflow-hidden rounded-lg border border-blue-800/30 transition">
         <div className="flex items-center justify-between p-4 bg-gray-800/60">
            <div className="flex items-center gap-3">
               <div className="p-2.5 rounded-lg bg-blue-900/40">
                  <Package className="w-5 h-5 text-blue-400" />
               </div>
               <h2 className="text-xl font-semibold text-white">Featured Collections</h2>
            </div>
            <div className="flex items-center gap-2">
               <button
                  type="button"
                  onClick={toggleExpanded}
                  className="p-2 text-gray-400 hover:text-white rounded-md transition-colors"
                  aria-expanded={expanded}
                  aria-label={expanded ? "Collapse Collections section" : "Expand Collections section"}
               >
                  {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
               </button>
               <button
                  type="button"
                  onClick={updateCollections}
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

         <div className={`transition-all duration-300 ${expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="p-5 border-t border-gray-800">
               <div className="space-y-6">
                  {collections.map((collection, index) => (
                     <div key={index} className="p-5 border border-gray-700/70 rounded-lg transition-colors">
                        <div className="flex justify-between items-center mb-4">
                           <h3 className="text-lg font-medium text-white flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-300">
                                 {index + 1}
                              </div>
                              <span>Collection #{index + 1}</span>
                           </h3>
                           {collections.length > 1 && (
                              <button
                                 type="button"
                                 onClick={() => handleRemoveCollection(index)}
                                 className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 rounded-md transition-colors"
                                 disabled={loading}
                              >
                                 <span className="sr-only">Remove Collection</span>
                                 <Trash2 />
                              </button>
                           )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <SingleImageUploader
                                 setImageUrl={(url) => handleCollectionImageChange(url, index)}
                                 setImageId={(id) => handleCollectionImageIdChange(id, index)}
                                 label="Collection Image"
                                 currentImageUrl={collection.imageUrl}
                                 disabled={loading}
                                 path="collections"
                              />
                              {errors[`collections[${index}].imageUrl`] && (
                                 <p className="text-red-400 text-sm mt-1.5">
                                    {errors[`collections[${index}].imageUrl`]}
                                 </p>
                              )}
                           </div>

                           <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                 Redirect Path
                              </label>
                              <div className="relative">
                                 <input
                                    type="text"
                                    value={collection.path || ''}
                                    onChange={(e) => handleCollectionPathChange(e.target.value, index)}
                                    placeholder="/collections/summer-sale"
                                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    disabled={loading}
                                 />
                                 {errors[`collections[${index}].path`] && (
                                    <p className="text-red-400 text-sm mt-1.5">
                                       {errors[`collections[${index}].path`]}
                                    </p>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}

                  <button
                     type="button"
                     onClick={handleAddCollection}
                     disabled={loading}
                     className="w-full py-3 border border-dashed border-gray-600 rounded-lg font-medium text-gray-300 hover:text-white transition-colors duration-200 flex items-center justify-center"
                  >
                     <span className="mr-2 text-lg">+</span> Add Another Collection
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default CollectionsSection;