import { Calendar, Percent } from 'lucide-react';
import ProductCard from './ProductCard';

const OfferDetailsCard = ({ offer }) => {

   console.log(offer);

   const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
   };

   return (
      <div className="rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
         {/* Header with visual improvements */}
         <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
               <div>
                  <h2 className="text-xl font-bold text-text capitalize">{offer.offerName}</h2>
                  <div className="text-text-muted text-sm mt-1 flex items-center">
                     <Calendar className="w-4 h-4 mr-1.5" />
                     <span>{formatDate(offer.startDate)} - {formatDate(offer.endDate)}</span>
                  </div>
               </div>
               <div className="bg-accent/10 text-accent px-4 py-1.5 rounded-full flex items-center self-start">
                  <Percent className="w-4 h-4 mr-1.5" />
                  <span className="font-bold">{offer.discountValue}% OFF</span>
               </div>
            </div>

            {/* Code and Status with improved spacing and visibility */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
               <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-md text-sm font-medium">
                  Code: <span className="font-bold">{offer.offerCode}</span>
               </div>
               <div className={`px-3 py-1.5 rounded-full text-sm flex items-center ${offer.offerStatus ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${offer.offerStatus ? 'bg-success' : 'bg-error'}`}></span>
                  {offer.offerStatus ? 'Active' : 'Inactive'}
               </div>
            </div>
         </div>

         {/* Products Section with improved layout */}
         <div className="p-5">
            <h3 className="text-md font-medium mb-4 text-text">Featured Products</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {offer.products?.length > 0 ? (
                  offer.products.map(product => (
                     <ProductCard
                        key={product._id}
                        product={product}
                        discountValue={offer.discountValue}
                        compact={true}
                     />
                  ))
               ) : (
                  <div className="col-span-full bg-surface/50 rounded-lg p-6 text-center text-text-muted">
                     <p className="mb-1">No products in this offer</p>
                     <p className="text-sm">This offer may apply to future products</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default OfferDetailsCard;