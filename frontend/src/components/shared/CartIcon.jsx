// CartIcon.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const CartIcon = ({ itemCount }) => {
  return (
    <Link to={"/cart"} className="text-white hover:text-primary-300 transition-all duration-300 hover:scale-110 relative group cursor-pointer">
      <ShoppingBag size={20} />
      <span className="absolute -top-1 -right-1 bg-primary-300 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
        {itemCount}
      </span>
    </Link>
  );
};

export default CartIcon;