import React from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/scrollbar';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
// Import required modules
import { Scrollbar, Pagination, Autoplay, Navigation } from 'swiper/modules';
import ProductCard from '../../components/shared/ProductCard';

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

// Sample product data
const products = [
  {
    id: 1,
    name: "Flamewave Oversized T-Shirt",
    description: "Men's Brown Oversized Cargo Joggers",
    image: [
      "https://picsum.photos/300/400",
      "https://images.unsplash.com/photo-1592513002316-e4fa19175023?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fG1hcnZlbHxlbnwwfHwwfHx8MA%3D%3D",
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
      "https://picsum.photos/300/400",
      "https://images.unsplash.com/photo-1592513002316-e4fa19175023?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fG1hcnZlbHxlbnwwfHwwfHx8MA%3D%3D",
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
      "https://picsum.photos/300/400",
      "https://images.unsplash.com/photo-1592513002316-e4fa19175023?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fG1hcnZlbHxlbnwwfHwwfHx8MA%3D%3D",
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
      "https://picsum.photos/300/400",
      "https://images.unsplash.com/photo-1592513002316-e4fa19175023?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fG1hcnZlbHxlbnwwfHwwfHx8MA%3D%3D",
    ],
    price: {
      current: 999,
      original: 1499,
      discount: 25
    }
  }
];

const Home = () => {
  return (
    <>
      <section className='w-full h-fit relative top-[-30px]'>
        <div className="banner-swiper-container">
          <Swiper
            pagination={{
              clickable: true,
            }}
            navigation={true}
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

      <section className='w-full h-fit relative top-[-30px] px-4 md:px-8'>
        <h1 className='text-3xl font-bold text-center my-10 text-primary-300'>
          NEW ARRIVALS
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="flex items-center justify-center">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;