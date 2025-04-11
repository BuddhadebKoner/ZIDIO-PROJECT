import React, { useState, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import ProductCard from '../../components/cards/ProductCard';
import { ChevronDown } from 'lucide-react';

const Categories = () => {
  // grab type from url
  const { type, category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get sort option from URL or default to 'default'
  const sortOption = searchParams.get('sort_by') || 'default';

  const formatString = (str) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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
      id: 5,
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
      id: 6,
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
      id: 7,
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
      id: 8,
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


  // Sort products based on URL parameter
  const sortedProducts = useMemo(() => {
    switch (sortOption) {
      case 'price-ascending':
        return [...products].sort((a, b) => a.price.current - b.price.current);
      case 'price-descending':
        return [...products].sort((a, b) => b.price.current - a.price.current);
      default:
        return products;
    }
  }, [products, sortOption]);

  // Update URL when sort option changes
  const handleSortChange = (value) => {
    setSearchParams({ sort_by: value });
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className='flex flex-col justify-center items-center py-10'>
        <h1 className='text-4xl font-semibold text-white mt-10'>
          {formatString(type)}{" "} {category.charAt(0).toUpperCase() + category.slice(1)}
        </h1>

        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 md:px-8 lg:px-30">
          <p className="text-gray-400">
            {products.length} products found
          </p>

          <div className="relative">
            <button
              className="flex items-center gap-2 bg-surface px-4 py-2 rounded-md border border-gray-800 hover:border-gray-700"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="text-gray-200">Price: </span>
              <span className="text-white font-medium">
                {sortOption === 'price-ascending' && 'Low to High'}
                {sortOption === 'price-descending' && 'High to Low'}
                {sortOption === 'default' && 'Sort by'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-gray-900 border border-gray-800 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${sortOption === 'price-ascending' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    onClick={() => handleSortChange('price-ascending')}
                  >
                    Low to High
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${sortOption === 'price-descending' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    onClick={() => handleSortChange('price-descending')}
                  >
                    High to Low
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map(product => (
              <div key={product.id} className="w-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Categories