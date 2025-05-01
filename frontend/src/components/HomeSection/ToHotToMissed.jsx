import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useRef } from 'react'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/scrollbar';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
// Import required modules
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import OfferFeaturedCard from '../cards/OfferFeaturedCard';

const ToHotToMissed = ({ featured }) => {
   const offersRef = useRef(null);

   // console.log("featured", featured);


   return (
      <>
         {/* TOO HOT TO BE MISSED */}
         <section className='w-full h-fit relative px-4 md:px-8 py-5'>
            <h1 className='text-3xl font-bold text-center text-primary-300'>
               TOO HOT TO BE MISSED
            </h1>
            <div className='flex items-center justify-between mb-6'>
               <h2 className='text-2xl font-semibold text-white'>Hot Deals</h2>
               <div className='flex items-center gap-3'>
                  <button
                     onClick={() => offersRef.current?.slidePrev()}
                     className="bg-surface hover:bg-primary-500 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                     aria-label="Previous offers"
                  >
                     <ChevronLeft size={20} />
                  </button>
                  <button
                     onClick={() => offersRef.current?.slideNext()}
                     className="bg-surface hover:bg-primary-500 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                     aria-label="Next offers"
                  >
                     <ChevronRight size={20} />
                  </button>
               </div>
            </div>

            <Swiper
               onSwiper={(swiper) => { offersRef.current = swiper }}
               slidesPerView={1}
               spaceBetween={16}
               modules={[Pagination, Navigation, Autoplay]}
               autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
               }}
               className="offers-swiper"
               breakpoints={{
                  // Mobile first approach
                  0: {
                     slidesPerView: 1,
                     spaceBetween: 10,
                  },
                  640: {
                     slidesPerView: 2,
                     spaceBetween: 15,
                  },
                  1024: {
                     slidesPerView: 3,
                     spaceBetween: 20,
                  },
                  1280: {
                     slidesPerView: 4,
                     spaceBetween: 20,
                  },
               }}
            >
               {featured.map((offer) => (
                  <SwiperSlide key={offer.id}>
                     <OfferFeaturedCard offer={offer} />
                  </SwiperSlide>
               ))}
            </Swiper>
         </section>
      </>
   )
}

export default ToHotToMissed