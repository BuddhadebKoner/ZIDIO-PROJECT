import React from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, UserRound } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden ${
          isOpen ? 'block' : 'hidden'
        }`} 
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-gray-100 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-xl font-bold text-primary-300">Menu</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-primary-300 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4 flex flex-col gap-4">
          <Link 
            to={"/"} 
            className='text-gray-300 hover:text-primary-300 font-medium transition-colors'
            onClick={onClose}
          >
            Shop By Category
          </Link>
          <Link 
            to={"/"} 
            className='text-gray-300 hover:text-primary-300 font-medium transition-colors'
            onClick={onClose}
          >
            Shop By Collection
          </Link>
          <Link 
            to={"/"} 
            className='text-gray-300 hover:text-primary-300 font-medium transition-colors'
            onClick={onClose}
          >
            Offers
          </Link>
          <hr className="border-gray-700" />
          <Link 
            to={"/sign-in"} 
            className='text-gray-300 hover:text-primary-300 font-medium flex items-center gap-2 transition-colors'
            onClick={onClose}
          >
            <UserRound size={18} />
            <span>Account</span>
          </Link>
          <Link 
            to={"/cart"} 
            className='text-gray-300 hover:text-primary-300 font-medium flex items-center gap-2 transition-colors'
            onClick={onClose}
          >
            <ShoppingBag size={18} />
            <span>Cart</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;