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

const WomenCropTops = ({ featured }) => {
   const womenSectionRef = useRef(null);

   return (
      <>
         {/* crop tops */}
         <section className='w-full h-fit relative py-5'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10'>
               <h1 className='text-2xl sm:text-3xl font-bold text-center text-primary-300 mt-10 sm:mt-20 mb-6 sm:mb-10'>
                  YOU WANT THESE to "Crops Tops"
               </h1>
               <div className='flex items-center justify-between mb-6'>
                  <h2 className='text-xl sm:text-2xl font-semibold text-white'>Women Section</h2>
                  <div className='flex items-center gap-2 sm:gap-3'>
                     <button
                        onClick={() => womenSectionRef.current?.slidePrev()}
                        className="bg-surface hover:bg-primary-500 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                        aria-label="Previous products"
                     >
                        <ChevronLeft size={18} className="sm:hidden" />
                        <ChevronLeft size={20} className="hidden sm:block" />
                     </button>
                     <button
                        onClick={() => womenSectionRef.current?.slideNext()}
                        className="bg-surface hover:bg-primary-500 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                        aria-label="Next products"
                     >
                        <ChevronRight size={18} className="sm:hidden" />
                        <ChevronRight size={20} className="hidden sm:block" />
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
                     // More balanced breakpoints
                     0: {
                        slidesPerView: 1,
                        spaceBetween: 10,
                     },
                     480: {
                        slidesPerView: 2,
                        spaceBetween: 12,
                     },
                     640: {
                        slidesPerView: 2,
                        spaceBetween: 15,
                     },
                     768: {
                        slidesPerView: 3,
                        spaceBetween: 15,
                     },
                     1024: {
                        slidesPerView: 4,
                        spaceBetween: 16,
                     },
                     1280: {
                        slidesPerView: 4,
                        spaceBetween: 20,
                     },
                  }}
               >
                  {featured.map((featuredItem, index) => (
                     <SwiperSlide key={`${featuredItem.productId._id}-${index}`}>
                        <ProductOnlyImageCard
                           product={featuredItem.productId}
                           onPrevious={() => womenSectionRef.current?.slidePrev()}
                           onNext={() => womenSectionRef.current?.slideNext()}
                        />
                     </SwiperSlide>
                  ))}
               </Swiper>
            </div>
         </section>
      </>
   )
}

export default WomenCropTops