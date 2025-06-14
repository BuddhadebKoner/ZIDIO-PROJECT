import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetOrderById } from '../../lib/query/queriesAndMutation';
import { format } from 'date-fns';
import {
   ArrowLeft,
   FileText,
   Truck,
   Clock,
   AlertCircle,
   ShoppingBag,
   CheckCircle,
   XCircle,
   RotateCcw,
   Star
} from 'lucide-react';

import OrderProgressStatus from '../../components/common/OrderPogressStatus';
import OrderPaymentAddressInfo from '../../components/common/OrderPaymentAddressInfo';
import OrderDetailsGrid from '../../components/common/OrderDetailsGrid';
import FullPageLoader from '../../components/loaders/FullPageLoader';
import RatingPopup from '../../components/ui/RatingPopup';

const OrderDetails = () => {
   // Fetch trackId from url
   const { trackId } = useParams();

   const {
      data,
      isLoading,
      isError,
      error
   } = useGetOrderById(trackId);

   // console.log("Order Details Data: ", data);

   const handleDownloadInvoice = () => {
      console.log("Downloading invoice...");
      // Add actual implementation logic here
   };

   const [isRatingPopupOpen, setIsRatingPopupOpen] = useState(false);

   const handleOpenRatingPopup = () => {
      setIsRatingPopupOpen(true);
   };

   const handleCloseRatingPopup = () => {
      setIsRatingPopupOpen(false);
   };

   const order = data?.order;

   // Format the order date if available
   const formattedDate = useMemo(() => {
      if (!order?.createdAt) return '';
      return format(new Date(order.createdAt), 'MMM dd, yyyy • hh:mm a');
   }, [order?.createdAt]);

   // Get estimated delivery date (5 days from order date for demo)
   const estimatedDelivery = useMemo(() => {
      if (!order?.createdAt) return '';
      const deliveryDate = new Date(order.createdAt);
      deliveryDate.setDate(deliveryDate.getDate() + 5);
      return format(deliveryDate, 'MMM dd, yyyy');
   }, [order?.createdAt]);

   if (isLoading) {
      return (
         <>
            <FullPageLoader />
         </>
      );
   }

   if (isError) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-surface">
            <div className="text-center p-8 bg-bg-white rounded-lg shadow-md max-w-md">
               <AlertCircle className="mx-auto h-12 w-12 text-error mb-4" />
               <h2 className="text-xl font-bold mb-2 text-text">Error Loading Order</h2>
               <p className="text-text-muted mb-6">{error?.message || "Failed to load order details"}</p>
               <Link to="/profile/orders" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-bg-white rounded-md inline-flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
               </Link>
            </div>
         </div>
      );
   }

   if (!order) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-surface">
            <div className="text-center p-8 bg-bg-white rounded-lg shadow-md max-w-md">
               <ShoppingBag className="mx-auto h-12 w-12 text-text-muted mb-4" />
               <h2 className="text-xl font-bold mb-2 text-text">Order Not Found</h2>
               <p className="text-text-muted mb-6">The order you're looking for doesn't exist or has been removed.</p>
               <Link to="/profile/orders" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-bg-white rounded-md inline-flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
               </Link>
            </div>
         </div>
      );
   }


   // Get formatted status label with icon
   const getStatusInfo = (status) => {
      const statusConfig = {
         'Processing': {
            icon: <Clock size={16} className="text-warning" />,
            color: 'text-warning',
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            label: 'Order Processing'
         },
         'Shipped': {
            icon: <Truck size={16} className="text-info" />,
            color: 'text-info',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            label: 'Order Shipped'
         },
         'Delivered': {
            icon: <CheckCircle size={16} className="text-success" />,
            color: 'text-success',
            bg: 'bg-green-50',
            border: 'border-green-200',
            label: 'Order Delivered'
         },
         'Cancelled': {
            icon: <XCircle size={16} className="text-error" />,
            color: 'text-error',
            bg: 'bg-red-50',
            border: 'border-red-200',
            label: 'Order Cancelled'
         },
         'Returned': {
            icon: <RotateCcw size={16} className="text-error" />,
            color: 'text-error',
            bg: 'bg-red-50',
            border: 'border-red-200',
            label: 'Order Returned'
         }
      };

      return statusConfig[status] || {
         icon: <AlertCircle size={16} className="text-text-muted" />,
         color: 'text-text-muted',
         bg: 'bg-surface',
         border: 'border-gray-200',
         label: 'Unknown Status'
      };
   };

   // Get payment status info
   const getPaymentStatusInfo = (status) => {
      const statusConfig = {
         'paid': {
            color: 'text-success',
            bg: 'bg-green-50',
            border: 'border-green-200'
         },
         'unpaid': {
            color: 'text-warning',
            bg: 'bg-yellow-50',
            border: 'border-yellow-200'
         },
      };

      return statusConfig[status] || {
         color: 'text-text-muted',
         bg: 'bg-surface',
         border: 'border-gray-200'
      };
   };

   const statusInfo = getStatusInfo(order.orderStatus);
   const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus);

   return (
      <div className="min-h-screen pb-12">
         <div className="px-4 py-8">
            {/* Back button */}
            <Link to="/profile/orders" className="flex items-center mb-6 text-sm font-medium text-text-muted hover:text-primary-600 transition-colors">
               <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Link>

            {/* Order Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
               <div>
                  <div className="flex items-center mb-2">
                     <h1 className="text-2xl font-bold text-text">Order #{order.trackId.slice(-8)}</h1>
                     <span className={`ml-3 px-3 py-1 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border} border`}>
                        {order.orderStatus}
                     </span>
                  </div>
                  <p className="text-text-muted text-sm">Placed on {formattedDate}</p>
               </div>
               <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                  <button
                     onClick={handleDownloadInvoice}
                     className="px-3 py-2 border border-gray-300 bg-surface rounded-md text-sm font-medium text-text flex items-center shadow-sm transition-colors"
                  >
                     <FileText className="mr-2 h-4 w-4" /> Download Invoice
                  </button>
               </div>
            </div>

            {/* Cancelled or Returned Status */}
            {(order.orderStatus === 'Cancelled' || order.orderStatus === 'Returned') && (
               <div className="bg-primary-50 border border-primary-200 rounded-md p-4 mb-6">
                  <div className="flex">
                     {order.orderStatus === 'Cancelled' ? (
                        <XCircle className="h-5 w-5 text-error mr-3" />
                     ) : (
                        <RotateCcw className="h-5 w-5 text-error mr-3" />
                     )}
                     <div>
                        <h3 className="text-sm font-medium text-primary-800">
                           {order.orderStatus === 'Cancelled' ? 'Order Cancelled' : 'Order Returned'}
                        </h3>
                        <p className="text-sm text-primary-700 mt-1">
                           {order.orderStatus === 'Cancelled'
                              ? 'This order has been cancelled and will not be processed.'
                              : 'This order has been returned. Your refund will be processed shortly.'}
                        </p>
                     </div>
                  </div>
               </div>
            )}

            {/* Action Buttons - Rating Products with improved UX */}
            <div className="flex flex-wrap gap-3 mb-8">
               {order.orderStatus === "Delivered" && (
                  <>
                     {order.isReviewedDone ? (
                        <div className="px-4 py-2 bg-surface border border-gray-200 text-success rounded-md text-sm font-medium flex items-center">
                           <CheckCircle className="mr-2 h-4 w-4" /> Products Rated
                        </div>
                     ) : (
                        <button
                           onClick={handleOpenRatingPopup}
                           className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-bg-white rounded-md text-sm font-medium flex items-center"
                        >
                           <Star className="mr-2 h-4 w-4" /> Rate Products
                        </button>
                     )}
                  </>
               )}
            </div>

            {/* Order Status Component */}
            <OrderProgressStatus
               order={order}
               statusInfo={statusInfo}
               estimatedDelivery={estimatedDelivery}
            />

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
               {/* Products Component */}
               <OrderDetailsGrid products={order.purchaseProducts} />

               {/* Payment and Address Info Component */}
               <OrderPaymentAddressInfo
                  order={order}
                  paymentStatusInfo={paymentStatusInfo}
               />
            </div>

            {/* Rating Popup */}
            {isRatingPopupOpen && (
               <RatingPopup
                  onClose={handleCloseRatingPopup}
                  products={order.purchaseProducts}
                  orderId={order.trackId}
               />
            )}
         </div>
      </div>
   );
};

export default OrderDetails;