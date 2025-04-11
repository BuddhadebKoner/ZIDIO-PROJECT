import React, { useState } from 'react'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/scrollbar';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
// Import required modules
import { Navigation, FreeMode, Thumbs } from 'swiper/modules';

const ShowAllCollection = () => {
   const [thumbsSwiper, setThumbsSwiper] = useState(null);


   // Collection data for the Marvel Superhero Comic slider
   const collections = [
      {
         id: 1,
         name: "Iron Man",
         description: "Genius billionaire in a high-tech armored suit",
         image: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
         thumbnail: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      {
         id: 2,
         name: "Captain America",
         description: "Patriot and super soldier fighting for justice",
         image: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
         thumbnail: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      {
         id: 3,
         name: "Spider-Man",
         description: "The agile web-slinger saving the day",
         image: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
         thumbnail: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      {
         id: 4,
         name: "Thor",
         description: "God of thunder with unmatched power",
         image: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
         thumbnail: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      {
         id: 5,
         name: "Iron Man",
         description: "Genius billionaire in a high-tech armored suit",
         image: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
         thumbnail: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      {
         id: 6,
         name: "Captain America",
         description: "Patriot and super soldier fighting for justice",
         image: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
         thumbnail: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      {
         id: 7,
         name: "Spider-Man",
         description: "The agile web-slinger saving the day",
         image: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
         thumbnail: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      },
      {
         id: 8,
         name: "Thor",
         description: "God of thunder with unmatched power",
         image: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
         thumbnail: "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      }
   ];

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
                  <SwiperSlide key={`main-${collection.id}`}>
                     <div className="relative">
                        <img
                           src={collection.image}
                           alt={collection.name}
                           className="w-full h-[800px] object-cover"
                        />
                     </div>
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
                  <SwiperSlide key={`thumb-${collection.id}`}>
                     <img
                        src={collection.thumbnail}
                        alt={`${collection.name} thumbnail`}
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