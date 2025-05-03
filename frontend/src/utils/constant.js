export const avatars = [
   {
      id: 1,
      name: 'IM',
      url: 'https://res.cloudinary.com/db4jch8sj/image/upload/v1744524375/IM_tjtzqd.png',
   },
   {
      id: 2,
      name: 'BW',
      url: 'https://res.cloudinary.com/db4jch8sj/image/upload/v1744524380/BW_z9m0rt.png',
   },
   {
      id: 3,
      name: 'CA',
      url: 'https://res.cloudinary.com/db4jch8sj/image/upload/v1744524377/CA_ti8tsm.png',
   },
   {
      id: 4,
      name: 'SM',
      url: 'https://res.cloudinary.com/db4jch8sj/image/upload/v1744524376/SM_m3yerj.png',
   },
];


// Find avatar name by URL if available
export const getAvatarUrl = (avatarName) => {
   const avatar = avatars.find((avatar) => avatar.name === avatarName);
   return avatar ? avatar.url : null;
};


// Same data as in NavbarDropdown for consistency
export const categoriesexport = [
   {
      title: "T-SHIRTS",
      links: [
         { name: "Oversized", path: "/category/t-shirt?subCategory=Oversized" },
         { name: "Acid Wash", path: "/category/t-shirt?subCategory=Acid+Wash" },
         { name: "Graphic Printed", path: "/category/t-shirt?subCategory=Graphic+Printed" },
         { name: "Solid Color", path: "/category/t-shirt?subCategory=Solid+Color" },
         { name: "Polo T-Shirts", path: "/category/t-shirt?subCategory=Polo+T-Shirts" },
         { name: "Sleeveless", path: "/category/t-shirt?subCategory=Sleeveless" },
         { name: "Long Sleeve", path: "/category/t-shirt?subCategory=Long+Sleeve" },
         { name: "Henley", path: "/category/t-shirt?subCategory=Henley" },
         { name: "Hooded", path: "/category/t-shirt?subCategory=Hooded" }
      ]
   },
   {
      title: "SHIRTS",
      links: [
         { name: "Oversized", path: "/category/shirt?subCategory=Oversized" },
         { name: "Acid Wash", path: "/category/shirt?subCategory=Acid+Wash" },
         { name: "Graphic Printed", path: "/category/shirt?subCategory=Graphic+Printed" },
         { name: "Solid Color", path: "/category/shirt?subCategory=Solid+Color" },
         { name: "Polo T-Shirts", path: "/category/shirt?subCategory=Polo+T-Shirts" },
         { name: "Sleeveless", path: "/category/shirt?subCategory=Sleeveless" },
         { name: "Long Sleeve", path: "/category/shirt?subCategory=Long+Sleeve" },
         { name: "Henley", path: "/category/shirt?subCategory=Henley" },
         { name: "Hooded", path: "/category/shirt?subCategory=Hooded" }
      ]
   },
   {
      title: "WOMEN",
      links: [
         { name: "Oversized", path: "/category/women?subCategory=Oversized" },
         { name: "Acid Wash", path: "/category/women?subCategory=Acid+Wash" },
         { name: "Graphic Printed", path: "/category/women?subCategory=Graphic+Printed" },
         { name: "Solid Color", path: "/category/women?subCategory=Solid+Color" },
         { name: "Polo T-Shirts", path: "/category/women?subCategory=Polo+T-Shirts" },
         { name: "Sleeveless", path: "/category/women?subCategory=Sleeveless" },
         { name: "Long Sleeve", path: "/category/women?subCategory=Long+Sleeve" },
         { name: "Henley", path: "/category/women?subCategory=Henley" },
         { name: "Hooded", path: "/category/women?subCategory=Hooded" }
      ]
   },
   {
      title: "WINTER WEAR",
      links: [
         { name: "Sweatshirt", path: "/category/winter-wear?subCategory=Sweatshirt" },
      ]
   }
];

export const collections = [
   {
      title: "MARVEL 2025",
      path: "/collections/marvel-collections"
   },
   {
      title: "DC 2025",
      path: "/collections/dc-2025/"
   },
   {
      title: "STAR WARS",
      path: "/collections/star-wars/"
   },
   {
      title: "HARRY POTTER",
      path: "/collections/harry-potter/"
   }
];

export const offers = [
   {
      title: "DISCOUNTS",
      links: [
         { name: "Clearance Sale", path: "/offers/clearance-sale" },
         { name: "Buy 1 Get 1", path: "/offers/buy-one-get-one" },
         { name: "Seasonal Offers", path: "/offers/seasonal" },
      ]
   },
   {
      title: "SPECIAL DEALS",
      links: [
         { name: "Student Discounts", path: "/offers/student" },
         { name: "Membership Benefits", path: "/offers/membership" },
         { name: "Flash Sale", path: "/offers/flash-sale" },
      ]
   }
];