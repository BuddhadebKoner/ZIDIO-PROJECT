import { CreditCard, MapPin } from 'lucide-react';
import { formatIndianCurrency } from '../../utils/amountFormater';

const OrderPaymentAddressInfo = ({ order, paymentStatusInfo }) => {
   return (
      <div className="lg:col-span-1 space-y-6">
         {/* Payment Information */}
         <div className="glass-morphism rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
               <CreditCard className="h-5 w-5 text-text-muted mr-2" />
               <h2 className="text-lg font-semibold text-text">Payment Details</h2>
            </div>

            <div className="space-y-3 text-sm">
               <div className="flex justify-between items-center">
                  <span className="text-text-muted">Payment Method</span>
                  <span className="font-medium text-text">{order.orderType}</span>
               </div>

               <div className="flex justify-between items-center">
                  <span className="text-text-muted">Payment Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusInfo.bg} ${paymentStatusInfo.color} ${paymentStatusInfo.border} border`}>
                     {order.paymentStatus}
                  </span>
               </div>

               {order.paymentId && (
                  <div className="flex justify-between items-center">
                     <span className="text-text-muted">Payment ID</span>
                     <span className="font-medium text-text truncate max-w-[150px]">{order.paymentId}</span>
                  </div>
               )}

               <div className="pt-3 border-t border-primary-800/30">
                  <div className="flex justify-between items-center">
                     <span className="text-text-muted">Subtotal</span>
                     <span className="font-medium text-text">{formatIndianCurrency(order.payableAmount + order.totalDiscount)}</span>
                  </div>

                  <div className="flex justify-between items-center mt-1">
                     <span className="text-text-muted">Discount</span>
                     <span className="font-medium text-success">-{formatIndianCurrency(order.totalDiscount)}</span>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-primary-800/30">
                     <span className="font-semibold text-text">Total</span>
                     <span className="font-bold text-text">{formatIndianCurrency(order.payableAmount)}</span>
                  </div>
               </div>

               {order.orderType.includes('COD') && (
                  <div className="flex justify-between items-center pt-3 border-t border-primary-800/30">
                     <span className="text-text-muted">Cash on Delivery</span>
                     <span className="font-medium text-text">{formatIndianCurrency(order.payInCashAmount)}</span>
                  </div>
               )}

               {(order.orderType.includes('ONLINE') && order.paymentStatus === 'paid') ? (
                  <div className="flex justify-between items-center">
                     <span className="text-text-muted">Paid ONLINE</span>
                     <span className="font-medium text-text">{formatIndianCurrency(order.payInOnlineAmount)}</span>
                  </div>
               ) : (
                  <>
                     <div className="flex justify-between items-center">
                        <span className="text-text-muted">Amount not paid yet</span>
                        <span className="font-medium text-text">{formatIndianCurrency(order.payInOnlineAmount)}</span>
                     </div>
                  </>
               )}
            </div>
         </div>

         {/* Delivery Information */}
         <div className="rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
               <MapPin className="h-5 w-5 text-text-muted mr-2" />
               <h2 className="text-lg font-semibold text-text">Delivery Information</h2>
            </div>

            <div className="glass-morphism rounded-md">
               <div className="p-3 rounded-md">
                  <div className="space-y-1">
                     <h2
                        className='font-bold mb-2'
                     >
                        Billing Name : {order.orderOwner}
                     </h2>
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
      </div>
   );
};

export default OrderPaymentAddressInfo;