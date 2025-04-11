import React, { useRef } from 'react'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/scrollbar';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
// Import required modules
import { Pagination, Navigation, } from 'swiper/modules';
import ProductOnlyImageCard from '../cards/ProductOnlyImageCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ExclusiveProduct = () => {
   const productsSwiperRef = useRef(null);

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
         {/* exclusive products */}
         <section className='w-full h-fit relative px-4 md:px-80 py-5'>
            <div className='flex items-center justify-between mb-6'>
               <h2 className='text-2xl font-semibold text-white'>Excusive Products</h2>
               <div className='flex items-center gap-3'>
                  <button
                     onClick={() => productsSwiperRef.current?.slidePrev()}
                     className="bg-surface hover:bg-primary-500 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                     aria-label="Previous products"
                  >
                     <ChevronLeft size={20} />
                  </button>
                  <button
                     onClick={() => productsSwiperRef.current?.slideNext()}
                     className="bg-surface hover:bg-primary-500 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                     aria-label="Next products"
                  >
                     <ChevronRight size={20} />
                  </button>
               </div>
            </div>

            <Swiper
               onSwiper={(swiper) => { productsSwiperRef.current = swiper }}
               slidesPerView={1}
               spaceBetween={16}
               modules={[Pagination, Navigation]}
               className="products-swiper"
               breakpoints={{
                  // Mobile first approach
                  0: {
                     slidesPerView: 1,
                     spaceBetween: 10,
                  },
                  480: {
                     slidesPerView: 2,
                     spaceBetween: 15,
                  },
                  768: {
                     slidesPerView: 3,
                     spaceBetween: 15,
                  },
                  1024: {
                     slidesPerView: 4,
                     spaceBetween: 20,
                  },
               }}
            >
               {products.map((product, index) => (
                  <SwiperSlide key={`${product.id}-${index}`}>
                     <ProductOnlyImageCard
                        product={product}
                        onPrevious={() => productsSwiperRef.current?.slidePrev()}
                        onNext={() => productsSwiperRef.current?.slideNext()}
                     />
                  </SwiperSlide>
               ))}
            </Swiper>
         </section>
      </>
   )
}

export default ExclusiveProduct