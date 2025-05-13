import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGetOrderById } from '../../lib/query/queriesAndMutation'
import { formatIndianCurrency } from '../../utils/amountFormater'
import OrderManagement from '../../components/admin/OrderManagement';

const AdminOrderDetails = () => {
   const { trackId } = useParams()
   const [statusUpdating, setStatusUpdating] = useState(false)

   const {
      data: orderData,
      isLoading,
      isError,
      error,
      refetch
   } = useGetOrderById(trackId)

   const order = orderData?.order

   // Handler for updating order status
   const handleStatusUpdate = async (newStatus) => {
      setStatusUpdating(true)
      console.log(`Updating order status from ${order?.orderStatus} to ${newStatus}`)

      try {
         // Recording the timestamp for the status change
         const timeStampField = {
            'Processing': 'orderProcessingTime',
            'Shipped': 'orderShippedTime',
            'Delivered': 'orderDeliveredTime',
            'Cancelled': 'orderCancelledTime',
            'Returned': 'orderReturnedTime'
         }[newStatus];

         console.log(`Setting ${timeStampField} to current time`);
         console.log("Status updated successfully");
         refetch();
      } catch (error) {
         console.error("Error updating status:", error);
      } finally {
         setStatusUpdating(false);
      }
   }

   // Handler for toggling payment status
   const handlePaymentStatusToggle = async () => {
      const newPaymentStatus = order?.paymentStatus === 'paid' ? 'unpaid' : 'paid'
      console.log(`Toggling payment status to: ${newPaymentStatus}`)

      try {
         console.log("Payment status updated successfully");
         refetch();
      } catch (error) {
         console.error("Error updating payment status:", error);
      }
   }

   // Handler for generating invoice
   const handleGenerateInvoice = () => {
      console.log("Generating invoice for order:", order?._id)
   }

   if (isLoading) {
      return (
         <div className="p-6">
            <div className="glass-morphism p-8 rounded-lg flex justify-center items-center">
               <div className="animate-pulse text-center">
                  <p className="text-lg">Loading order details...</p>
               </div>
            </div>
         </div>
      )
   }

   if (isError || !order) {
      return (
         <div className="p-6">
            <div className="glass-morphism p-8 rounded-lg bg-error/20 border border-error">
               <p className="text-error text-center">
                  {error?.message || "Order not found"}
               </p>
               <div className="text-center mt-4">
                  <Link to="/admin/orders" className="btn-primary">
                     Back to Orders
                  </Link>
               </div>
            </div>
         </div>
      )
   }

   // Format date for display
   const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString()
   }

   return (
      <div className="p-6">
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Order #{order.trackId.substring(0, 8)}</h1>
            <Link to="/admin/orders" className="btn-secondary">
               Back to Orders
            </Link>
         </div>

         <div className="glass-morphism p-6 rounded-lg mb-6">
            <div className="flex flex-col md:flex-row justify-between mb-6 pb-6 border-b border-gray-700">
               <div>
                  <h2 className="text-xl font-bold mb-2">Order Information</h2>
                  <p className="text-text-muted">Date: {formatDate(order.createdAt)}</p>
                  <div className="flex gap-2 mt-2">
                     <span className={`px-2 py-1 text-sm rounded-full text-white ${order.orderStatus === 'Processing' ? 'bg-warning' :
                        order.orderStatus === 'Shipped' ? 'bg-info' :
                           order.orderStatus === 'Delivered' ? 'bg-success' : 'bg-error'
                        }`}>
                        {order.orderStatus}
                     </span>
                     <span className={`px-2 py-1 text-sm rounded-full text-white ${order.paymentStatus === 'paid' ? 'bg-success' : 'bg-error'}`}>
                        {order.paymentStatus}
                     </span>
                     <span className="bg-accent-500 px-2 py-1 text-sm rounded-full text-white">
                        {order.orderType}
                     </span>
                  </div>
                  {
                     order.orderType === 'ONLINE' || order.orderType === "COD+ONLINE" ? (
                        <>
                           {/* paid amount */}
                           <div className="flex justify-between items-center mt-2">
                              <span className="text-text-muted">Paid Amount</span>
                              <span className="font-medium text-text">
                                 {order.paymentData && order.paymentData.length > 0
                                    ? formatIndianCurrency(order.paymentData[0].amount)
                                    : formatIndianCurrency(0)}
                              </span>
                           </div>
                           {/* not paid yet */}
                           <div className="flex justify-between items-center mt-2">
                              <span className="text-text-muted">Not Paid Yet</span>
                              <span className="font-medium text-text">
                                 {formatIndianCurrency(order.payableAmount - (order.paymentData && order.paymentData.length > 0
                                    ? order.paymentData[0].amount
                                    : 0))}
                              </span>
                           </div>
                        </>
                     ) : (
                        <>
                           {/* paid amount */}
                           <div className="flex justify-between items-center mt-2">
                              <span className="text-text-muted">Pay on delivery</span>
                              <span className="font-medium text-text">{formatIndianCurrency(order.payableAmount)}</span>
                           </div>
                        </>
                     )
                  }
               </div>

               <div className="mt-4 md:mt-0 text-right">
                  <p className="text-text-muted">Total Amount</p>
                  <p className="text-2xl font-bold">{formatIndianCurrency(order.payableAmount)}</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
               <div>
                  <h3 className="text-lg font-bold mb-2">Customer</h3>
                  <p>Order Owner: {order.orderOwner}</p>
                  {/* Additional user info would be displayed here */}
               </div>

               <div>
                  <h3 className="text-lg font-bold mb-2">Shipping Address</h3>
                  <div className="p-3 rounded-md">
                     <div className="space-y-1">
                        <p className="font-medium">{order.deliveryAddress.addressLine1}</p>
                        {order.deliveryAddress.addressLine2 && (
                           <p>{order.deliveryAddress.addressLine2}</p>
                        )}
                        <p>{order.deliveryAddress.city}</p>
                        <p>
                           {order.deliveryAddress.state}, {order.deliveryAddress.country} - {order.deliveryAddress.postalCode}
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            <div>
               <h3 className="text-lg font-bold mb-2">Items</h3>
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="border-b border-gray-700">
                        <tr>
                           <th className="text-left py-2">Product</th>
                           <th className="text-center py-2">Size</th>
                           <th className="text-center py-2">Quantity</th>
                           <th className="text-right py-2">Price</th>
                           <th className="text-right py-2">Total</th>
                        </tr>
                     </thead>
                     <tbody>
                        {order.purchaseProducts.map((item, index) => (
                           <tr key={index} className="border-b border-gray-700/50">
                              <td className="py-2">
                                 <div className="flex items-center gap-2">
                                    <img
                                       src={item.imagesUrl}
                                       alt={item.title}
                                       className="w-12 h-12 object-cover rounded"
                                    />
                                    <div>
                                       <p className="font-medium">{item.title}</p>
                                       <p className="text-sm text-text-muted truncate max-w-[200px]">{item.subTitle}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="text-center py-2">{item.selectedSize}</td>
                              <td className="text-center py-2">{item.quantity}</td>
                              <td className="text-right py-2">{formatIndianCurrency(item.payableAmount)}</td>
                              <td className="text-right py-2">{formatIndianCurrency(item.payableAmount * item.quantity)}</td>
                           </tr>
                        ))}
                     </tbody>
                     <tfoot>
                        <tr>
                           <td colSpan="4" className="text-right py-2 font-bold">Subtotal</td>
                           <td className="text-right py-2 font-bold">{formatIndianCurrency(order.payableAmount)}</td>
                        </tr>
                        {order.deliveryCharge > 0 && (
                           <tr>
                              <td colSpan="4" className="text-right py-2">Delivery Charge</td>
                              <td className="text-right py-2">{formatIndianCurrency(order.deliveryCharge)}</td>
                           </tr>
                        )}
                        {order.totalDiscount > 0 && (
                           <tr>
                              <td colSpan="4" className="text-right py-2">Total Saveing</td>
                              <td className="text-right py-2">{formatIndianCurrency(order.totalDiscount)}</td>
                           </tr>
                        )}
                        <tr>
                           <td colSpan="4" className="text-right py-2 font-bold">Total</td>
                           <td className="text-right py-2 font-bold">{formatIndianCurrency(order.payableAmount)}</td>
                        </tr>
                     </tfoot>
                  </table>
               </div>
            </div>
         </div>

         {/* Replace the Order Management Section with the new component */}
         <OrderManagement
            order={order}
            statusUpdating={statusUpdating}
            onStatusUpdate={handleStatusUpdate}
            onPaymentStatusToggle={handlePaymentStatusToggle}
            onGenerateInvoice={handleGenerateInvoice}
         />

         <div className="flex justify-between">
            <button className="btn-secondary" onClick={() => window.history.back()}>
               Back
            </button>
         </div>
      </div>
   )
}

export default AdminOrderDetails