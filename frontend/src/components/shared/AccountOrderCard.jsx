import React from 'react';
import { Link } from 'react-router-dom';
import { formatIndianCurrency } from '../../utils/amountFormater';

const AccountOrderCard = ({ order }) => {
   // Simplified status badge function using theme colors
   const getStatusBadge = (status) => {
      const statusColors = {
         'Processing': 'bg-primary-100 text-primary-800',
         'Shipped': 'bg-secondary-100 text-secondary-800',
         'Delivered': 'bg-accent-100 text-accent-800',
         'Cancelled': 'bg-error text-bg-white',
         'Returned': 'bg-error text-bg-white',
         'Pending': 'bg-primary-100 text-primary-800',
         'Success': 'bg-accent-100 text-accent-800',
         'Failed': 'bg-error text-bg-white'
      };

      return (
         <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
            {status}
         </span>
      );
   };

   // Format date in a clean, readable format
   const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'short',
         day: 'numeric'
      });
   };

   const totalItems = order.purchaseProducts.reduce((sum, product) => sum + product.quantity, 0);

   const thumbnailImage = order.purchaseProducts[0]?.imagesUrl;

   return (
      <div className="border red-velvet-border p-4 bg-surface rounded-lg mb-4 shadow-sm hover:shadow-md transition-shadow">
         <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
               {/* Small thumbnail of first product */}
               <div className="w-12 h-12 rounded overflow-hidden hidden sm:block">
                  <img
                     src={thumbnailImage}
                     alt="Order thumbnail"
                     className="w-full h-full object-cover"
                  />
               </div>

               <div>
                  <Link to={`/profile/orders/${order.trackId}`} className="text-primary-400 hover:underline">
                     <h3 className="font-semibold">Order #{order.trackId.slice(-6)}</h3>
                  </Link>
                  <p className="text-text-muted text-sm">{formatDate(order.createdAt)}</p>
               </div>
            </div>

            <div className="text-right">
               <div className="mb-1">
                  {getStatusBadge(order.orderStatus)}
               </div>
               <p className="font-bold text-text">{formatIndianCurrency(order.payableAmount)}</p>
            </div>
         </div>

         <div className="flex justify-between items-center text-sm text-text-muted mt-2 pt-2 border-t border-primary-900/20">
            <div>
               {totalItems} {totalItems === 1 ? 'item' : 'items'} • {order.orderType}
            </div>
            <Link
               to={`/profile/orders/${order.trackId}`}
               className="text-primary-400 hover:underline font-medium"
            >
               View Details →
            </Link>
         </div>
      </div>
   );
};

export default AccountOrderCard;