import React, { useState, useEffect } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { addPaymentMethod } from '../../lib/api/payment/customer'

const StripeCardForm = ({ onAddCard, customerId, editMode = false, existingCard = null }) => {
   const stripe = useStripe()
   const elements = useElements()
   const [isLoading, setIsLoading] = useState(false)
   const [error, setError] = useState(null)
   const [isUpdatePossible, setIsUpdatePossible] = useState(false)
   const [initialBillingDetails, setInitialBillingDetails] = useState(null)
   const [billingDetails, setBillingDetails] = useState({
      name: editMode && existingCard ? existingCard.billing_details.name || '' : '',
      address: {
         line1: editMode && existingCard ? existingCard.billing_details.address.line1 || '' : '',
         line2: editMode && existingCard ? existingCard.billing_details.address.line2 || '' : '',
         city: editMode && existingCard ? existingCard.billing_details.address.city || '' : '',
         state: editMode && existingCard ? existingCard.billing_details.address.state || '' : '',
         postal_code: editMode && existingCard ? existingCard.billing_details.address.postal_code || '' : '',
      }
   })

   // Store initial billing details for comparison
   useEffect(() => {
      if (editMode && existingCard) {
         const initialDetails = {
            name: existingCard.billing_details.name || '',
            address: {
               line1: existingCard.billing_details.address.line1 || '',
               line2: existingCard.billing_details.address.line2 || '',
               city: existingCard.billing_details.address.city || '',
               state: existingCard.billing_details.address.state || '',
               postal_code: existingCard.billing_details.address.postal_code || '',
            }
         };
         setInitialBillingDetails(initialDetails);
      }
   }, [editMode, existingCard]);

   // Check if update is possible by comparing with initial values
   useEffect(() => {
      if (editMode && initialBillingDetails) {
         const hasChanges =
            billingDetails.name !== initialBillingDetails.name ||
            billingDetails.address.line1 !== initialBillingDetails.address.line1 ||
            billingDetails.address.line2 !== initialBillingDetails.address.line2 ||
            billingDetails.address.city !== initialBillingDetails.address.city ||
            billingDetails.address.state !== initialBillingDetails.address.state ||
            billingDetails.address.postal_code !== initialBillingDetails.address.postal_code;

         setIsUpdatePossible(hasChanges);
      }
   }, [billingDetails, initialBillingDetails, editMode]);


   const handleBillingChange = (e) => {
      const { name, value } = e.target

      if (name.includes('.')) {
         const [parent, child] = name.split('.')
         setBillingDetails(prev => ({
            ...prev,
            [parent]: {
               ...prev[parent],
               [child]: value
            }
         }))
      } else {
         setBillingDetails(prev => ({
            ...prev,
            [name]: value
         }))
      }
   }

   const handleSubmit = async (e) => {
      e.preventDefault()

      if (!stripe || !elements) {
         return
      }

      setIsLoading(true)
      setError(null)

      try {
         const cardElement = elements.getElement(CardElement)

         const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
               name: billingDetails.name,
               address: billingDetails.address
            }
         })

         if (error) {
            throw new Error(error.message)
         }

         await addPaymentMethod({
            customerId,
            paymentMethodId: paymentMethod.id
         })

         cardElement.clear()
         setBillingDetails({
            name: '',
            address: {
               line1: '',
               line2: '',
               city: '',
               state: '',
               postal_code: '',
            }
         })
         onAddCard()
      } catch (err) {
         console.error(err)
         setError(err.message || 'Failed to add card')
      } finally {
         setIsLoading(false)
      }
   }

   return (
      <form onSubmit={handleSubmit} className="glass-morphism p-6 rounded-lg">
         <div className='mb-4 flex items-center justify-between'>
            <h3 className="text-xl font-bold mb-4">{editMode ? 'Edit Card Details' : 'Add New Card'}</h3>
            <p className='text-sm text-gray-500 mb-4'>
               {existingCard?.card.brand.charAt(0).toUpperCase() + existingCard?.card.brand.slice(1)} •••• {existingCard?.card.last4}
            </p>
         </div>

         <div className="space-y-4 mb-6">
            {/* Cardholder Name */}
            <div>
               <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Cardholder Name
               </label>
               <input
                  type="text"
                  id="name"
                  name="name"
                  value={billingDetails.name}
                  onChange={handleBillingChange}
                  className="w-full p-3 border border-gray-700 rounded-md bg-surface text-text"
                  placeholder="Name on card"
                  required
               />
            </div>

            {/* Address Line 1 */}
            <div>
               <label htmlFor="address.line1" className="block text-sm font-medium mb-2">
                  Address Line 1
               </label>
               <input
                  type="text"
                  id="address.line1"
                  name="address.line1"
                  value={billingDetails.address.line1}
                  onChange={handleBillingChange}
                  className="w-full p-3 border border-gray-700 rounded-md bg-surface text-text"
                  placeholder="Street address"
                  required
               />
            </div>

            {/* Address Line 2 */}
            <div>
               <label htmlFor="address.line2" className="block text-sm font-medium mb-2">
                  Address Line 2 (optional)
               </label>
               <input
                  type="text"
                  id="address.line2"
                  name="address.line2"
                  value={billingDetails.address.line2}
                  onChange={handleBillingChange}
                  className="w-full p-3 border border-gray-700 rounded-md bg-surface text-text"
                  placeholder="Apartment, suite, etc."
               />
            </div>

            {/* City, State, ZIP in a row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label htmlFor="address.city" className="block text-sm font-medium mb-2">
                     City
                  </label>
                  <input
                     type="text"
                     id="address.city"
                     name="address.city"
                     value={billingDetails.address.city}
                     onChange={handleBillingChange}
                     className="w-full p-3 border border-gray-700 rounded-md bg-surface text-text"
                     placeholder="City"
                     required
                  />
               </div>
               <div>
                  <label htmlFor="address.state" className="block text-sm font-medium mb-2">
                     State
                  </label>
                  <input
                     type="text"
                     id="address.state"
                     name="address.state"
                     value={billingDetails.address.state}
                     onChange={handleBillingChange}
                     className="w-full p-3 border border-gray-700 rounded-md bg-surface text-text"
                     placeholder="State"
                     required
                  />
               </div>
               <div>
                  <label htmlFor="address.postal_code" className="block text-sm font-medium mb-2">
                     ZIP / Postal Code
                  </label>
                  <input
                     type="text"
                     id="address.postal_code"
                     name="address.postal_code"
                     value={billingDetails.address.postal_code}
                     onChange={handleBillingChange}
                     className="w-full p-3 border border-gray-700 rounded-md bg-surface text-text"
                     placeholder="ZIP / Postal code"
                     required
                  />
               </div>
            </div>

            {/* Card Details */}
            <div>
               <label htmlFor="card-element" className="block text-sm font-medium mb-2">
                  Card Information
               </label>
               <div className="p-4 border border-gray-700 rounded-md bg-surface">
                  <CardElement
                     id="card-element"
                     options={{
                        style: {
                           base: {
                              fontSize: '16px',
                              color: '#f0f0f0',
                              '::placeholder': {
                                 color: '#b4b4b4',
                              },
                           },
                           invalid: {
                              color: '#ef4444',
                           },
                        },
                        hidePostalCode: true,
                     }}
                  />
               </div>
            </div>
         </div>

         {error && (
            <div className="mb-4 text-error p-3 bg-gray-900 rounded-md">
               {error}
            </div>
         )}

         <div className="flex justify-end gap-3">
            {editMode && (
               <button
                  type="button"
                  onClick={() => onAddCard()}
                  className="btn-secondary cursor-pointer"
               >
                  Cancel
               </button>
            )}
            <button
               type="submit"
               disabled={!stripe || isLoading || (editMode && !isUpdatePossible)}
               className="btn-primary flex items-center justify-center gap-2 cursor-pointer"
            >
               {isLoading ? 'Processing...' : (editMode ? 'Update Card' : 'Save Card')}
            </button>
         </div>
      </form>
   )
}

export default StripeCardForm