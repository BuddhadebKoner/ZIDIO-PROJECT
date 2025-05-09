import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import FullPageLoader from '../../components/loaders/FullPageLoader'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import {
   createCustomer,
   findCustomerByEmail,
   listPaymentMethods,
   setDefaultPaymentMethod,
   deletePaymentMethod
} from '../../lib/api/payment/customer'
import { CreditCard, X, Star, Edit2 } from 'lucide-react'
import StripeCardForm from '../../components/forms/StripeCardForm'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const AccountPaymentDetails = () => {
   const { currentUser, isLoading: authLoading } = useAuth()
   const [paymentMethods, setPaymentMethods] = useState([])
   const [isLoading, setIsLoading] = useState(false)
   const [stripeCustomerId, setStripeCustomerId] = useState('')
   const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState(null)
   const [refresh, setRefresh] = useState(0)
   const [editingCard, setEditingCard] = useState(null)
   const [showAddCardForm, setShowAddCardForm] = useState(false)

   useEffect(() => {
      const initializeCustomerAndCards = async () => {
         if (!currentUser) return

         setIsLoading(true)
         try {
            let customerId = currentUser.stripeCustomerId;

            if (!customerId) {
               console.log('No Stripe customer ID found in user profile, checking if customer exists...');
               const existingCustomer = await findCustomerByEmail(currentUser.email);

               if (existingCustomer) {
                  // console.log('Found existing Stripe customer:', existingCustomer);
                  customerId = existingCustomer.id;

                  // Consider updating user profile with stripe customer ID
                  // This would need a separate function to update the user in your database
               } else {
                  console.log('No existing customer found, creating new one');
                  const customer = await createCustomer({
                     name: currentUser.fullName,
                     email: currentUser.email
                  });
                  // console.log('Created new Stripe customer:', customer);
                  customerId = customer.id;
               }
            } else {
               console.log('Using existing Stripe customer ID:', customerId);
            }

            setStripeCustomerId(customerId);

            const methods = await listPaymentMethods(customerId);
            setPaymentMethods(methods);

            if (methods.length > 0) {
               // Find default or set first as default
               const defaultMethod = methods.find(method => method.is_default) || methods[0];
               console.log('Setting default payment method:', defaultMethod.id);
               setDefaultPaymentMethodId(defaultMethod.id);
            }
         } catch (error) {
            console.error("Error initializing payment details:", error);
         } finally {
            setIsLoading(false);
         }
      }

      initializeCustomerAndCards()
   }, [currentUser, refresh])

   const handleAddCard = () => {
      console.log('Adding new card, refreshing payment methods');
      setShowAddCardForm(false);
      setEditingCard(null);
      setRefresh(prev => prev + 1);
   }

   const handleRemoveCard = async (paymentMethodId) => {
      if (!confirm("Are you sure you want to remove this card?")) {
         return;
      }

      try {
         console.log('Removing payment method:', paymentMethodId);
         const result = await deletePaymentMethod(paymentMethodId);
         console.log('Payment method removal result:', result);
         setRefresh(prev => prev + 1);
      } catch (error) {
         console.error("Error removing card:", error);
      }
   }

   const handleSetDefault = async (paymentMethodId) => {
      try {
         console.log('Setting default payment method:', paymentMethodId);
         const result = await setDefaultPaymentMethod({
            customerId: stripeCustomerId,
            paymentMethodId
         });
         console.log('Set default payment method result:', result);
         setDefaultPaymentMethodId(paymentMethodId);
      } catch (error) {
         console.error("Error setting default card:", error);
      }
   }

   const handleEditCard = (method) => {
      setEditingCard(method);
      setShowAddCardForm(false);
   }

   if (authLoading || isLoading) {
      return <FullPageLoader />
   }

   return (
      <div className="max-w-3xl mx-auto px-4 py-8">
         <div className='mb-8 flex items-center justify-between'>
            <h1 className="text-2xl font-bold">Payment Methods</h1>
            {paymentMethods.length > 0 && !editingCard && !showAddCardForm && (
               <button
                  onClick={() => setShowAddCardForm(true)}
                  className="btn-secondary text-sm"
               >
                  Add New Card
               </button>
            )}
         </div>

         <div className="mb-8">

            {paymentMethods.length === 0 && !showAddCardForm ? (
               <div className="comic-border glass-morphism p-6 rounded-lg text-center">
                  <p className="text-text-muted mb-4">You don't have any cards saved yet.</p>
                  <button
                     onClick={() => setShowAddCardForm(true)}
                     className="btn-primary"
                  >
                     Add Payment Method
                  </button>
               </div>
            ) : (
               <>
                  {!editingCard && !showAddCardForm && (
                     <div className="space-y-4 mt-10">
                        {paymentMethods.map((method) => (
                           <div
                              key={method.id}
                              className="comic-border glass-morphism p-4 rounded-lg flex justify-between items-center"
                           >
                              <div className="flex items-center">
                                 <div className="mr-4 text-2xl">
                                    <CreditCard size={24} />
                                 </div>
                                 <div>
                                    <div className="font-medium">
                                       {method.card.brand.charAt(0).toUpperCase() + method.card.brand.slice(1)} •••• {method.card.last4}
                                    </div>
                                    <div className="text-sm text-text-muted">
                                       Expires {method.card.exp_month}/{method.card.exp_year}
                                    </div>
                                    {method.billing_details.name && (
                                       <div className="text-sm text-text-muted mt-1">
                                          {method.billing_details.name}
                                       </div>
                                    )}
                                 </div>
                              </div>

                              <div className="flex items-center gap-2">
                                 <button
                                    onClick={() => handleSetDefault(method.id)}
                                    className={`cursor-pointer p-2 rounded-full transition-colors ${method.id === defaultPaymentMethodId ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                                    title={method.id === defaultPaymentMethodId ? "Default payment method" : "Set as default"}
                                 >
                                    <Star
                                       size={20}
                                       fill={method.id === defaultPaymentMethodId ? "currentColor" : "none"}
                                    />
                                 </button>

                                 <button
                                    onClick={() => handleEditCard(method)}
                                    className="cursor-pointer p-2 rounded-full text-gray-400 hover:text-primary transition-colors"
                                    title="Edit card details"
                                 >
                                    <Edit2 size={20} />
                                 </button>

                                 <button
                                    onClick={() => handleRemoveCard(method.id)}
                                    className="cursor-pointer p-2 rounded-full text-gray-400 hover:text-error transition-colors"
                                    title="Remove card"
                                 >
                                    <X size={20} />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </>
            )}
         </div>

         {(showAddCardForm || editingCard || paymentMethods.length === 0) && (
            <Elements stripe={stripePromise}>
               <StripeCardForm
                  onAddCard={handleAddCard}
                  customerId={stripeCustomerId}
                  editMode={!!editingCard}
                  existingCard={editingCard}
               />
            </Elements>
         )}
      </div>
   )
}

export default AccountPaymentDetails