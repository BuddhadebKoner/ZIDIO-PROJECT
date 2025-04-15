import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAddAddress, useUpdateAddress } from '../../lib/query/queriesAndMutation';

const AddressForm = ({ initialData = {}, action = 'add', onCancel, onSuccess }) => {
   const [formData, setFormData] = useState({
      addressLine1: initialData?.addressLine1 || '',
      addressLine2: initialData?.addressLine2 || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      country: initialData?.country || '',
      postalCode: initialData?.postalCode || '',
   });

   const [initialFormState, setInitialFormState] = useState({});
   const [errors, setErrors] = useState({});
   const [hasChanges, setHasChanges] = useState(false);

   // Use the appropriate mutation based on the action
   const addAddressMutation = useAddAddress();
   const updateAddressMutation = useUpdateAddress();

   const isLoading = addAddressMutation.isPending || updateAddressMutation.isPending;
   const isSuccess = addAddressMutation.isSuccess || updateAddressMutation.isSuccess;

   // Store the initial data for comparison
   useEffect(() => {
      const initialState = {
         addressLine1: initialData?.addressLine1 || '',
         addressLine2: initialData?.addressLine2 || '',
         city: initialData?.city || '',
         state: initialData?.state || '',
         country: initialData?.country || '',
         postalCode: initialData?.postalCode || '',
      };
      setInitialFormState(initialState);
   }, [initialData]);

   // Check for changes whenever formData changes
   useEffect(() => {
      if (action === 'update') {
         const changed = Object.keys(formData).some(key => {
            return formData[key] !== initialFormState[key];
         });
         setHasChanges(changed);
      }
   }, [formData, initialFormState, action]);

   useEffect(() => {
      if (isSuccess && onSuccess) {
         onSuccess();
      }
   }, [isSuccess, onSuccess]);

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: value
      }));

      // Clear error for this field when user types
      if (errors[name]) {
         setErrors(prev => ({
            ...prev,
            [name]: ''
         }));
      }
   };

   const validateForm = () => {
      const newErrors = {};

      // Address Line 1 validation
      if (!formData.addressLine1.trim()) {
         newErrors.addressLine1 = 'Address Line 1 is required';
      } else if (formData.addressLine1.trim().length < 3) {
         newErrors.addressLine1 = 'Address Line 1 must be at least 3 characters';
      }

      // City validation
      if (!formData.city.trim()) {
         newErrors.city = 'City is required';
      } else if (formData.city.trim().length < 2) {
         newErrors.city = 'City must be at least 2 characters';
      }

      // State validation
      if (!formData.state.trim()) {
         newErrors.state = 'State/Province is required';
      } else if (formData.state.trim().length < 2) {
         newErrors.state = 'State must be at least 2 characters';
      }

      // Country validation
      if (!formData.country.trim()) {
         newErrors.country = 'Country is required';
      }

      // Postal code validation
      if (!formData.postalCode.trim()) {
         newErrors.postalCode = 'Postal Code is required';
      } else {
         const postalCodeRegex = /^[a-zA-Z0-9\s-]{3,10}$/;
         if (!postalCodeRegex.test(formData.postalCode.trim())) {
            newErrors.postalCode = 'Invalid postal code format';
         }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validateForm()) {
         toast.error('Please correct the errors in the form', {
            position: toast.POSITION.TOP_RIGHT
         });
         return;
      }

      // For update action, don't proceed if there are no changes
      if (action === 'update' && !hasChanges) {
         toast.info('No changes detected to update', {
            position: toast.POSITION.TOP_RIGHT
         });
         return;
      }

      // Trim all values before submission
      const trimmedData = Object.entries(formData).reduce((acc, [key, value]) => {
         acc[key] = typeof value === 'string' ? value.trim() : value;
         return acc;
      }, {});

      try {
         if (action === 'add') {
            await addAddressMutation.mutateAsync(trimmedData);
         } else {
            await updateAddressMutation.mutateAsync(trimmedData);
         }
      } catch (error) {
         // Error handling is managed by the mutation hooks
         console.log('Form submission failed');
      }
   };

   const getInputClasses = (fieldName) => {
      const baseClasses = "w-full px-4 py-3 bg-surface border rounded-md focus:outline-none text-text";
      if (errors[fieldName]) {
         return `${baseClasses} border-red-500`;
      }
      return `${baseClasses} border-gray-700`;
   };

   return (
      <div className="rounded-lg">
         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
               <label htmlFor="addressLine1" className="block text-text mb-2 font-semibold">
                  Address Line 1 *
               </label>
               <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="Street address"
                  className={getInputClasses('addressLine1')}
                  disabled={isLoading}
               />
               {errors.addressLine1 && (
                  <p className="mt-1 text-red-500 text-sm">{errors.addressLine1}</p>
               )}
            </div>

            <div className="mb-4">
               <label htmlFor="addressLine2" className="block text-text mb-2 font-semibold">
                  Address Line 2
               </label>
               <input
                  type="text"
                  id="addressLine2"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Apartment, suite, unit, etc. (optional)"
                  className={getInputClasses('addressLine2')}
                  disabled={isLoading}
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
                  <label htmlFor="city" className="block text-text mb-2 font-semibold">
                     City *
                  </label>
                  <input
                     type="text"
                     id="city"
                     name="city"
                     value={formData.city}
                     onChange={handleChange}
                     className={getInputClasses('city')}
                     disabled={isLoading}
                  />
                  {errors.city && (
                     <p className="mt-1 text-red-500 text-sm">{errors.city}</p>
                  )}
               </div>

               <div>
                  <label htmlFor="state" className="block text-text mb-2 font-semibold">
                     State/Province *
                  </label>
                  <input
                     type="text"
                     id="state"
                     name="state"
                     value={formData.state}
                     onChange={handleChange}
                     className={getInputClasses('state')}
                     disabled={isLoading}
                  />
                  {errors.state && (
                     <p className="mt-1 text-red-500 text-sm">{errors.state}</p>
                  )}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
               <div>
                  <label htmlFor="country" className="block text-text mb-2 font-semibold">
                     Country *
                  </label>
                  <input
                     type="text"
                     id="country"
                     name="country"
                     value={formData.country}
                     onChange={handleChange}
                     className={getInputClasses('country')}
                     disabled={isLoading}
                  />
                  {errors.country && (
                     <p className="mt-1 text-red-500 text-sm">{errors.country}</p>
                  )}
               </div>

               <div>
                  <label htmlFor="postalCode" className="block text-text mb-2 font-semibold">
                     Postal Code *
                  </label>
                  <input
                     type="text"
                     id="postalCode"
                     name="postalCode"
                     value={formData.postalCode}
                     onChange={handleChange}
                     className={getInputClasses('postalCode')}
                     disabled={isLoading}
                  />
                  {errors.postalCode && (
                     <p className="mt-1 text-red-500 text-sm">{errors.postalCode}</p>
                  )}
               </div>
            </div>

            <div className="flex justify-end gap-4">
               {action === 'update' && (
                  <button
                     type="button"
                     onClick={onCancel}
                     className="btn-secondary"
                     disabled={isLoading}
                  >
                     Cancel
                  </button>
               )}
               <button
                  type="submit"
                  className={`${action === 'update' && !hasChanges ? 'btn-primary opacity-50 cursor-not-allowed' : 'btn-primary'}`}
                  disabled={isLoading || (action === 'update' && !hasChanges)}
               >
                  {isLoading ? (
                     <span>
                        {action === 'add' ? 'Adding...' : 'Updating...'}
                     </span>
                  ) : (
                     <span>
                        {action === 'add' ? 'Add Address' : 'Update Address'}
                     </span>
                  )}
               </button>
            </div>
         </form>
      </div>
   );
};

export default AddressForm;