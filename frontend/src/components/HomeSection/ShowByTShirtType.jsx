import React from 'react'
import { Link } from 'react-router-dom'
import ProductCardByType from '../cards/ProductCardByType'

const ShowByTShirtType = () => {
   const productTypeShowcase = [
      {
         id: 1,
         type: "Relaxed Fit",
         image: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
         link: "/categories/t-shirts/relaxed-fitt"
      },
      {
         id: 2,
         type: "Oversize Fit",
         image: "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
         link: "/categories/t-shirts/casual-wear"
      },
      {
         id: 3,
         type: "Full Sleeves",
         image: "https://images.unsplash.com/photo-1620336655052-b57986f5a26a?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
         link: "/categories/t-shirts/formal-wear"
      },
      {
         id: 4,
         type: "Sleeveless",
         image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1474&auto=format&fit=crop",
         link: "/categories/t-shirts/accessories"
      }
   ]

   return (
      <>
         {/* show by type */}
         <section className='w-full h-fit relative px-4 md:px-8 py-20'>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {productTypeShowcase.map((productType) => (
                  <Link
                     to={productType.link}
                     key={productType.id}
                  >
                     <ProductCardByType
                        key={productType.id}
                        product={productType}
                     />
                  </Link>
               ))}
            </div>
         </section>

      </>
   )
}

export default ShowByTShirtType