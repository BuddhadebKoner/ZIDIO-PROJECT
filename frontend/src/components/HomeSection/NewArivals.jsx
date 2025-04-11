import React from 'react'
import ProductCard from '../cards/ProductCard'

const NewArivals = () => {

   // Sample product data
   const products = [
      {
         id: 1,
         name: "Flamewave Oversized T-Shirt",
         description: "Men's Brown Oversized Cargo Joggers",
         image: [
            "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
            "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
         ],
         price: {
            current: 1299,
            original: 1999,
            discount: 20
         }
      },
      {
         id: 2,
         name: "Urban Streetwear Jacket",
         description: "Black Denim Urban Style Jacket",
         image: [
            "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
            "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
         ],
         price: {
            current: 2499,
            original: 3999,
            discount: 35
         }
      },
      {
         id: 3,
         name: "Comfort Slim Fit Pants",
         description: "Navy Blue Tapered Fit Trousers",
         image: [
            "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
            "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
         ],
         price: {
            current: 1799,
            original: 2299,
            discount: 15
         }
      },
      {
         id: 4,
         name: "Classic White Sneakers",
         description: "Casual Low-Top Canvas Shoes",
         image: [
            "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
            "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
         ],
         price: {
            current: 999,
            original: 1499,
            discount: 25
         }
      },
      {
         id: 5,
         name: "Flamewave Oversized T-Shirt",
         description: "Men's Brown Oversized Cargo Joggers",
         image: [
            "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
            "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
         ],
         price: {
            current: 1299,
            original: 1999,
            discount: 20
         }
      },
      {
         id: 6,
         name: "Urban Streetwear Jacket",
         description: "Black Denim Urban Style Jacket",
         image: [
            "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
            "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
         ],
         price: {
            current: 2499,
            original: 3999,
            discount: 35
         }
      },
      {
         id: 7,
         name: "Comfort Slim Fit Pants",
         description: "Navy Blue Tapered Fit Trousers",
         image: [
            "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
            "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
         ],
         price: {
            current: 1799,
            original: 2299,
            discount: 15
         }
      },
      {
         id: 8,
         name: "Classic White Sneakers",
         description: "Casual Low-Top Canvas Shoes",
         image: [
            "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
            "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
         ],
         price: {
            current: 999,
            original: 1499,
            discount: 25
         }
      },
   ];

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
                  <div key={product.id} className="flex items-center justify-center">
                     <ProductCard product={product} />
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