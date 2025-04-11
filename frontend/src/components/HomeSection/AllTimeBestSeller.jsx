import React from 'react'
import ProductDetail from '../product/ProductDetail'

const AllTimeBestSeller = () => {
   const allTimeBestSeller = {
      id: "1",
      name: "Marvel Avengers Graphic T-Shirt",
      description: "Official Marvel merchandise featuring iconic Avengers characters",
      fullDescription: "Show your love for Marvel with this premium graphic tee featuring the Avengers. Made from soft, breathable cotton with a relaxed fit for everyday comfort.",
      image: [
         {
            src: "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
            id: "1"
         },
         {
            src: "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
            id: "2"
         },
         {
            src: "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
            id: "3"
         }
      ],
      price: {
         current: 1299,
         original: 1999,
         discount: 35
      },
      sizes: ["S", "M", "L"],
      inStock: true,
      rating: 4.5
   };


   return (
      <>
         {/* Community’s All-Time Bestseller */}
         <section className='w-full py-12'>
            <div className='container mx-auto px-4 md:px-8'>
               <h1 className='text-3xl font-bold text-center text-primary-300 mb-20'>
                  Community's All-Time Bestseller
               </h1>
               <ProductDetail product={allTimeBestSeller} />
            </div>
         </section>

      </>
   )
}

export default AllTimeBestSeller