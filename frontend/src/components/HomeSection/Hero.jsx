import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/scrollbar';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import {
   Pagination,
   Autoplay,
   Navigation,
   Scrollbar
} from 'swiper/modules';
import { Link } from 'react-router-dom';


const Hero = ({ bannerImages }) => {

   return (
      <>
         <section className='w-full h-fit relative top-[-30px] animate-fadeIn'>
            <div className="banner-swiper-container">
               <Swiper
                  scrollbar={{
                     hide: true,
                  }}
                  autoplay={{
                     delay: 4500,
                     disableOnInteraction: false,
                  }}
                  loop={true}
                  modules={[Scrollbar, Pagination, Autoplay, Navigation]}
                  className="banner-swiper"
               >
                  {bannerImages && bannerImages.map((banner) => (
                     <SwiperSlide key={banner._id}>
                        <div className="relative w-full">
                           <Link to={banner.path} className="cursor-pointer">
                              <img
                                 src={banner.imageUrl}
                                 alt={`Banner - ${banner.imageId}`}
                                 className="w-full h-[300px] md:h-[400px] lg:h-[800px] object-cover"
                              />
                           </Link>
                        </div>
                     </SwiperSlide>
                  ))}
               </Swiper>
            </div>
         </section>
      </>
   )
}

export default Hero