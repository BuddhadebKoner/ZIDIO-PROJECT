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
         image: "https://cdn.shopify.com/s/files/1/1002/7150/files/Marvel-Designs-Collection-banner-456.jpg?v=1632822779",
         thumbnail: "/garbage/banner.png"
      },
      {
         id: 2,
         name: "Captain America",
         description: "Patriot and super soldier fighting for justice",
         image: "/garbage/naruto.png",
         thumbnail: "https://cmsapi-frontend.naruto-official.com/site/api/naruto/Image/get?path=/naruto/en/sitecommonbanner/2024/09/20/ZKD0RdfPAvXQh0M8/NARUTOMANIA-EN.png"
      },
      {
         id: 3,
         name: "Spider-Man",
         description: "The agile web-slinger saving the day",
         image: "https://cdn.shopify.com/s/files/1/1002/7150/files/Marvel-Designs-Collection-banner-456.jpg?v=1632822779",
         thumbnail: "/garbage/banner.png"
      },
      {
         id: 4,
         name: "Thor",
         description: "God of thunder with unmatched power",
         image: "/garbage/naruto.png",
         thumbnail: "https://cmsapi-frontend.naruto-official.com/site/api/naruto/Image/get?path=/naruto/en/sitecommonbanner/2024/09/20/ZKD0RdfPAvXQh0M8/NARUTOMANIA-EN.png"
      },
      {
         id: 5,
         name: "Iron Man",
         description: "Genius billionaire in a high-tech armored suit",
         image: "https://cdn.shopify.com/s/files/1/1002/7150/files/Marvel-Designs-Collection-banner-456.jpg?v=1632822779",
         thumbnail: "/garbage/banner.png"
      },
      {
         id: 6,
         name: "Captain America",
         description: "Patriot and super soldier fighting for justice",
         image: "/garbage/naruto.png",
         thumbnail: "https://cmsapi-frontend.naruto-official.com/site/api/naruto/Image/get?path=/naruto/en/sitecommonbanner/2024/09/20/ZKD0RdfPAvXQh0M8/NARUTOMANIA-EN.png"
      },
      {
         id: 7,
         name: "Spider-Man",
         description: "The agile web-slinger saving the day",
         image: "https://cdn.shopify.com/s/files/1/1002/7150/files/Marvel-Designs-Collection-banner-456.jpg?v=1632822779",
         thumbnail: "/garbage/banner.png"
      },
      {
         id: 8,
         name: "Thor",
         description: "God of thunder with unmatched power",
         image: "/garbage/naruto.png",
         thumbnail: "https://cmsapi-frontend.naruto-official.com/site/api/naruto/Image/get?path=/naruto/en/sitecommonbanner/2024/09/20/ZKD0RdfPAvXQh0M8/NARUTOMANIA-EN.png"
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