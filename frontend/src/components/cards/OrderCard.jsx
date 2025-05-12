import React from 'react'
import { Link } from 'react-router-dom'
import { formatIndianCurrency } from '../../utils/amountFormater'

const OrderCard = ({ order }) => {
   // Format date properly
   const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-IN', {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
         hour12: true
      })
   }

   // Status badge color classes
   const getStatusClass = (status) => {
      switch (status?.toLowerCase()) {
         case 'processing': return 'bg-warning'
         case 'shipped': return 'bg-info'
         case 'delivered': return 'bg-success'
         case 'cancelled': return 'bg-error'
         case 'returned': return 'bg-secondary-500'
         default: return 'bg-gray-500'
      }
   }

   // Payment status badge color
   const getPaymentStatusClass = (status) => {
      return status?.toLowerCase() === 'paid'
         ? 'bg-success'
         : 'bg-error'
   }

   return (
      <div className="product-card glass-morphism p-4 mb-4 rounded-lg shadow-md">
         <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1">
               <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg">Order #{order.trackId}</h3>
                  <span
                     className={`${getStatusClass(order.orderStatus)} px-2 py-1 text-xs rounded-full text-white font-medium`}
                  >
                     {order.orderStatus || 'Processing'}
                  </span>
               </div>

               <div className="text-sm mb-3 text-text-muted">
                  <p className="mb-1"><span className="font-medium">Ordered:</span> {formatDate(order.createdAt)}</p>
                  <p className="mb-1"><span className="font-medium">Customer:</span> {order.user?.email || 'Unknown'}</p>
                  {order.deliveryAddress && (
                     <p className="mb-1"><span className="font-medium">Delivery:</span> {order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                  )}
               </div>

               {/* Product Summary */}
               <div className="mb-3 text-sm">
                  <p className="font-medium mb-2">Items ({order.purchaseProducts?.length || 0}):</p>
               </div>

               <div className="flex flex-wrap gap-2 mt-3">
                  <span
                     className={`${getPaymentStatusClass(order.paymentStatus)} px-2 py-1 text-xs rounded-full text-white`}
                  >
                     {order.paymentStatus || 'unpaid'}
                  </span>
                  {order.orderType && (
                     <span className="bg-accent-500 px-2 py-1 text-xs rounded-full text-white">
                        {order.orderType}
                     </span>
                  )}
                  {order.paymentData && order.paymentData[0]?.paymentMethod && (
                     <span className="bg-gray-600 px-2 py-1 text-xs rounded-full text-white">
                        Via {order.paymentData[0].paymentMethod}
                     </span>
                  )}
               </div>
            </div>

            <div className="flex flex-col justify-between items-end">
               <div className="text-right">
                  <div className="text-xl font-bold mb-1">
                     {formatIndianCurrency(order.payableAmount)}
                  </div>
                  <div className="text-xs text-text-muted mb-3">
                     <p>Items: {formatIndianCurrency(order.payableAmount - order.deliveryCharge)}</p>
                     <p>Delivery: {formatIndianCurrency(order.deliveryCharge)}</p>
                     {order.totalDiscount > 0 && (
                        <p>Discount: -{formatIndianCurrency(order.totalDiscount)}</p>
                     )}
                  </div>
               </div>

               <div className="flex flex-col gap-2">
                  <Link
                     to={`/admin/orders/${order.trackId}`}
                     className="btn-primary text-sm px-4 py-2 inline-block text-center"
                  >
                     View Details
                  </Link>
               </div>
            </div>
         </div>
      </div>
   )
}

export default OrderCard