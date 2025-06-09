import React from 'react';
import { Package, Truck, CheckCircle, XCircle, RotateCw, CreditCard, FileText, Send, DollarSign } from 'lucide-react';
import { updateOrder } from '../../lib/api/admin.api';
import { useAuth } from '../../context/AuthContext';

const OrderManagement = ({
   order,
   statusUpdating,
   onStatusUpdate,
   onPaymentStatusToggle,
   onGenerateInvoice
}) => {

   const { getToken } = useAuth();

   // Helper function to determine if a status transition is valid
   const canTransitionTo = (targetStatus) => {
      if (statusUpdating) return false;

      // Sequential flow logic
      switch (targetStatus) {
         case 'Processing':
            // Can only set to Processing if it's a new order
            return order.orderStatus !== 'Processing' &&
               !order.orderShippedTime &&
               !order.orderDeliveredTime &&
               !order.orderCancelledTime &&
               !order.orderReturnedTime;

         case 'Shipped':
            // Can only ship if it's currently in Processing
            return order.orderStatus === 'Processing' &&
               !order.orderShippedTime &&
               !order.orderDeliveredTime &&
               !order.orderCancelledTime;

         case 'Delivered':
            // Can only deliver if it's currently Shipped
            return order.orderStatus === 'Shipped' &&
               !order.orderDeliveredTime &&
               !order.orderCancelledTime;

         case 'Returned':
            // Can only return if it was delivered
            return order.orderStatus === 'Delivered' &&
               !order.orderReturnedTime &&
               !order.orderCancelledTime;

         case 'Cancelled':
            // Can cancel if not already delivered, returned or cancelled
            return !['Delivered', 'Returned', 'Cancelled'].includes(order.orderStatus);

         default:
            return false;
      }
   };

   // Updated status transition handler with API integration
   const handleStatusTransition = async (newStatus) => {
      console.log(`Transitioning order ${order._id} from ${order.orderStatus} to ${newStatus}`);

      // Map the status to the appropriate action parameter
      const orderAction = {};

      switch (newStatus) {
         case 'Processing':
            console.log("Starting to process all products in the order");
            orderAction.markAsProcessing = true;
            break;
         case 'Shipped':
            console.log("Order has left the warehouse, updating shipping information");
            orderAction.markAsShipped = true;
            break;
         case 'Delivered':
            console.log("Order has been delivered to customer");
            orderAction.markAsDelivered = true;
            // For COD orders, prompt for payment collection
            if (order.orderType === 'COD' && order.paymentStatus !== 'paid') {
               console.log("This is a COD order - payment collection needed");
            }
            break;
         case 'Returned':
            console.log("Order has been returned");
            orderAction.markAsReturned = true;
            break;
         case 'Cancelled':
            console.log("Order has been cancelled");
            orderAction.markAsCancelled = true;
            break;
         default:
            console.log("Unknown status transition");
            return;
      }

      try {
         const token = await getToken();
         const result = await updateOrder(order._id, orderAction, token);

         if (result.success) {
            // If API call succeeds, notify parent component
            onStatusUpdate(newStatus);
         } else {
            // Handle error
            console.error("Failed to update order status:", result.message);
            // You could add error handling UI here if needed
            alert(`Failed to update order: ${result.message}`);
         }
      } catch (error) {
         console.error("Error updating order status:", error);
         alert("An unexpected error occurred while updating the order");
      }
   };

   // Simple COD payment collection with console logs
   const handleCodPaymentCollection = () => {
      console.log(`Recording COD payment collection for order: ${order._id}`);
      console.log(`Amount collected from customer: ₹${order.payableAmount.toFixed(2)}`);
      console.log("Payment verified and recorded successfully");

      onPaymentStatusToggle();
   };

   // Simple courier update with console logs
   const handleCourierUpdate = () => {
      console.log(`Updating courier information for order: ${order._id}`);
      console.log("Recording courier details: name, tracking number, estimated delivery");
   };

   // Simple delivery confirmation with console logs
   const handleSendDeliveryConfirmation = () => {
      console.log(`Sending delivery confirmation for order: ${order._id}`);
   }

   return (
      <div className="p-6 rounded-lg mb-6">
         <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
            <span>Order Management</span>
            <span className={`text-sm px-3 py-1 rounded-full ${order.orderStatus === 'Cancelled' ? 'bg-error/20 text-error' :
               order.orderStatus === 'Returned' ? 'bg-warning/20 text-warning' :
                  order.orderStatus === 'Delivered' ? 'bg-success/20 text-success' :
                     'bg-primary/20 text-text'
               }`}>
               {order.orderStatus}
            </span>
         </h3>

         {/* Order Status Section */}
         <div className="mb-6">
            <h4 className="font-medium mb-3">Order Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
               <button
                  className={"btn flex items-center justify-center gap-2 red-velvet-border"}
                  onClick={() => handleStatusTransition('Processing')}
                  disabled={"disabled"}
               >
                  <Package size={18} />
                  {
                     order.orderStatus === 'Processing' ? (
                        <>
                           Processing
                        </>
                     ) : (
                        <>
                           Order verified
                        </>
                     )
                  }
               </button>
               <button
                  className={`btn flex items-center justify-center gap-2 ${order.orderStatus === 'Shipped' ? 'btn-primary' :
                     order.orderShippedTime ? 'red-velvet-border' : 'btn-secondary'
                     }`}
                  onClick={() => handleStatusTransition('Shipped')}
                  disabled={!canTransitionTo('Shipped') || statusUpdating}
               >
                  <Truck size={18} />
                  {
                     (order.orderStatus !== 'Shipped' && order.orderStatus !== 'Processing') ? (
                        <>
                           Shipped Sucess
                        </>
                     ) : (
                        <>
                           Mark As Shipped
                        </>
                     )
                  }
               </button>
               <button
                  className={`btn flex items-center justify-center gap-2 ${order.orderStatus === 'Delivered' ? 'btn-primary' :
                     order.orderDeliveredTime ? 'red-velvet-border' : 'btn-secondary'
                     }`}
                  onClick={() => handleStatusTransition('Delivered')}
                  disabled={!canTransitionTo('Delivered') || statusUpdating}
               >
                  <CheckCircle size={18} />
                  {
                     order.orderStatus === 'Delivered' ? (
                        <>
                           Delivered Sucess
                        </>
                     ) : (
                        <>
                           Mark As Delivered
                        </>
                     )
                  }
               </button>
               <button
                  className="btn flex items-center justify-center gap-2 bg-warning text-bg-white hover:bg-warning/80"
                  onClick={() => handleStatusTransition('Returned')}
                  disabled={!canTransitionTo('Returned') || statusUpdating}
               >
                  <RotateCw size={18} /> Return
               </button>
               <button
                  className="btn flex items-center justify-center gap-2 bg-error text-bg-white hover:bg-error/80"
                  onClick={() => handleStatusTransition('Cancelled')}
                  disabled={!canTransitionTo('Cancelled') || statusUpdating}
               >
                  <XCircle size={18} /> Cancel
               </button>
            </div>

            {/* Simple status guidance */}
            <div className="mt-3 text-sm">
               {order.orderStatus === 'Processing' && (
                  <div className="flex items-center gap-1 text-info">
                     <Truck size={14} /> Next step: Shipping order
                  </div>
               )}
               {order.orderStatus === 'Shipped' && (
                  <div className="flex items-center gap-1 text-info">
                     <CheckCircle size={14} /> Next step: deliver order
                  </div>
               )}
               {order.orderStatus === 'Delivered' && order.orderType === 'COD' && order.paymentStatus !== 'paid' && (
                  <div className="flex items-center gap-1 text-warning">
                     <DollarSign size={14} /> Next step: verify order and close Order
                  </div>
               )}
            </div>
         </div>

         {/* Payment Section */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* COD Payment Panel */}
            {order.orderType === 'COD' && (
               <div className="p-4 rounded bg-surface border-l-4 border-primary-500">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                     <DollarSign size={18} /> Cash on Delivery
                  </h4>

                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                        <span className="text-text-muted">Status:</span>
                        <span className={`font-medium px-2 py-0.5 rounded ${order.paymentStatus === 'paid' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                           }`}>
                           {order.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                        </span>
                     </div>

                     <div className="flex items-center justify-between">
                        <span className="text-text-muted">Amount:</span>
                        <span className="font-medium">₹{order.payableAmount.toFixed(2)}</span>
                     </div>

                     {/* COD payment actions */}
                     <div className="pt-2 flex flex-col gap-2 mt-2">
                        {order.orderStatus === 'Delivered' && order.paymentStatus !== 'paid' && (
                           <button
                              className="btn bg-success text-bg-white hover:bg-success/80 w-full flex items-center justify-center gap-2"
                              onClick={handleCodPaymentCollection}
                           >
                              <DollarSign size={18} /> Record Payment
                           </button>
                        )}

                        {order.orderStatus !== 'Cancelled' && (
                           <button
                              className={`btn btn-sm ${order.paymentStatus === 'paid'
                                 ? 'bg-error/10 text-error border border-error/30 hover:bg-error/20'
                                 : 'bg-success/10 text-success border border-success/30 hover:bg-success/20'
                                 } w-full flex items-center justify-center gap-2`}
                              onClick={onPaymentStatusToggle}
                              disabled={statusUpdating}
                           >
                              <CreditCard size={14} />
                              {order.paymentStatus === 'paid' ? 'Mark as Unpaid' : 'Mark as Paid'}
                           </button>
                        )}
                     </div>
                  </div>
               </div>
            )}

            {/* COD payment collection form */}
            {order.orderStatus === 'Delivered' && order.orderType === 'COD' && order.paymentStatus !== 'paid' && (
               <div className="p-4 rounded bg-warning/10 border-l-4 border-warning md:mt-0 mt-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                     <DollarSign size={18} /> Cash Payment Collection
                  </h4>

                  <div className="flex items-center gap-3 mt-3">
                     <div className="font-bold">₹{order.payableAmount.toFixed(2)}</div>
                     <button
                        className="btn bg-success text-bg-white hover:bg-success/80 flex-1 flex items-center justify-center gap-2"
                        onClick={handleCodPaymentCollection}
                     >
                        <DollarSign size={18} /> Confirm Payment Received
                     </button>
                  </div>

                  <p className="text-xs text-warning mt-2">
                     Verify that you have collected ₹{order.payableAmount.toFixed(2)} from the customer
                  </p>
               </div>
            )}

            {/* Online Payment Panel */}
            {order.orderType === 'ONLINE' && (
               <div className="p-4 rounded bg-surface border-l-4 border-primary-500">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                     <CreditCard size={18} /> Online Payment
                  </h4>

                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                        <span className="text-text-muted">Status:</span>
                        <span className={`font-medium px-2 py-0.5 rounded ${order.paymentStatus === 'paid' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                           }`}>
                           {order.paymentStatus === 'paid' ? 'PAID' : 'FAILED'}
                        </span>
                     </div>

                     <div className="flex items-center justify-between">
                        <span className="text-text-muted">Amount:</span>
                        <span className="font-medium">₹{order.payInOnlineAmount?.toFixed(2) || '0.00'}</span>
                     </div>

                     {order.paymentStatus === 'paid' && order.sessionId && (
                        <div className="flex items-start">
                           <span className="text-text-muted">Transaction:</span>
                           <span className="text-xs text-text-muted ml-1 truncate max-w-[200px]">
                              {order.sessionId}
                           </span>
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>

         {/* Actions Section */}
         <div className="border-t border-gray-700 pt-4">
            <h4 className="font-medium mb-3">Actions</h4>
            <div className="flex flex-wrap gap-2">
               <button
                  className="btn btn-primary flex items-center gap-2"
                  onClick={onGenerateInvoice}
                  disabled={order.orderStatus === 'Cancelled' || (order.orderType === 'COD' && order.paymentStatus !== 'paid')}
               >
                  <FileText size={18} /> Generate Invoice
               </button>

               {order.orderStatus === 'Delivered' && (
                  <button
                     className="red-velvet-border flex items-center gap-2 p-2"
                     onClick={handleSendDeliveryConfirmation}
                  >
                     <Send size={18} /> Send Delivery Confirmation
                  </button>
               )}

               {order.orderStatus === 'Shipped' && (
                  <button
                     className="btn bg-surface text-text border border-gray-700 hover:bg-surface/80 flex items-center gap-2"
                     onClick={handleCourierUpdate}
                  >
                     <Truck size={18} /> Update Courier Info
                  </button>
               )}
            </div>

            {order.orderType === 'COD' && order.paymentStatus !== 'paid' && order.orderStatus === 'Delivered' && (
               <p className="text-xs text-warning mt-2 w-full">
                  <DollarSign size={14} className="inline mr-1" />
                  Record payment collection before generating invoice
               </p>
            )}
         </div>
      </div>
   );
};

export default OrderManagement;