import { Stripe } from 'stripe';

const SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY;
if (!SECRET_KEY) {
   throw new Error('Missing Stripe secret key');
}

// Use ES Module import instead of require
const stripe = new Stripe(SECRET_KEY);

export async function createCustomer({ name, email }) {
   try {
      const customer = await stripe.customers.create({
         name,
         email,
      });
      return customer;
   } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
   }
}

// Add a payment method (card) to a customer
export async function addPaymentMethod({ customerId, paymentMethodId }) {
   try {
      console.log(`Attaching payment method ${paymentMethodId} to customer ${customerId}`);
      
      // Attach the payment method to the customer
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
         customer: customerId,
      });
      
      console.log('Payment method attached successfully:', paymentMethod);

      // If this is the first payment method, set it as default
      const methods = await listPaymentMethods(customerId);
      if (methods.length === 1) {
         await setDefaultPaymentMethod({
            customerId,
            paymentMethodId
         });
      }

      return { success: true, paymentMethod };
   } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
   }
}

// Get all payment methods for a customer
export async function listPaymentMethods(customerId) {
   try {
      const paymentMethods = await stripe.paymentMethods.list({
         customer: customerId,
         type: 'card',
      });

      return paymentMethods.data;
   } catch (error) {
      console.error('Error listing payment methods:', error);
      throw error;
   }
}

// Set default payment method for a customer
export async function setDefaultPaymentMethod({ customerId, paymentMethodId }) {
   try {
      await stripe.customers.update(customerId, {
         invoice_settings: {
            default_payment_method: paymentMethodId,
         },
      });

      return { success: true };
   } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
   }
}

// Delete a payment method
export async function deletePaymentMethod(paymentMethodId) {
   try {
      await stripe.paymentMethods.detach(paymentMethodId);

      return { success: true };
   } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
   }
}

// Find customer by email
export async function findCustomerByEmail(email) {
   try {
      // Use list with email filter to find existing customers with this email
      const customers = await stripe.customers.list({
         email: email,
         limit: 3
      });
      
      console.log('Stripe customer search results:', customers.data);
      return customers.data.length > 0 ? customers.data[0] : null;
   } catch (error) {
      console.error('Error finding customer by email:', error);
      throw error;
   }
}