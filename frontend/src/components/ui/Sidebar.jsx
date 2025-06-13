import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, UserRound, ChevronDown, ChevronRight, Search, LogOut, User, Settings } from 'lucide-react';
import { categoriesexport, collections, offers, getAvatarUrl } from '../../utils/constant';
import { useAuth } from '../../context/AuthContext';
import ElementLoader from '../loaders/ElementLoader';
import { useClerk } from '@clerk/clerk-react';

const Sidebar = ({ isOpen, onClose }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const { isAuthenticated, currentUser, cartItemsCount, isLoading, isAdmin } = useAuth();
  const { signOut } = useClerk();

  const toggleCategory = (index) => {
    setExpandedCategory(expandedCategory === index ? null : index);
  };

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
    setExpandedCategory(null);
    setShowProfileMenu(false);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    setActiveMenu(null);
    setExpandedCategory(null);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleLinkClick = () => {
    onClose();
    setShowProfileMenu(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-gray-900 text-gray-100 z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-xl font-bold text-primary-300">Menu</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-primary-300 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Search Bar for Mobile */}
        <div className="p-4 border-b border-gray-800">
          <Link
            to="/search/"
            className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg text-gray-300 hover:text-primary-300 hover:bg-gray-700 transition-all"
            onClick={handleLinkClick}
          >
            <Search size={18} />
            <span>Search Products</span>
          </Link>
        </div>

        {/* Profile Section */}
        {isLoading ? (
          <div className="p-4 border-b border-gray-800 flex justify-center">
            <ElementLoader />
          </div>
        ) : isAuthenticated && currentUser ? (
          <div className="border-b border-gray-800">
            <button
              className={`w-full p-4 text-left flex justify-between items-center ${showProfileMenu ? 'bg-gray-800 text-primary-300' : 'text-gray-300 hover:bg-gray-800 hover:text-primary-300'} transition-all`}
              onClick={toggleProfileMenu}
            >
              <div className="flex items-center gap-3">
                {currentUser?.avatar ? (
                  <img
                    src={getAvatarUrl(currentUser.avatar || "IM")}
                    alt={currentUser.fullName || "User Avatar"}
                    className="w-8 h-8 rounded-full object-cover border border-white/20"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                    {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div>
                  <div className="font-medium">{currentUser?.fullName || 'User'}</div>
                  <div className="text-xs text-gray-400">{currentUser?.email || 'No email available'}</div>
                </div>
              </div>
              {showProfileMenu ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>

            {showProfileMenu && (
              <div className="bg-gray-800 px-4 pb-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 py-3 px-2 text-gray-300 hover:text-primary-300 transition-colors"
                  onClick={handleLinkClick}
                >
                  <User size={16} />
                  <span>My Profile</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 py-3 px-2 text-gray-300 hover:text-primary-300 transition-colors"
                    onClick={handleLinkClick}
                  >
                    <Settings size={16} />
                    <span>Dashboard</span>
                  </Link>
                )}
                <Link
                  to="/profile/orders"
                  className="flex items-center gap-3 py-3 px-2 text-gray-300 hover:text-primary-300 transition-colors"
                  onClick={handleLinkClick}
                >
                  <ShoppingBag size={16} />
                  <span>My Orders</span>
                </Link>
                <Link
                  to="/profile/wishlist"
                  className="flex items-center gap-3 py-3 px-2 text-gray-300 hover:text-primary-300 transition-colors"
                  onClick={handleLinkClick}
                >
                  <Settings size={16} />
                  <span>Wishlist</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 py-3 px-2 text-gray-300 hover:text-red-400 transition-colors w-full text-left"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 border-b border-gray-800">
            <Link
              to="/sign-in"
              className="flex items-center gap-3 p-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-medium transition-all"
              onClick={handleLinkClick}
            >
              <UserRound size={18} />
              <span>Sign In / Register</span>
            </Link>
          </div>
        )}

        <div className="flex flex-col">
          {/* Main Navigation Options */}
          <button
            className={`p-4 text-left border-b border-gray-800 flex justify-between items-center ${activeMenu === 'category' ? 'bg-gray-800 text-primary-300' : 'text-gray-300 hover:bg-gray-800 hover:text-primary-300'} transition-all`}
            onClick={() => toggleMenu('category')}
          >
            <span className="font-medium">Shop By Category</span>
            {activeMenu === 'category' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>

          {activeMenu === 'category' && (
            <div className="bg-gray-800 border-b border-gray-700">
              {categoriesexport.map((category, index) => (
                <div key={index}>
                  <button
                    className="w-full text-left px-6 py-3 flex justify-between items-center text-gray-300 hover:text-primary-300 hover:bg-gray-700 transition-all"
                    onClick={() => toggleCategory(index)}
                  >
                    <span>{category.title}</span>
                    {expandedCategory === index ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  {expandedCategory === index && (
                    <div className="pl-8 pb-3">
                      {category.links.map((link, linkIndex) => (
                        <Link
                          key={linkIndex}
                          to={link.path}
                          className="block py-2 text-sm text-gray-400 hover:text-primary-300 hover:pl-2 transition-all"
                          onClick={handleLinkClick}
                        >
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            className={`p-4 text-left border-b border-gray-800 flex justify-between items-center ${activeMenu === 'collection' ? 'bg-gray-800 text-primary-300' : 'text-gray-300 hover:bg-gray-800 hover:text-primary-300'} transition-all`}
            onClick={() => toggleMenu('collection')}
          >
            <span className="font-medium">Shop By Collection</span>
            {activeMenu === 'collection' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>

          {activeMenu === 'collection' && (
            <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex flex-col space-y-3">
              {collections.map((collection, index) => (
                <Link
                  key={index}
                  to={collection.path}
                  className="text-gray-300 hover:text-primary-300 hover:pl-2 transition-all"
                  onClick={handleLinkClick}
                >
                  {collection.title}
                </Link>
              ))}
            </div>
          )}

          <button
            className={`p-4 text-left border-b border-gray-800 flex justify-between items-center ${activeMenu === 'offers' ? 'bg-gray-800 text-primary-300' : 'text-gray-300 hover:bg-gray-800 hover:text-primary-300'} transition-all`}
            onClick={() => toggleMenu('offers')}
          >
            <span className="font-medium">Offers</span>
            {activeMenu === 'offers' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>

          {activeMenu === 'offers' && (
            <div className="bg-gray-800 border-b border-gray-700">
              {offers.map((offerSection, index) => (
                <div key={index}>
                  <button
                    className="w-full text-left px-6 py-3 flex justify-between items-center text-gray-300 hover:text-primary-300 hover:bg-gray-700 transition-all"
                    onClick={() => toggleCategory(`offer-${index}`)}
                  >
                    <span>{offerSection.title}</span>
                    {expandedCategory === `offer-${index}` ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  {expandedCategory === `offer-${index}` && (
                    <div className="pl-8 pb-3">
                      {offerSection.links.map((link, linkIndex) => (
                        <Link
                          key={linkIndex}
                          to={link.path}
                          className="block py-2 text-sm text-gray-400 hover:text-primary-300 hover:pl-2 transition-all"
                          onClick={handleLinkClick}
                        >
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Cart Section */}
          <div className="p-4 mt-4 border-t border-gray-800">
            <Link
              to="/cart"
              className="flex items-center justify-between gap-2 p-3 bg-gray-800 hover:bg-primary-600 rounded-lg text-gray-300 hover:text-white font-medium transition-all"
              onClick={handleLinkClick}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} />
                <span>Shopping Cart</span>
              </div>
              {cartItemsCount > 0 && (
                <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;