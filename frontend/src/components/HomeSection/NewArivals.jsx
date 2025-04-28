import React from 'react'
import ProductCard from '../cards/ProductCard'

const NewArivals = ({ products }) => {

   console.log('New Arrivals:', products);

   return (
      <>
         {/* new arivals */}
         <section className='w-full h-fit relative px-4 md:px-8'>
            <div className='flex flex-col items-center justify-center py-10 gap-2'>
               <h1 className='text-3xl font-normal text-center text-primary-300 letter-spacing-wide'>
                  NEW ARRIVALS
               </h1>
               <p className='text-center text-gray-500'>
                  MARVEL 2025
               </p>
               <p className='text-center text-gray-500'>
                  Warrior's Favourites have made a
               </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {products.map(product => (
                  <div key={product._id} className="flex items-center justify-center">
                     <ProductCard 
                        product={product.productId} 
                        parentId={product._id}
                     />
                  </div>
               ))}
            </div>

            {/* explore more */}
            <div className='flex items-center justify-center mt-10'>
               <button className='bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition duration-300'>
                  Explore More
               </button>
            </div>
         </section>
      </>
   )
}

export default NewArivals