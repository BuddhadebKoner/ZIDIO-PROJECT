import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShoppingBag, UserRound, Menu, X } from 'lucide-react'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'

// Import Swiper styles
import 'swiper/css/scrollbar'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

import 'swiper/css'

// Import required modules
import { Scrollbar, Pagination, Autoplay, Navigation } from 'swiper/modules'

const Navbar = ({ toggleSidebar }) => {
   const [scrolled, setScrolled] = useState(false);

   // Detect scroll position to change navbar appearance
   useEffect(() => {
      const handleScroll = () => {
         const isScrolled = window.scrollY > 20;
         if (isScrolled !== scrolled) {
            setScrolled(isScrolled);
         }
      };

      window.addEventListener('scroll', handleScroll);
      return () => {
         window.removeEventListener('scroll', handleScroll);
      };
   }, [scrolled]);

   // Banner images for the swiper
   const bannerImages = [
      {
         id: 1,
         src: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1470&auto=format&fit=crop",
         alt: "Fashion collection banner",
         link: "/collections/summer"
      },
      {
         id: 2,
         src: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1471&auto=format&fit=crop",
         alt: "New arrivals banner",
         link: "/new-arrivals"
      },
      {
         id: 3,
         src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1470&auto=format&fit=crop",
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

   return (
      <>
         <section className="relative">
            {/* Navbar - now with fixed position on scroll */}
            <nav className={`${scrolled ? 'fixed' : 'absolute'} top-0 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-8 lg:px-30 py-4 text-white 
                           transition-all duration-300 ease-in-out hover:bg-black/80 cursor-pointer
                           ${scrolled
                  ? 'bg-black/80 backdrop-blur-md py-3 shadow-lg'
                  : 'bg-gradient-to-b from-black/70 to-transparent py-4'}`}>
               {/* Hamburger for mobile */}
               <div className="lg:hidden">
                  <button
                     onClick={toggleSidebar}
                     aria-label="Open menu"
                     className="text-white hover:text-primary-300 transition-all duration-300 hover:scale-110"
                  >
                     <Menu size={24} className={`transform ${scrolled ? 'rotate-0' : 'rotate-0'} transition-transform duration-300`} />
                  </button>
               </div>

               {/* Left menu - hidden on mobile */}
               <div className="hidden lg:flex items-center gap-8">
                  <Link
                     to={"/"}
                     className='text-sm text-white hover:text-primary-300 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary-300 hover:after:w-full after:transition-all after:duration-300 transition-all duration-300'>
                     Shop By Category
                  </Link>
                  <Link
                     to={"/"}
                     className='text-sm text-white hover:text-primary-300 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary-300 hover:after:w-full after:transition-all after:duration-300 transition-all duration-300'>
                     Shop By Collection
                  </Link>
                  <Link
                     to={"/"}
                     className='text-sm text-white hover:text-primary-300 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary-300 hover:after:w-full after:transition-all after:duration-300 transition-all duration-300'>
                     Offers
                  </Link>
               </div>

               {/* Right icons */}
               <div className="flex items-center gap-5">
                  <button className="hidden sm:block text-white hover:text-primary-300 transition-all duration-300 hover:scale-110">
                     <Search size={20} className="transform transition-transform" />
                  </button>
                  <Link to={"/cart"} className="text-white hover:text-primary-300 transition-all duration-300 hover:scale-110 relative group">
                     <ShoppingBag size={20} />
                     <span className="absolute -top-1 -right-1 bg-primary-300 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">0</span>
                  </Link>
                  <Link to={"/sign-in"} className="hidden sm:block text-white hover:text-primary-300 transition-all duration-300 hover:scale-110">
                     <UserRound size={20} />
                  </Link>
               </div>
            </nav>

            {/* Enhanced Swiper with images - now starts from the top */}
            <div className="banner-swiper-container">
               <Swiper
                  scrollbar={{
                     hide: true,
                  }}
                  navigation={true}
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

export default Navbar