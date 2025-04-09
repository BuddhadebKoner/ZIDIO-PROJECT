import React from 'react'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'

// Import Swiper styles
import 'swiper/css/scrollbar'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

import 'swiper/css'

// Import required modules
import { Scrollbar, Pagination, Autoplay, Navigation } from 'swiper/modules'

// Banner images for the swiper
const bannerImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Fashion collection banner",
    link: "/collections/summer"
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "New arrivals banner",
    link: "/new-arrivals"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1620336655052-b57986f5a26a?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Sale banner",
    link: "/sale"
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1474&auto=format&fit=crop",
    alt: "Accessories banner",
    link: "/accessories"
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1470&auto=format&fit=crop",
    alt: "Women's collection banner",
    link: "/collections/women"
  }
];

const Home = () => {
  return (
    <>
      <section className='w-full h-fit relative top-[-30px]'>
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
            {bannerImages.map((banner) => (
              <SwiperSlide key={banner.id}>
                <div className="relative w-full">
                  <img
                    src={banner.src}
                    alt={banner.alt}
                    className="w-full h-[300px] md:h-[400px] lg:h-[700px] object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </>
  )
}

export default Home