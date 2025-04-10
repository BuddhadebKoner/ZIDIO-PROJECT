import React, { useRef, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/scrollbar';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
// Import required modules
import { Scrollbar, Pagination, Autoplay, Navigation, FreeMode, Thumbs } from 'swiper/modules';
import ProductCard from '../../components/cards/ProductCard';
import ProductOnlyImageCard from '../../components/cards/ProductOnlyImageCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCardByType from '../../components/cards/ProductCardByType';
import OfferFeaturedCard from '../../components/cards/OfferFeaturedCard';

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
      "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
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
      "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
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
      "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
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
      "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
    ],
    price: {
      current: 999,
      original: 1499,
      discount: 25
    }
  },
  {
    id: 1,
    name: "Flamewave Oversized T-Shirt",
    description: "Men's Brown Oversized Cargo Joggers",
    image: [
      "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
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
      "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
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
      "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
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
      "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
    ],
    price: {
      current: 999,
      original: 1499,
      discount: 25
    }
  },
];

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

const productTypeShowcase = [
  {
    id: 1,
    type: "Relaxed Fit",
    image: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    link: "/collections/relaxed-fit"
  },
  {
    id: 2,
    type: "Oversize Fit",
    image: "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    link: "/collections/casual-wear"
  },
  {
    id: 3,
    type: "Full Sleeves",
    image: "https://images.unsplash.com/photo-1620336655052-b57986f5a26a?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    link: "/collections/formal-wear"
  },
  {
    id: 4,
    type: "Sleeveless",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1474&auto=format&fit=crop",
    link: "/collections/accessories"
  }
]

const productOffers = [
  {
    id: 1,
    title: "SUMMER READY",
    subTitle: "PRINTED SHIRT",
    discount: 50,
    endDate: "2025-04-15T00:00:00.000+00:00",
    imageUrl: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 2,
    title: "WINTER SALE",
    subTitle: "JACKETS",
    discount: 30,
    endDate: "2025-05-01T00:00:00.000+00:00",
    imageUrl: "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    title: "SPRING COLLECTION",
    subTitle: "NEW ARRIVALS",
    discount: 20,
    endDate: "2025-06-15T00:00:00.000+00:00",
    imageUrl: "https://images.unsplash.com/photo-1620336655052-b57986f5a26a?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 4,
    title: "FALL FASHION",
    subTitle: "ACCESSORIES",
    discount: 40,
    endDate: "2025-07-01T00:00:00.000+00:00",
    imageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1474&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "SUMMER READY",
    subTitle: "PRINTED SHIRT",
    discount: 50,
    endDate: "2025-04-15T00:00:00.000+00:00",
    imageUrl: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  }
]


const Home = () => {

  const productsSwiperRef = useRef(null);
  const offersRef = useRef(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

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
                    className="w-full h-[300px] md:h-[400px] lg:h-[800px] object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* products */}
      <section className='w-full h-fit relative px-4 md:px-80 py-5'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-semibold text-white'>Excusive Products</h2>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => productsSwiperRef.current?.slidePrev()}
              className="bg-surface hover:bg-primary-500 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors duration-300"
              aria-label="Previous products"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => productsSwiperRef.current?.slideNext()}
              className="bg-surface hover:bg-primary-500 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors duration-300"
              aria-label="Next products"
            >
              <ChevronRight size={20} />
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
            // Mobile first approach
            0: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            480: {
              slidesPerView: 2,
              spaceBetween: 15,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 15,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
          }}
        >
          {products.map((product, index) => (
            <SwiperSlide key={`${product.id}-${index}`}>
              <ProductOnlyImageCard
                product={product}
                onPrevious={() => productsSwiperRef.current?.slidePrev()}
                onNext={() => productsSwiperRef.current?.slideNext()}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* new arivals */}
      <section className='w-full h-fit relative px-4 md:px-8'>
        <div className='flex flex-col items-center justify-center py-10 gap-2'>
          <h1 className='text-3xl font-normal text-center text-primary-300 letter-spacing-wide'>
            NEW ARRIVALS
          </h1>
          <p className='text-center text-gray-500'>
            MARVEL 2025
          </p>
          <p className='text-center text-gray-500'>
            Warrior's Favourites have made a
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="flex items-center justify-center">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* explore more */}
        <div className='flex items-center justify-center mt-10'>
          <button className='bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition duration-300'>
            Explore More
          </button>
        </div>
      </section>


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

      {/* show by type */}
      <section className='w-full h-fit relative px-4 md:px-8 py-20'>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {productTypeShowcase.map((productType) => (
            <ProductCardByType
              key={productType.id}
              product={productType}
            />
          ))}
        </div>
      </section>

      {/* TOO HOT TO BE MISSED */}
      <section className='w-full h-fit relative px-4 md:px-8 py-5'>
        <h1 className='text-3xl font-normal text-center text-primary-300 letter-spacing-wide'>
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
          {productOffers.map((offer) => (
            <SwiperSlide key={offer.id}>
              <OfferFeaturedCard product={offer} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </>
  );
};

export default Home;