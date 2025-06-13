import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import FullPageLoader from '../../components/loaders/FullPageLoader';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import WishlistProductCard from '../../components/cards/WishlistProductCard';

const AccountWishlist = () => {
  const { currentUser, isLoading } = useAuth();
  const [wishlist] = useState(currentUser?.wishlist || []);

  // console.log('wishlist', wishlist);

  if (isLoading) {
    return <FullPageLoader />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">My Wishlist</h1>
        <p className="text-text-muted text-sm sm:text-base">
          {wishlist?.length > 0 
            ? `${wishlist.length} item${wishlist.length !== 1 ? 's' : ''} saved for later`
            : 'Your saved items will appear here'
          }
        </p>
      </div>

      {wishlist?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map(product => (
            <WishlistProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-morphism rounded-lg">
          <div className="mb-6">
            <Heart size={80} className="mx-auto text-primary-400 opacity-70" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-semibold mb-3 text-text">Your wishlist is empty</h2>
          <p className="text-text-muted mb-6 max-w-md mx-auto">Add items to your wishlist to save them for later or share them with friends.</p>
          <Link to="/category" className="btn-primary inline-block">
            Explore Products
          </Link>
        </div>
      )}
    </div>
  )
}

export default AccountWishlist