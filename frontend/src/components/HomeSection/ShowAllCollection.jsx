import React, { useState } from 'react'
import { Link } from 'react-router-dom';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/scrollbar';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
// Import required modules
import { Navigation, FreeMode, Thumbs } from 'swiper/modules';

const ShowAllCollection = ({ collections }) => {
   const [thumbsSwiper, setThumbsSwiper] = useState(null);

   // console.log('Collections:', collections);

   return (
      <>
         {/* ALL COLLECTION */}
         <section className='w-full h-fit relative py-20'>
            <h1 className='text-3xl font-normal text-center text-primary-300 letter-spacing-wide mb-10'>
               ALL COLLECTION
            </h1>

            <Swiper
               style={{
                  '--swiper-navigation-color': '#fff',
                  '--swiper-pagination-color': '#fff',
               }}
               loop={true}
               spaceBetween={0}
               thumbs={{ swiper: thumbsSwiper }}
               modules={[FreeMode, Navigation, Thumbs]}
               className="mySwiper2"
            >
               {collections.map((collection) => (
                  <SwiperSlide key={`main-${collection._id}`}>
                     <Link to={collection.path} className="relative block">
                        <img
                           src={collection.imageUrl}
                           alt="Collection image"
                           className="w-full h-[800px] object-cover"
                        />

                     </Link>
                  </SwiperSlide>
               ))}
            </Swiper>

            <Swiper
               onSwiper={setThumbsSwiper}
               loop={true}
               spaceBetween={10}
               slidesPerView={4}
               freeMode={true}
               watchSlidesProgress={true}
               modules={[FreeMode, Navigation, Thumbs]}
               className="mySwiper mt-4"
            >
               {collections.map((collection) => (
                  <SwiperSlide key={`thumb-${collection._id}`}>
                     <img
                        src={collection.imageUrl}
                        alt="Collection thumbnail"
                        className="w-full h-24 object-cover cursor-pointer"
                     />
                  </SwiperSlide>
               ))}
            </Swiper>
         </section>
      </>
   )
}

export default ShowAllCollection