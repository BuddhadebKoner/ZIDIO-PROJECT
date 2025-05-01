import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ChevronDown, ChevronUp, Image, Loader2, Trash2 } from 'lucide-react';
import SingleImageUploader from '../../../components/shared/SingleImageUploader';
import { updateHomeContent } from '../../../lib/api/admin.api';

const OfferFeaturedSection = ({ initialOffers = [] }) => {

  const [originalOffers, setOriginalOffers] = useState([]);
  const [offers, setOffers] = useState(initialOffers.length > 0 ? initialOffers : [
    { imageUrl: '', imageId: '', path: '' }
  ]);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setOriginalOffers(JSON.parse(JSON.stringify(offers)));
  }, []);

  useEffect(() => {
    const checkForChanges = () => {
      if (originalOffers.length !== offers.length) {
        setHasChanges(true);
        return;
      }

      for (let i = 0; i < offers.length; i++) {
        const current = offers[i];
        const original = originalOffers[i];

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

    if (originalOffers.length > 0) {
      checkForChanges();
    }
  }, [offers, originalOffers]);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleOfferImageChange = (url, index) => {
    if (!url) return;

    setOffers(prevOffers => {
      const updatedOffers = [...prevOffers];
      updatedOffers[index] = {
        ...updatedOffers[index],
        imageUrl: url
      };
      return updatedOffers;
    });

    clearFieldError(`offers[${index}].imageUrl`);
  };

  const handleOfferImageIdChange = (id, index) => {
    setOffers(prevOffers => {
      const updatedOffers = [...prevOffers];
      updatedOffers[index] = {
        ...updatedOffers[index],
        imageId: id
      };
      return updatedOffers;
    });
  };

  const handleOfferPathChange = (path, index) => {
    setOffers(prevOffers => {
      const updatedOffers = [...prevOffers];
      updatedOffers[index] = {
        ...updatedOffers[index],
        path: path
      };
      return updatedOffers;
    });

    clearFieldError(`offers[${index}].path`);
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

  const handleAddOffer = () => {
    setOffers(prev => [...prev, { imageUrl: '', imageId: '', path: '' }]);
  };

  const handleRemoveOffer = (index) => {
    setOffers(prevOffers => prevOffers.filter((_, i) => i !== index));

    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(`offers[${index}]`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const validateOffers = () => {
    const newErrors = {};
    let isValid = true;

    offers.forEach((offer, index) => {
      if (!offer.imageUrl) {
        newErrors[`offers[${index}].imageUrl`] = 'Offer image is required';
        isValid = false;
      }

      if (offer.path && !offer.path.startsWith('/')) {
        newErrors[`offers[${index}].path`] = 'Path must start with /';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const updateOffers = async () => {
    if (!validateOffers()) {
      toast.error('Please fix the errors before updating.');
      return;
    }

    setLoading(true);

    try {
      const formattedData = {
        offerFeatured: offers.map(offer => ({
          imageUrl: offer.imageUrl,
          imageId: offer.imageId,
          path: offer.path || '/'
        }))
      };

      console.log('Formatted Data:', formattedData);

      const res = await updateHomeContent(formattedData);
      console.log('Response:', res);

      setTimeout(() => {
        toast.success('Offer featured settings updated successfully');
        setLoading(false);
        // Update original offers after successful update
        setOriginalOffers(JSON.parse(JSON.stringify(offers)));
        setHasChanges(false);
      }, 800);

    } catch (error) {
      toast.error(error.message || 'Failed to update offer featured settings');
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-blue-800/30 transition">
      <div className="flex items-center justify-between p-4 bg-gray-800/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-900/40">
            <Image className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Offer Featured</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleExpanded}
            className="p-2 text-gray-400 hover:text-white rounded-md transition-colors cursor-pointer"
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse Offer Featured section" : "Expand Offer Featured section"}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button
            type="button"
            onClick={updateOffers}
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
          <div className="space-y-6">
            {offers.map((offer, index) => (
              <div key={index} className="p-5 border border-gray-700/70 rounded-lg transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-300">
                      {index + 1}
                    </div>
                    <span>Offer #{index + 1}</span>
                  </h3>
                  {offers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOffer(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 rounded-md transition-colors"
                      disabled={loading}
                    >
                      <span className="sr-only">Remove Offer</span>
                      <Trash2 />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <SingleImageUploader
                      setImageUrl={(url) => handleOfferImageChange(url, index)}
                      setImageId={(id) => handleOfferImageIdChange(id, index)}
                      label="Offer Image"
                      currentImageUrl={offer.imageUrl}
                      disabled={loading}
                      path="offers"
                    />
                    {errors[`offers[${index}].imageUrl`] && (
                      <p className="text-red-400 text-sm mt-1.5">
                        {errors[`offers[${index}].imageUrl`]}
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
                        value={offer.path || ''}
                        onChange={(e) => handleOfferPathChange(e.target.value, index)}
                        placeholder="/offers/summer-sale"
                        className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        disabled={loading}
                      />
                      {errors[`offers[${index}].path`] && (
                        <p className="text-red-400 text-sm mt-1.5">
                          {errors[`offers[${index}].path`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddOffer}
              disabled={loading}
              className="w-full py-3 border border-dashed border-gray-600 rounded-lg font-medium text-gray-300 hover:text-white transition-colors duration-200 flex items-center justify-center"
            >
              <span className="mr-2 text-lg">+</span> Add Another Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferFeaturedSection;