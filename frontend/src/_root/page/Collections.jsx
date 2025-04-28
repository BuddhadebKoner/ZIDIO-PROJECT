// import React from 'react'
// import { useParams } from 'react-router-dom'
// import ProductCard from '../../components/cards/ProductCard';

// const Collections = () => {
//   // grab type from url
//   const { collections } = useParams()

//   const formatString = (str) => {
//     return str
//       .split('-')
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(' ');
//   };

//   // Sample product data
//   const products = [
//     {
//       id: 1,
//       name: "Flamewave Oversized T-Shirt",
//       description: "Men's Brown Oversized Cargo Joggers",
//       image: [
//         "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
//         "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
//       ],
//       price: {
//         current: 1299,
//         original: 1999,
//         discount: 20
//       },
//       slug: "flamewave-oversized-t-shirt"
//     },
//     {
//       id: 2,
//       name: "Urban Streetwear Jacket",
//       description: "Black Denim Urban Style Jacket",
//       image: [
//         "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
//         "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
//       ],
//       price: {
//         current: 2499,
//         original: 3999,
//         discount: 35
//       },
//       slug: "flamewave-oversized-t-shirt"
//     },
//     {
//       id: 3,
//       name: "Comfort Slim Fit Pants",
//       description: "Navy Blue Tapered Fit Trousers",
//       image: [
//         "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
//         "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
//       ],
//       price: {
//         current: 1799,
//         original: 2299,
//         discount: 15
//       },
//       slug: "flamewave-oversized-t-shirt"
//     },
//     {
//       id: 4,
//       name: "Classic White Sneakers",
//       description: "Casual Low-Top Canvas Shoes",
//       image: [
//         "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
//         "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
//       ],
//       price: {
//         current: 999,
//         original: 1499,
//         discount: 25
//       },
//       slug: "flamewave-oversized-t-shirt"
//     },
//     {
//       id: 5,
//       name: "Flamewave Oversized T-Shirt",
//       description: "Men's Brown Oversized Cargo Joggers",
//       image: [
//         "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
//         "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
//       ],
//       price: {
//         current: 1299,
//         original: 1999,
//         discount: 20
//       },
//       slug: "flamewave-oversized-t-shirt"
//     },
//     {
//       id: 6,
//       name: "Urban Streetwear Jacket",
//       description: "Black Denim Urban Style Jacket",
//       image: [
//         "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
//         "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
//       ],
//       price: {
//         current: 2499,
//         original: 3999,
//         discount: 35
//       },
//       slug: "flamewave-oversized-t-shirt"
//     },
//     {
//       id: 7,
//       name: "Comfort Slim Fit Pants",
//       description: "Navy Blue Tapered Fit Trousers",
//       image: [
//         "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
//         "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
//       ],
//       price: {
//         current: 1799,
//         original: 2299,
//         discount: 15
//       },
//       slug: "flamewave-oversized-t-shirt"
//     },
//     {
//       id: 8,
//       name: "Classic White Sneakers",
//       description: "Casual Low-Top Canvas Shoes",
//       image: [
//         "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
//         "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
//       ],
//       price: {
//         current: 999,
//         original: 1499,
//         discount: 25
//       },
//       slug: "flamewave-oversized-t-shirt"
//     },
//   ];


//   return (
//     <>
//       <div className='flex flex-col justify-center items-center'>
//         {/* banner */}
//         <div className='w-fit h-fit'>
//           <img
//             src="/garbage/banner.png"
//             className='w-fit h-fit object-cover'
//             alt="" />
//         </div>

//         <h1 className='text-3xl font-bold text-white mt-10'>
//           {formatString(collections)}
//         </h1>


//         {/* products */}
//         <div className="container mx-auto px-2 sm:px-4 py-6 mt-2">
//           <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
//             {products.map(product => (
//               <div key={product.id} className="w-full">
//                 <ProductCard product={product} />
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default Collections


import React from 'react'

const Collections = () => {
  return (
    <div>Collections</div>
  )
}

export default Collections