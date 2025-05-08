import React from 'react';
import {
   Package,
   Truck,
   CheckCircle,
} from 'lucide-react';

const OrderProgressStatus = ({
   order,
   statusInfo,
   estimatedDelivery,
}) => {
   // Determine the progress percentage based on order status
   const getProgressPercentage = (status) => {
      switch (status) {
         case 'Processing': return 25;
         case 'Shipped': return 75;
         case 'Delivered': return 100;
         case 'Cancelled': return 100;
         case 'Returned': return 100;
         default: return 0;
      }
   };

   // Get progress bar color based on status
   const getProgressColor = (status) => {
      if (status === 'Cancelled' || status === 'Returned') {
         return 'bg-primary-600 opacity-60';
      }
      return 'bg-primary-600';
   };

   return (
      <div className="rounded-lg shadow-sm p-6 mb-20">
         <div className="flex items-center mb-6">
            {statusInfo.icon}
            <h2 className="text-lg font-semibold ml-2 text-text">{statusInfo.label}</h2>
         </div>

         {/* Progress Steps */}
         {(order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Returned') && (
            <div className="relative mb-8">
               {/* Progress Track */}
               <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  {/* Progress Fill */}
                  <div
                     className={`h-full ${getProgressColor(order.orderStatus)} rounded-full transition-all duration-500`}
                     style={{ width: `${getProgressPercentage(order.orderStatus)}%` }}
                  ></div>
               </div>

               {/* Step Markers */}
               <div className="absolute top-4 left-0 w-full grid grid-cols-3 mt-2">
                  {/* Processing Step */}
                  <div className="flex flex-col items-center">
                     <div className={`h-8 w-8 rounded-full flex items-center justify-center
                ${order.orderStatus === 'Processing' || order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered'
                           ? 'bg-primary-600 text-bg-white' : 'bg-gray-200 text-text-muted'}`}>
                        <Package size={16} />
                     </div>
                     <p className="text-xs mt-2 font-medium text-text">Processing</p>
                     {order.orderStatus === 'Processing' && (
                        <p className="text-xs text-text-muted mt-1">Your order is being prepared</p>
                     )}
                  </div>

                  {/* Shipped Step */}
                  <div className="flex flex-col items-center">
                     <div className={`h-8 w-8 rounded-full flex items-center justify-center
                ${order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered'
                           ? 'bg-primary-600 text-bg-white' : 'bg-gray-200 text-text-muted'}`}>
                        <Truck size={16} />
                     </div>
                     <p className="text-xs mt-2 font-medium text-text">Shipped</p>
                     {order.orderStatus === 'Shipped' && (
                        <p className="text-xs text-text-muted mt-1">Estimated delivery: {estimatedDelivery}</p>
                     )}
                  </div>

                  {/* Delivered Step */}
                  <div className="flex flex-col items-center">
                     <div className={`h-8 w-8 rounded-full flex items-center justify-center
                ${order.orderStatus === 'Delivered'
                           ? 'bg-primary-600 text-bg-white' : 'bg-gray-200 text-text-muted'}`}>
                        <CheckCircle size={16} />
                     </div>
                     <p className="text-xs mt-2 font-medium text-text">Delivered</p>
                     {order.orderStatus === 'Delivered' && (
                        <p className="text-xs text-text-muted mt-1">Delivered on {estimatedDelivery}</p>
                     )}
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default OrderProgressStatus;