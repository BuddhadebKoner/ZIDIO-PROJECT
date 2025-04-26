import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ChevronDown, ChevronUp, Image, Loader2, Trash2 } from 'lucide-react';
import SingleImageUploader from '../../../components/shared/SingleImageUploader';

const BannerSection = ({ initialBanners }) => {
   const [banners, setBanners] = useState(initialBanners || [{
      imageUrl: '',
      imageId: '',
      path: ''
   }]);

   const [errors, setErrors] = useState({});
   const [loading, setLoading] = useState(false);
   const [expanded, setExpanded] = useState(true);

   const toggleExpanded = () => {
      setExpanded(!expanded);
   };

   const handleBannerImageChange = (url, index = 0) => {
      console.log("Image URL received:", url);
      const updatedBanners = [...banners];
      updatedBanners[index] = {
         ...updatedBanners[index],
         imageUrl: url,
      };

      setBanners(updatedBanners);
      console.log("Updated banners state:", updatedBanners);

      if (errors[`banners[${index}]`]) {
         setErrors((prev) => {
            const updated = { ...prev };
            delete updated[`banners[${index}]`];
            return updated;
         });
      }
   };

   const handleBannerImageIdChange = (id, index = 0) => {
      const updatedBanners = [...banners];
      updatedBanners[index] = {
         ...updatedBanners[index],
         imageId: id
      };

      setBanners(updatedBanners);
   };

   const handleBannerPathChange = (path, index = 0) => {
      const updatedBanners = [...banners];
      updatedBanners[index] = {
         ...updatedBanners[index],
         path: path
      };

      setBanners(updatedBanners);

      if (errors[`banners[${index}]`]) {
         setErrors(prev => {
            const updated = { ...prev };
            delete updated[`banners[${index}]`];
            return updated;
         });
      }
   };

   const handleAddBanner = () => {
      setBanners([
         ...banners,
         { imageUrl: '', imageId: '', path: '' }
      ]);
   };

   const handleRemoveBanner = (index) => {
      const updatedBanners = banners.filter((_, i) => i !== index);
      setBanners(updatedBanners);

      setErrors(prev => {
         const updated = { ...prev };
         delete updated[`banners[${index}]`];
         return updated;
      });
   };



   const updateBanners = async () => {
      console.log('Update button clicked, current banners:', banners);

      setLoading(true);

      try {
         // Format data according to the required structure
         const formattedData = {
            heroBannerImages: banners.map(banner => ({
               imageUrl: banner.imageUrl,
               imageId: banner.imageId,
               path: banner.path || '/'
            }))
         };

         // Log the formatted data
         console.log('Banner data to be submitted:', formattedData);

         // Mock API call - replace with actual API call
         await new Promise(resolve => setTimeout(resolve, 800));

         console.log('Update completed successfully');
         toast.success('Banner settings updated successfully');
         setErrors({});
      } catch (error) {
         console.error('Error updating banners:', error);
         toast.error('Failed to update banner settings');
      } finally {
         setLoading(false);
         console.log('Update process finished');
      }
   };

   return (
      <div className="overflow-hidden rounded-lg border border-blue-800/30 transition">
         <div className="flex items-center justify-between p-4 bg-gray-800/60">
            <div className="flex items-center gap-3">
               <div className="p-2.5 rounded-lg bg-blue-900/40">
                  <Image className="w-5 h-5 text-blue-400" />
               </div>
               <h2 className="text-xl font-semibold text-white">Banner Information</h2>
            </div>
            <div className="flex items-center gap-2">
               <button
                  type="button"
                  onClick={toggleExpanded}
                  className="p-2 text-gray-400 hover:text-white rounded-md transition-colors"
                  aria-expanded={expanded}
                  aria-label={expanded ? "Collapse Banner section" : "Expand Banner section"}
               >
                  {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
               </button>
               <button
                  type="button"
                  onClick={updateBanners}
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
                  {banners.map((banner, index) => (
                     <div key={index} className="p-5 border border-gray-700/70 rounded-lg transition-colors">
                        <div className="flex justify-between items-center mb-4">
                           <h3 className="text-lg font-medium text-white flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-300">
                                 {index + 1}
                              </div>
                              <span>Banner #{index + 1}</span>
                           </h3>
                           {banners.length > 1 && (
                              <button
                                 type="button"
                                 onClick={() => handleRemoveBanner(index)}
                                 className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 rounded-md transition-colors"
                                 disabled={loading}
                              >
                                 <span className="sr-only">Remove Banner</span>
                                 <Trash2 />
                              </button>
                           )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <SingleImageUploader
                                 setImageUrl={(url) => handleBannerImageChange(url, index)}
                                 setImageId={(id) => handleBannerImageIdChange(id, index)}
                                 label="Banner Image"
                                 currentImageUrl={banner.imageUrl}
                                 disabled={loading}
                                 path="homecontent"
                                 className="mb-2"
                              />
                           </div>

                           <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                 Redirect Path
                              </label>
                              <div className="relative">
                                 <input
                                    type="text"
                                    value={banner.path || ''}
                                    onChange={(e) => handleBannerPathChange(e.target.value, index)}
                                    placeholder="/collections/summer-sale"
                                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    disabled={loading}
                                 />
                                 {errors[`banners[${index}]`] && (
                                    <p className="text-red-400 text-sm mt-1.5">
                                       {errors[`banners[${index}]`]}
                                    </p>
                                 )}

                              </div>
                           </div>
                        </div>
                     </div>
                  ))}

                  <button
                     type="button"
                     onClick={handleAddBanner}
                     disabled={loading}
                     className="w-full py-3 border border-dashed border-gray-600 rounded-lg font-medium text-gray-300 hover:text-white transition-colors duration-200 flex items-center justify-center"
                  >
                     <span className="mr-2 text-lg">+</span> Add Another Banner
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default BannerSection;