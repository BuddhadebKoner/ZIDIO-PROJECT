import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductOnlyImageCard from '../cards/ProductOnlyImageCard'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/scrollbar';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
// Import required modules
import {
   Pagination,
   Navigation,
} from 'swiper/modules';

const WomenCropTops = () => {
   const womenSectionRef = useRef(null);

   const womenSection = [
      {
         "_id": "6807758ad97cecc47bba9960",
         "slug": "arc-reactor",
         "title": "Arc Reactor",
         "subTitle": "Arc Reactor (Glow In The Dark) - Marvel Official Hoodie",
         "description": "The artwork will be screen printed to perfection on a premium Redwolf branded brushed fleece hoodie featuring kangaroo pockets, drawstrings and a hood.",
         "price": 999,
         "images": [
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319108/e-commerce/products/bhgpiebtko1zw6xjckzu.webp",
               "imageId": "e-commerce/products/bhgpiebtko1zw6xjckzu",
               "_id": "6807758ad97cecc47bba9961"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319116/e-commerce/products/phqepkkrjhvlrjahbflx.webp",
               "imageId": "e-commerce/products/phqepkkrjhvlrjahbflx",
               "_id": "6807758ad97cecc47bba9962"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319126/e-commerce/products/lxdtcqayg4uy2f6gptch.webp",
               "imageId": "e-commerce/products/lxdtcqayg4uy2f6gptch",
               "_id": "6807758ad97cecc47bba9963"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319135/e-commerce/products/g1ojyqzdcggjp52knixk.webp",
               "imageId": "e-commerce/products/g1ojyqzdcggjp52knixk",
               "_id": "6807758ad97cecc47bba9964"
            }
         ],
         "bannerImageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319147/e-commerce/products/hfrml7rfkbd0jro7vxhs.jpg",
         "bannerImageId": "e-commerce/products/hfrml7rfkbd0jro7vxhs",
         "size": [
            "S"
         ],
         "tags": [
            "shirt",
            "marvel",
            "superman"
         ],
         "technologyStack": [
            "3d texture"
         ],
         "productModelLink": "https://www.redwolf.in",
         "isUnderPremium": true,
         "isExcusiveProducts": true,
         "isNewArrival": false,
         "isUnderHotDeals": false,
         "isBestSeller": false,
         "isWomenFeatured": false,
         "isMenFeatured": false,
         "isFeaturedToBanner": false,
         "isTrendingNow": false,
         "categories": [
            {
               "main": "T-shirt",
               "sub": "Acid Wash",
               "path": "/t-shirt/acid-wash",
               "_id": "6807758ad97cecc47bba9965"
            }
         ],
         "collections": [
            "68077634d97cecc47bba9972",
            "68077bd3d97cecc47bba9a02",
            "680b12d898c02627baee504b"
         ],
         "offer": null,
         "createdAt": "2025-04-22T10:55:06.930Z",
         "updatedAt": "2025-04-25T04:43:04.500Z",
         "__v": 0
      },
      {
         "_id": "6807758ad97cecc47bba9960",
         "slug": "arc-reactor",
         "title": "Arc Reactor",
         "subTitle": "Arc Reactor (Glow In The Dark) - Marvel Official Hoodie",
         "description": "The artwork will be screen printed to perfection on a premium Redwolf branded brushed fleece hoodie featuring kangaroo pockets, drawstrings and a hood.",
         "price": 999,
         "images": [
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319108/e-commerce/products/bhgpiebtko1zw6xjckzu.webp",
               "imageId": "e-commerce/products/bhgpiebtko1zw6xjckzu",
               "_id": "6807758ad97cecc47bba9961"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319116/e-commerce/products/phqepkkrjhvlrjahbflx.webp",
               "imageId": "e-commerce/products/phqepkkrjhvlrjahbflx",
               "_id": "6807758ad97cecc47bba9962"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319126/e-commerce/products/lxdtcqayg4uy2f6gptch.webp",
               "imageId": "e-commerce/products/lxdtcqayg4uy2f6gptch",
               "_id": "6807758ad97cecc47bba9963"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319135/e-commerce/products/g1ojyqzdcggjp52knixk.webp",
               "imageId": "e-commerce/products/g1ojyqzdcggjp52knixk",
               "_id": "6807758ad97cecc47bba9964"
            }
         ],
         "bannerImageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319147/e-commerce/products/hfrml7rfkbd0jro7vxhs.jpg",
         "bannerImageId": "e-commerce/products/hfrml7rfkbd0jro7vxhs",
         "size": [
            "S"
         ],
         "tags": [
            "shirt",
            "marvel",
            "superman"
         ],
         "technologyStack": [
            "3d texture"
         ],
         "productModelLink": "https://www.redwolf.in",
         "isUnderPremium": true,
         "isExcusiveProducts": true,
         "isNewArrival": false,
         "isUnderHotDeals": false,
         "isBestSeller": false,
         "isWomenFeatured": false,
         "isMenFeatured": false,
         "isFeaturedToBanner": false,
         "isTrendingNow": false,
         "categories": [
            {
               "main": "T-shirt",
               "sub": "Acid Wash",
               "path": "/t-shirt/acid-wash",
               "_id": "6807758ad97cecc47bba9965"
            }
         ],
         "collections": [
            "68077634d97cecc47bba9972",
            "68077bd3d97cecc47bba9a02",
            "680b12d898c02627baee504b"
         ],
         "offer": null,
         "createdAt": "2025-04-22T10:55:06.930Z",
         "updatedAt": "2025-04-25T04:43:04.500Z",
         "__v": 0
      },
      {
         "_id": "6807758ad97cecc47bba9960",
         "slug": "arc-reactor",
         "title": "Arc Reactor",
         "subTitle": "Arc Reactor (Glow In The Dark) - Marvel Official Hoodie",
         "description": "The artwork will be screen printed to perfection on a premium Redwolf branded brushed fleece hoodie featuring kangaroo pockets, drawstrings and a hood.",
         "price": 999,
         "images": [
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319108/e-commerce/products/bhgpiebtko1zw6xjckzu.webp",
               "imageId": "e-commerce/products/bhgpiebtko1zw6xjckzu",
               "_id": "6807758ad97cecc47bba9961"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319116/e-commerce/products/phqepkkrjhvlrjahbflx.webp",
               "imageId": "e-commerce/products/phqepkkrjhvlrjahbflx",
               "_id": "6807758ad97cecc47bba9962"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319126/e-commerce/products/lxdtcqayg4uy2f6gptch.webp",
               "imageId": "e-commerce/products/lxdtcqayg4uy2f6gptch",
               "_id": "6807758ad97cecc47bba9963"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319135/e-commerce/products/g1ojyqzdcggjp52knixk.webp",
               "imageId": "e-commerce/products/g1ojyqzdcggjp52knixk",
               "_id": "6807758ad97cecc47bba9964"
            }
         ],
         "bannerImageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319147/e-commerce/products/hfrml7rfkbd0jro7vxhs.jpg",
         "bannerImageId": "e-commerce/products/hfrml7rfkbd0jro7vxhs",
         "size": [
            "S"
         ],
         "tags": [
            "shirt",
            "marvel",
            "superman"
         ],
         "technologyStack": [
            "3d texture"
         ],
         "productModelLink": "https://www.redwolf.in",
         "isUnderPremium": true,
         "isExcusiveProducts": true,
         "isNewArrival": false,
         "isUnderHotDeals": false,
         "isBestSeller": false,
         "isWomenFeatured": false,
         "isMenFeatured": false,
         "isFeaturedToBanner": false,
         "isTrendingNow": false,
         "categories": [
            {
               "main": "T-shirt",
               "sub": "Acid Wash",
               "path": "/t-shirt/acid-wash",
               "_id": "6807758ad97cecc47bba9965"
            }
         ],
         "collections": [
            "68077634d97cecc47bba9972",
            "68077bd3d97cecc47bba9a02",
            "680b12d898c02627baee504b"
         ],
         "offer": null,
         "createdAt": "2025-04-22T10:55:06.930Z",
         "updatedAt": "2025-04-25T04:43:04.500Z",
         "__v": 0
      },
      {
         "_id": "6807758ad97cecc47bba9960",
         "slug": "arc-reactor",
         "title": "Arc Reactor",
         "subTitle": "Arc Reactor (Glow In The Dark) - Marvel Official Hoodie",
         "description": "The artwork will be screen printed to perfection on a premium Redwolf branded brushed fleece hoodie featuring kangaroo pockets, drawstrings and a hood.",
         "price": 999,
         "images": [
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319108/e-commerce/products/bhgpiebtko1zw6xjckzu.webp",
               "imageId": "e-commerce/products/bhgpiebtko1zw6xjckzu",
               "_id": "6807758ad97cecc47bba9961"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319116/e-commerce/products/phqepkkrjhvlrjahbflx.webp",
               "imageId": "e-commerce/products/phqepkkrjhvlrjahbflx",
               "_id": "6807758ad97cecc47bba9962"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319126/e-commerce/products/lxdtcqayg4uy2f6gptch.webp",
               "imageId": "e-commerce/products/lxdtcqayg4uy2f6gptch",
               "_id": "6807758ad97cecc47bba9963"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319135/e-commerce/products/g1ojyqzdcggjp52knixk.webp",
               "imageId": "e-commerce/products/g1ojyqzdcggjp52knixk",
               "_id": "6807758ad97cecc47bba9964"
            }
         ],
         "bannerImageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319147/e-commerce/products/hfrml7rfkbd0jro7vxhs.jpg",
         "bannerImageId": "e-commerce/products/hfrml7rfkbd0jro7vxhs",
         "size": [
            "S"
         ],
         "tags": [
            "shirt",
            "marvel",
            "superman"
         ],
         "technologyStack": [
            "3d texture"
         ],
         "productModelLink": "https://www.redwolf.in",
         "isUnderPremium": true,
         "isExcusiveProducts": true,
         "isNewArrival": false,
         "isUnderHotDeals": false,
         "isBestSeller": false,
         "isWomenFeatured": false,
         "isMenFeatured": false,
         "isFeaturedToBanner": false,
         "isTrendingNow": false,
         "categories": [
            {
               "main": "T-shirt",
               "sub": "Acid Wash",
               "path": "/t-shirt/acid-wash",
               "_id": "6807758ad97cecc47bba9965"
            }
         ],
         "collections": [
            "68077634d97cecc47bba9972",
            "68077bd3d97cecc47bba9a02",
            "680b12d898c02627baee504b"
         ],
         "offer": null,
         "createdAt": "2025-04-22T10:55:06.930Z",
         "updatedAt": "2025-04-25T04:43:04.500Z",
         "__v": 0
      },
      {
         "_id": "6807758ad97cecc47bba9960",
         "slug": "arc-reactor",
         "title": "Arc Reactor",
         "subTitle": "Arc Reactor (Glow In The Dark) - Marvel Official Hoodie",
         "description": "The artwork will be screen printed to perfection on a premium Redwolf branded brushed fleece hoodie featuring kangaroo pockets, drawstrings and a hood.",
         "price": 999,
         "images": [
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319108/e-commerce/products/bhgpiebtko1zw6xjckzu.webp",
               "imageId": "e-commerce/products/bhgpiebtko1zw6xjckzu",
               "_id": "6807758ad97cecc47bba9961"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319116/e-commerce/products/phqepkkrjhvlrjahbflx.webp",
               "imageId": "e-commerce/products/phqepkkrjhvlrjahbflx",
               "_id": "6807758ad97cecc47bba9962"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319126/e-commerce/products/lxdtcqayg4uy2f6gptch.webp",
               "imageId": "e-commerce/products/lxdtcqayg4uy2f6gptch",
               "_id": "6807758ad97cecc47bba9963"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319135/e-commerce/products/g1ojyqzdcggjp52knixk.webp",
               "imageId": "e-commerce/products/g1ojyqzdcggjp52knixk",
               "_id": "6807758ad97cecc47bba9964"
            }
         ],
         "bannerImageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319147/e-commerce/products/hfrml7rfkbd0jro7vxhs.jpg",
         "bannerImageId": "e-commerce/products/hfrml7rfkbd0jro7vxhs",
         "size": [
            "S"
         ],
         "tags": [
            "shirt",
            "marvel",
            "superman"
         ],
         "technologyStack": [
            "3d texture"
         ],
         "productModelLink": "https://www.redwolf.in",
         "isUnderPremium": true,
         "isExcusiveProducts": true,
         "isNewArrival": false,
         "isUnderHotDeals": false,
         "isBestSeller": false,
         "isWomenFeatured": false,
         "isMenFeatured": false,
         "isFeaturedToBanner": false,
         "isTrendingNow": false,
         "categories": [
            {
               "main": "T-shirt",
               "sub": "Acid Wash",
               "path": "/t-shirt/acid-wash",
               "_id": "6807758ad97cecc47bba9965"
            }
         ],
         "collections": [
            "68077634d97cecc47bba9972",
            "68077bd3d97cecc47bba9a02",
            "680b12d898c02627baee504b"
         ],
         "offer": null,
         "createdAt": "2025-04-22T10:55:06.930Z",
         "updatedAt": "2025-04-25T04:43:04.500Z",
         "__v": 0
      },
      {
         "_id": "6807758ad97cecc47bba9960",
         "slug": "arc-reactor",
         "title": "Arc Reactor",
         "subTitle": "Arc Reactor (Glow In The Dark) - Marvel Official Hoodie",
         "description": "The artwork will be screen printed to perfection on a premium Redwolf branded brushed fleece hoodie featuring kangaroo pockets, drawstrings and a hood.",
         "price": 999,
         "images": [
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319108/e-commerce/products/bhgpiebtko1zw6xjckzu.webp",
               "imageId": "e-commerce/products/bhgpiebtko1zw6xjckzu",
               "_id": "6807758ad97cecc47bba9961"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319116/e-commerce/products/phqepkkrjhvlrjahbflx.webp",
               "imageId": "e-commerce/products/phqepkkrjhvlrjahbflx",
               "_id": "6807758ad97cecc47bba9962"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319126/e-commerce/products/lxdtcqayg4uy2f6gptch.webp",
               "imageId": "e-commerce/products/lxdtcqayg4uy2f6gptch",
               "_id": "6807758ad97cecc47bba9963"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319135/e-commerce/products/g1ojyqzdcggjp52knixk.webp",
               "imageId": "e-commerce/products/g1ojyqzdcggjp52knixk",
               "_id": "6807758ad97cecc47bba9964"
            }
         ],
         "bannerImageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319147/e-commerce/products/hfrml7rfkbd0jro7vxhs.jpg",
         "bannerImageId": "e-commerce/products/hfrml7rfkbd0jro7vxhs",
         "size": [
            "S"
         ],
         "tags": [
            "shirt",
            "marvel",
            "superman"
         ],
         "technologyStack": [
            "3d texture"
         ],
         "productModelLink": "https://www.redwolf.in",
         "isUnderPremium": true,
         "isExcusiveProducts": true,
         "isNewArrival": false,
         "isUnderHotDeals": false,
         "isBestSeller": false,
         "isWomenFeatured": false,
         "isMenFeatured": false,
         "isFeaturedToBanner": false,
         "isTrendingNow": false,
         "categories": [
            {
               "main": "T-shirt",
               "sub": "Acid Wash",
               "path": "/t-shirt/acid-wash",
               "_id": "6807758ad97cecc47bba9965"
            }
         ],
         "collections": [
            "68077634d97cecc47bba9972",
            "68077bd3d97cecc47bba9a02",
            "680b12d898c02627baee504b"
         ],
         "offer": null,
         "createdAt": "2025-04-22T10:55:06.930Z",
         "updatedAt": "2025-04-25T04:43:04.500Z",
         "__v": 0
      },
      {
         "_id": "6807758ad97cecc47bba9960",
         "slug": "arc-reactor",
         "title": "Arc Reactor",
         "subTitle": "Arc Reactor (Glow In The Dark) - Marvel Official Hoodie",
         "description": "The artwork will be screen printed to perfection on a premium Redwolf branded brushed fleece hoodie featuring kangaroo pockets, drawstrings and a hood.",
         "price": 999,
         "images": [
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319108/e-commerce/products/bhgpiebtko1zw6xjckzu.webp",
               "imageId": "e-commerce/products/bhgpiebtko1zw6xjckzu",
               "_id": "6807758ad97cecc47bba9961"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319116/e-commerce/products/phqepkkrjhvlrjahbflx.webp",
               "imageId": "e-commerce/products/phqepkkrjhvlrjahbflx",
               "_id": "6807758ad97cecc47bba9962"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319126/e-commerce/products/lxdtcqayg4uy2f6gptch.webp",
               "imageId": "e-commerce/products/lxdtcqayg4uy2f6gptch",
               "_id": "6807758ad97cecc47bba9963"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319135/e-commerce/products/g1ojyqzdcggjp52knixk.webp",
               "imageId": "e-commerce/products/g1ojyqzdcggjp52knixk",
               "_id": "6807758ad97cecc47bba9964"
            }
         ],
         "bannerImageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319147/e-commerce/products/hfrml7rfkbd0jro7vxhs.jpg",
         "bannerImageId": "e-commerce/products/hfrml7rfkbd0jro7vxhs",
         "size": [
            "S"
         ],
         "tags": [
            "shirt",
            "marvel",
            "superman"
         ],
         "technologyStack": [
            "3d texture"
         ],
         "productModelLink": "https://www.redwolf.in",
         "isUnderPremium": true,
         "isExcusiveProducts": true,
         "isNewArrival": false,
         "isUnderHotDeals": false,
         "isBestSeller": false,
         "isWomenFeatured": false,
         "isMenFeatured": false,
         "isFeaturedToBanner": false,
         "isTrendingNow": false,
         "categories": [
            {
               "main": "T-shirt",
               "sub": "Acid Wash",
               "path": "/t-shirt/acid-wash",
               "_id": "6807758ad97cecc47bba9965"
            }
         ],
         "collections": [
            "68077634d97cecc47bba9972",
            "68077bd3d97cecc47bba9a02",
            "680b12d898c02627baee504b"
         ],
         "offer": null,
         "createdAt": "2025-04-22T10:55:06.930Z",
         "updatedAt": "2025-04-25T04:43:04.500Z",
         "__v": 0
      },
      {
         "_id": "6807758ad97cecc47bba9960",
         "slug": "arc-reactor",
         "title": "Arc Reactor",
         "subTitle": "Arc Reactor (Glow In The Dark) - Marvel Official Hoodie",
         "description": "The artwork will be screen printed to perfection on a premium Redwolf branded brushed fleece hoodie featuring kangaroo pockets, drawstrings and a hood.",
         "price": 999,
         "images": [
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319108/e-commerce/products/bhgpiebtko1zw6xjckzu.webp",
               "imageId": "e-commerce/products/bhgpiebtko1zw6xjckzu",
               "_id": "6807758ad97cecc47bba9961"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319116/e-commerce/products/phqepkkrjhvlrjahbflx.webp",
               "imageId": "e-commerce/products/phqepkkrjhvlrjahbflx",
               "_id": "6807758ad97cecc47bba9962"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319126/e-commerce/products/lxdtcqayg4uy2f6gptch.webp",
               "imageId": "e-commerce/products/lxdtcqayg4uy2f6gptch",
               "_id": "6807758ad97cecc47bba9963"
            },
            {
               "imageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319135/e-commerce/products/g1ojyqzdcggjp52knixk.webp",
               "imageId": "e-commerce/products/g1ojyqzdcggjp52knixk",
               "_id": "6807758ad97cecc47bba9964"
            }
         ],
         "bannerImageUrl": "https://res.cloudinary.com/db4jch8sj/image/upload/v1745319147/e-commerce/products/hfrml7rfkbd0jro7vxhs.jpg",
         "bannerImageId": "e-commerce/products/hfrml7rfkbd0jro7vxhs",
         "size": [
            "S"
         ],
         "tags": [
            "shirt",
            "marvel",
            "superman"
         ],
         "technologyStack": [
            "3d texture"
         ],
         "productModelLink": "https://www.redwolf.in",
         "isUnderPremium": true,
         "isExcusiveProducts": true,
         "isNewArrival": false,
         "isUnderHotDeals": false,
         "isBestSeller": false,
         "isWomenFeatured": false,
         "isMenFeatured": false,
         "isFeaturedToBanner": false,
         "isTrendingNow": false,
         "categories": [
            {
               "main": "T-shirt",
               "sub": "Acid Wash",
               "path": "/t-shirt/acid-wash",
               "_id": "6807758ad97cecc47bba9965"
            }
         ],
         "collections": [
            "68077634d97cecc47bba9972",
            "68077bd3d97cecc47bba9a02",
            "680b12d898c02627baee504b"
         ],
         "offer": null,
         "createdAt": "2025-04-22T10:55:06.930Z",
         "updatedAt": "2025-04-25T04:43:04.500Z",
         "__v": 0
      },
   ]

   return (
      <>
         {/* crop tops */}
         <section className='w-full h-fit relative py-5'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10'>
               <h1 className='text-2xl sm:text-3xl font-bold text-center text-primary-300 mt-10 sm:mt-20 mb-6 sm:mb-10'>
                  YOU WANT THESE to "Crops Tops"
               </h1>
               <div className='flex items-center justify-between mb-6'>
                  <h2 className='text-xl sm:text-2xl font-semibold text-white'>Women Section</h2>
                  <div className='flex items-center gap-2 sm:gap-3'>
                     <button
                        onClick={() => womenSectionRef.current?.slidePrev()}
                        className="bg-surface hover:bg-primary-500 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                        aria-label="Previous products"
                     >
                        <ChevronLeft size={18} className="sm:hidden" />
                        <ChevronLeft size={20} className="hidden sm:block" />
                     </button>
                     <button
                        onClick={() => womenSectionRef.current?.slideNext()}
                        className="bg-surface hover:bg-primary-500 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white transition-colors duration-300"
                        aria-label="Next products"
                     >
                        <ChevronRight size={18} className="sm:hidden" />
                        <ChevronRight size={20} className="hidden sm:block" />
                     </button>
                  </div>
               </div>

               <Swiper
                  onSwiper={(swiper) => { womenSectionRef.current = swiper }}
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
                  {womenSection.map((product, index) => (
                     <SwiperSlide key={`${product.id}-${index}`}>
                        <ProductOnlyImageCard
                           product={product}
                           onPrevious={() => womenSectionRef.current?.slidePrev()}
                           onNext={() => womenSectionRef.current?.slideNext()}
                        />
                     </SwiperSlide>
                  ))}
               </Swiper>
            </div>
         </section>
      </>
   )
}

export default WomenCropTops