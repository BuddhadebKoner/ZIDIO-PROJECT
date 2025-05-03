import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, UserRound, ChevronDown, ChevronRight } from 'lucide-react';
import { categoriesexport, collections, offers } from '../../utils/constant';

const Sidebar = ({ isOpen, onClose }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const [activeMenu, setActiveMenu] = useState(null);

  const toggleCategory = (index) => {
    setExpandedCategory(expandedCategory === index ? null : index);
  };

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
    setExpandedCategory(null);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden ${isOpen ? 'block' : 'hidden'
          }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-gray-900 text-gray-100 z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-xl font-bold text-primary-300">Menu</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-primary-300 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col">
          {/* Main Navigation Options */}
          <button
            className={`p-4 text-left border-b border-gray-800 flex justify-between items-center ${activeMenu === 'category' ? 'bg-gray-800 text-primary-300' : 'text-gray-300'}`}
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
                    className="w-full text-left px-6 py-3 flex justify-between items-center text-gray-300 hover:text-primary-300"
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
                          className="block py-2 text-sm text-gray-400 hover:text-primary-300"
                          onClick={onClose}
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
            className={`p-4 text-left border-b border-gray-800 flex justify-between items-center ${activeMenu === 'collection' ? 'bg-gray-800 text-primary-300' : 'text-gray-300'}`}
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
                  className="text-gray-300 hover:text-primary-300"
                  onClick={onClose}
                >
                  {collection.title}
                </Link>
              ))}
            </div>
          )}

          <button
            className={`p-4 text-left border-b border-gray-800 flex justify-between items-center ${activeMenu === 'offers' ? 'bg-gray-800 text-primary-300' : 'text-gray-300'}`}
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
                    className="w-full text-left px-6 py-3 flex justify-between items-center text-gray-300 hover:text-primary-300"
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
                          className="block py-2 text-sm text-gray-400 hover:text-primary-300"
                          onClick={onClose}
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

          <div className="p-4 space-y-4 mt-4 border-t border-gray-800">
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
      </div>
    </>
  );
};

export default Sidebar;