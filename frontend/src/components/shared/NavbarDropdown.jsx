import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const NavbarDropdown = ({ dropdownData, type = 'category' }) => {
   const [scrolled, setScrolled] = useState(false);

   // Default data if not provided
   const defaultcategory = [
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

   const defaultCollections = [
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

   const defaultOffers = [
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

   // Select data based on dropdown type
   let displayData;
   switch (type) {
      case 'collection':
         displayData = dropdownData || defaultCollections;
         break;
      case 'offers':
         displayData = dropdownData || defaultOffers;
         break;
      default:
         displayData = dropdownData || defaultcategory;
   }

   return (
      <div className='fixed top-25 left-0 right-0 w-full h-auto glass-morphism   py-8 z-30'>
         <div className='container mx-auto px-8'>
            <div className='grid grid-cols-4 gap-8 max-w-6xl mx-auto'>
               {type === 'collection' ? (
                  // Render collection items (title only with direct path)
                  displayData.map((collection, index) => (
                     <div key={index} className="flex flex-col gap-4">
                        <Link
                           to={collection.path}
                           className="text-white font-bold text-base hover:text-primary-300 transition-all"
                        >
                           {collection.title}
                        </Link>
                     </div>
                  ))
               ) : (
                  // Render category and offers with nested links
                  displayData.map((section, index) => (
                     <div key={index} className="flex flex-col gap-4">
                        <h3 className="text-white font-bold text-base mb-2 border-b border-white/10 pb-2">
                           {section.title}
                        </h3>
                        <div className="flex flex-col gap-3">
                           {section.links.map((link, linkIndex) => (
                              <Link
                                 key={linkIndex}
                                 to={link.path}
                                 className="text-gray-300 text-sm hover:text-primary-300 transition-all"
                              >
                                 {link.name}
                              </Link>
                           ))}
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>
   );
};

export default NavbarDropdown;