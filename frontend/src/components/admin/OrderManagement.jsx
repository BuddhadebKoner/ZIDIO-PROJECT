import React from 'react';
import { Package, Truck, CheckCircle, XCircle, RotateCw, CreditCard, FileText, Send, DollarSign, Clock } from 'lucide-react';

const OrderManagement = ({
   order,
   statusUpdating,
   onStatusUpdate,
   onPaymentStatusToggle,
   onGenerateInvoice
}) => {
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

   // Handle COD payment collection
   const handleCodPaymentCollection = () => {
      console.log("Recording COD payment collection for order:", order._id);
      onPaymentStatusToggle();
   };

   // Handle sending delivery confirmation
   const handleSendDeliveryConfirmation = () => {
      console.log("Sending delivery confirmation for order:", order._id);
      // Implementation would go here
   };

   return (
      <div className="glass-morphism p-6 rounded-lg mb-6">
         <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
            <span>Order Management</span>
            <span className={`text-sm px-3 py-1 rounded-full ${order.orderStatus === 'Cancelled' ? 'bg-error/20 text-error' :
                  order.orderStatus === 'Returned' ? 'bg-warning/20 text-warning' :
                     order.orderStatus === 'Delivered' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
               }`}>
               {order.orderStatus}
            </span>
         </h3>

         {/* Order Status Section */}
         <div className="mb-6">
            <h4 className="font-medium mb-3">Order Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
               <button
                  className={`btn flex items-center justify-center gap-2 ${order.orderStatus === 'Processing' ? 'btn-primary' :
                        (order.orderProcessingTime ? 'btn-outline-success' : 'btn-secondary')
                     }`}
                  onClick={() => onStatusUpdate('Processing')}
                  disabled={!canTransitionTo('Processing') || statusUpdating}
               >
                  <Package size={18} />
                  Processing
               </button>
               <button
                  className={`btn flex items-center justify-center gap-2 ${order.orderStatus === 'Shipped' ? 'btn-primary' :
                        (order.orderShippedTime ? 'btn-outline-success' : 'btn-secondary')
                     }`}
                  onClick={() => onStatusUpdate('Shipped')}
                  disabled={!canTransitionTo('Shipped') || statusUpdating}
               >
                  <Truck size={18} />
                  Ship
               </button>
               <button
                  className={`btn flex items-center justify-center gap-2 ${order.orderStatus === 'Delivered' ? 'btn-primary' :
                        (order.orderDeliveredTime ? 'btn-outline-success' : 'btn-secondary')
                     }`}
                  onClick={() => onStatusUpdate('Delivered')}
                  disabled={!canTransitionTo('Delivered') || statusUpdating}
               >
                  <CheckCircle size={18} />
                  Deliver
               </button>
               <button
                  className={`btn flex items-center justify-center gap-2 ${order.orderStatus === 'Returned' ? 'btn-warning' : 'btn-outline-warning'
                     }`}
                  onClick={() => onStatusUpdate('Returned')}
                  disabled={!canTransitionTo('Returned') || statusUpdating}
               >
                  <RotateCw size={18} /> Return
               </button>
               <button
                  className={`btn flex items-center justify-center gap-2 ${order.orderStatus === 'Cancelled' ? 'btn-error' : 'btn-outline-error'
                     }`}
                  onClick={() => onStatusUpdate('Cancelled')}
                  disabled={!canTransitionTo('Cancelled') || statusUpdating}
               >
                  <XCircle size={18} /> Cancel
               </button>
            </div>

            {/* Status guidance - only show when updating or when there's helpful info */}
            <div className="mt-3 text-sm">
               {statusUpdating ? (
                  <div className="flex items-center gap-1 text-primary">
                     <Clock size={14} className="animate-spin" /> Updating order status...
                  </div>
               ) : (
                  <>
                     {order.orderStatus === 'Processing' && (
                        <div className="flex items-center gap-1 text-info">
                           <Truck size={14} /> Next step: Ship when the package is ready for delivery
                        </div>
                     )}
                     {order.orderStatus === 'Shipped' && (
                        <div className="flex items-center gap-1 text-info">
                           <CheckCircle size={14} /> Next step: Mark as delivered when received by customer
                        </div>
                     )}
                     {order.orderStatus === 'Delivered' && order.orderType === 'COD' && order.paymentStatus !== 'paid' && (
                        <div className="flex items-center gap-1 text-warning">
                           <DollarSign size={14} /> Payment collection required
                        </div>
                     )}
                  </>
               )}
            </div>
         </div>

         {/* Payment Section */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* COD Payment Panel */}
            {order.orderType === 'COD' && (
               <div className="p-4 rounded bg-background-light border-l-4 border-primary">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                     <DollarSign size={18} /> Cash on Delivery
                  </h4>

                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                        <span className="text-text-muted">Status:</span>
                        <span className={`font-medium px-2 py-0.5 rounded ${order.paymentStatus === 'paid' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                           {order.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                        </span>
                     </div>

                     <div className="flex items-center justify-between">
                        <span className="text-text-muted">Amount:</span>
                        <span className="font-medium">₹{order.payableAmount.toFixed(2)}</span>
                     </div>

                     {/* COD payment actions */}
                     <div className="pt-2 flex flex-col gap-2 mt-2">
                        {/* Primary payment collection button - only for delivered unpaid orders */}
                        {order.orderStatus === 'Delivered' && order.paymentStatus !== 'paid' && (
                           <button
                              className="btn btn-success w-full flex items-center justify-center gap-2"
                              onClick={handleCodPaymentCollection}
                           >
                              <DollarSign size={18} /> Record Payment
                           </button>
                        )}

                        {/* Secondary payment toggle - administrative function */}
                        {order.orderStatus !== 'Cancelled' && (
                           <button
                              className={`btn btn-sm ${order.paymentStatus === 'paid' ? 'btn-outline-error' : 'btn-outline-success'} w-full flex items-center justify-center gap-2`}
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

            {/* Online Payment Panel */}
            {order.orderType === 'ONLINE' && (
               <div className="p-4 rounded bg-background-light border-l-4 border-primary">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                     <CreditCard size={18} /> Online Payment
                  </h4>

                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                        <span className="text-text-muted">Status:</span>
                        <span className={`font-medium px-2 py-0.5 rounded ${order.paymentStatus === 'paid' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                           {order.paymentStatus === 'paid' ? 'PAID' : 'FAILED'}
                        </span>
                     </div>

                     <div className="flex items-center justify-between">
                        <span className="text-text-muted">Amount:</span>
                        <span className="font-medium">₹{order.payInOnlineAmount.toFixed(2)}</span>
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
                     className="btn btn-outline flex items-center gap-2"
                     onClick={handleSendDeliveryConfirmation}
                  >
                     <Send size={18} /> Send Delivery Confirmation
                  </button>
               )}
            </div>

            {/* Warning message for disabled invoice button */}
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