import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductOnlyImageCard from '../cards/ProductOnlyImageCard'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/scrollbar';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
// Import required modules
import {
   Pagination,
   Navigation,
} from 'swiper/modules';

const WomenCropTops = () => {
   const womenSectionRef = useRef(null);


   const womenSection = [
      {
         id: 1,
         name: "Flamewave Oversized T-Shirt",
         description: "Men's Brown Oversized Cargo Joggers",
         image: [
            "https://plus.unsplash.com/premium_photo-1689371957665-b9d6a135edc9?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
            "https://plus.unsplash.com/premium_photo-1691622500412-151f9c315b4f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
            "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
            "https://images.unsplash.com/photo-1495385794356-15371f348c31?q=80&w=1940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
            "https://images.unsplash.com/photo-1485231183945-fffde7cc051e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
         ],
         price: {
            current: 1299,
            original: 1999,
            discount: 20
         }
      },
   ]

   console.log("Test")

   return (
      <>
         {/* crop tops */}
         <section className='w-full h-fit relative px-4 md:px-80 py-5'>
            <h1 className='text-3xl font-bold text-center text-primary-300 mt-20 mb-10'>
               YOU WANT THESE to "Crops Tops"
            </h1>
            <div className='flex items-center justify-between mb-6'>
               <h2 className='text-2xl font-semibold text-white'>Women Section</h2>
               <div className='flex items-center gap-3'>
                  <button
                     onClick={() => womenSectionRef.current?.slidePrev()}
                     className="bg-surface hover:bg-primary-500 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                     aria-label="Previous products"
                  >
                     <ChevronLeft size={20} />
                  </button>
                  <button
                     onClick={() => womenSectionRef.current?.slideNext()}
                     className="bg-surface hover:bg-primary-500 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                     aria-label="Next products"
                  >
                     <ChevronRight size={20} />
                  </button>
               </div>
            </div>

            <Swiper
               onSwiper={(swiper) => { womenSectionRef.current = swiper }}
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
               {womenSection.map((product, index) => (
                  <SwiperSlide key={`${product.id}-${index}`}>
                     <ProductOnlyImageCard
                        product={product}
                        onPrevious={() => womenSectionRef.current?.slidePrev()}
                        onNext={() => womenSectionRef.current?.slideNext()}
                     />
                  </SwiperSlide>
               ))}
            </Swiper>
         </section>
      </>
   )
}

export default WomenCropTops