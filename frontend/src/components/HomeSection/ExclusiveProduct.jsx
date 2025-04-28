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

const ExclusiveProduct = ({ products }) => {
   const productsSwiperRef = useRef(null);

   // console.log('Exclusive Products:', products);

   return (
      <>
         {/* exclusive products */}
         <section className='w-full h-fit relative py-5'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10'>
               <div className='flex items-center justify-between mb-6'>
                  <h2 className='text-xl sm:text-2xl font-semibold text-white'>Excusive Products</h2>
                  <div className='flex items-center gap-2 sm:gap-3'>
                     <button
                        onClick={() => productsSwiperRef.current?.slidePrev()}
                        className="bg-surface hover:bg-primary-500 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                        aria-label="Previous products"
                     >
                        <ChevronLeft size={18} className="sm:hidden" />
                        <ChevronLeft size={20} className="hidden sm:block" />
                     </button>
                     <button
                        onClick={() => productsSwiperRef.current?.slideNext()}
                        className="bg-surface hover:bg-primary-500 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                        aria-label="Next products"
                     >
                        <ChevronRight size={18} className="sm:hidden" />
                        <ChevronRight size={20} className="hidden sm:block" />
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
                  {products.map((item, index) => (
                     <SwiperSlide key={`${item.productId._id}-${index}`}>
                        <ProductOnlyImageCard
                           product={{
                              id: item.productId._id,
                              title: item.productId.title,
                              price: item.productId.price,
                              slug: item.productId.slug,
                              image: item.productId.image,
                              offer: item.productId.offer,
                              _id: item._id
                           }}
                           onPrevious={() => productsSwiperRef.current?.slidePrev()}
                           onNext={() => productsSwiperRef.current?.slideNext()}
                        />
                     </SwiperSlide>
                  ))}
               </Swiper>
            </div>
         </section>
      </>
   )
}

export default ExclusiveProduct