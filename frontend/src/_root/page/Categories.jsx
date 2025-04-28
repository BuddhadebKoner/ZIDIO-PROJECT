import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useFilterProducts } from '../../lib/query/queriesAndMutation';
import ProductCard from '../../components/cards/ProductCard';
import { ChevronDown, Filter } from 'lucide-react';

const Categories = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Update categoryMap to match casing in backend
  const categoryMap = {
    "T-shirt": [
      "Oversized", "Acid Wash", "Graphic Printed", "Solid Color",
      "Polo T-Shirts", "Sleeveless", "Long Sleeve", "Henley", "Hooded"
    ],
    "Shirt": [
      "Oversized", "Acid Wash", "Graphic Printed", "Solid Color",
      "Polo T-Shirts", "Sleeveless", "Long Sleeve", "Henley", "Hooded"
    ],
    "Women": [
      "Oversized", "Acid Wash", "Graphic Printed", "Solid Color",
      "Polo T-Shirts", "Sleeveless", "Long Sleeve", "Henley", "Hooded"
    ]
  };

  const getInitialFilters = () => {
    const queryParams = new URLSearchParams(location.search);

    // Improved slug processing
    let mainCategory = '';
    if (slug) {
      // Convert to capitalize first letter to match categoryMap
      const formattedSlug = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();

      // Find in categoryMap with proper case handling
      Object.keys(categoryMap).forEach(cat => {
        if (cat.toLowerCase() === slug.toLowerCase()) {
          mainCategory = cat; // Use the exact case from categoryMap
        }
      });
    }

    return {
      page: parseInt(queryParams.get('page')) || 1,
      limit: parseInt(queryParams.get('limit')) || 12,
      priceOrder: queryParams.get('priceOrder') || '',
      size: queryParams.get('size') || '',
      mainCategory: mainCategory, // Now correctly set with proper casing
      subCategory: queryParams.get('subCategory') || ''
    };
  };

  const [filters, setFilters] = useState(getInitialFilters);

  const updateUrlWithFilters = (newFilters) => {
    const queryParams = new URLSearchParams();

    if (newFilters.page > 1) {
      queryParams.set('page', newFilters.page.toString());
    }

    if (newFilters.limit && newFilters.limit !== 12) {
      queryParams.set('limit', newFilters.limit.toString());
    }

    if (newFilters.priceOrder) queryParams.set('priceOrder', newFilters.priceOrder);
    if (newFilters.size) queryParams.set('size', newFilters.size);
    if (newFilters.subCategory) queryParams.set('subCategory', newFilters.subCategory);

    const basePath = '/category';
    const path = newFilters.mainCategory
      ? `${basePath}/${newFilters.mainCategory.toLowerCase()}`
      : basePath;

    const queryString = queryParams.toString();
    const newUrl = queryString ? `${path}?${queryString}` : path;

    navigate(newUrl);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    // Special handling for mainCategory
    if (name === 'mainCategory') {
      const newFilters = {
        ...filters,
        mainCategory: value,
        subCategory: '', // Reset subcategory when main category changes
        page: 1 // Reset to first page
      };

      setFilters(newFilters);
      updateUrlWithFilters(newFilters);
    } else {
      const newFilters = {
        ...filters,
        [name]: value,
        page: 1 // Reset to first page when filters change
      };

      setFilters(newFilters);
      updateUrlWithFilters(newFilters);
    }
  };

  const handleSortChange = (value) => {
    const newFilters = {
      ...filters,
      priceOrder: value,
      page: 1
    };

    setFilters(newFilters);
    updateUrlWithFilters(newFilters);
    setIsDropdownOpen(false);
  };

  // Update filters when URL params change
  useEffect(() => {
    const newFilters = getInitialFilters();
    setFilters(newFilters);
  }, [location.search, slug]);

  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useFilterProducts(filters);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();

      // Update local state only, don't change URL during infinite scroll
      setFilters(prev => ({
        ...prev,
        page: prev.page + 1
      }));
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  const formatString = (str) => {
    if (!str) return '';
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const allProducts = data?.pages?.flatMap(page => page.products) || [];

  const getSortLabel = () => {
    switch (filters.priceOrder) {
      case 'asc':
        return 'Low to High';
      case 'desc':
        return 'High to Low';
      default:
        return 'Sort by';
    }
  };

  // Get available subcategories based on selected main category
  const getAvailableSubcategories = () => {
    const mainCat = filters.mainCategory || slug;
    if (!mainCat) return [];

    // Find the matching category key (case-insensitive)
    const categoryKey = Object.keys(categoryMap).find(
      key => key.toLowerCase() === mainCat.toLowerCase()
    );

    return categoryKey ? categoryMap[categoryKey] : [];
  };

  return (
    <>
      <div className='flex flex-col justify-center items-center py-4'>
        <h2 className='text-4xl font-semibold text-white mt-20'>
          {slug ? (
            filters.subCategory ?
              `${filters.subCategory} ${formatString(slug)}` :
              formatString(slug)
          ) : 'All Products'}
        </h2>

        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 md:px-8 lg:px-30 mt-8">
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 bg-surface px-4 py-2 rounded-md border border-gray-800 hover:border-gray-700"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <p className="text-gray-400 ml-2">
              {isLoading ? 'Loading...' : `${allProducts.length} products found`}
            </p>
          </div>

          <div className="relative mt-4 sm:mt-0">
            <button
              className="flex items-center gap-2 bg-surface px-4 py-2 rounded-md border border-gray-800 hover:border-gray-700"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="text-gray-200">Price: </span>
              <span className="text-white font-medium">{getSortLabel()}</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-gray-900 border border-gray-800 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${filters.priceOrder === 'asc' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    onClick={() => handleSortChange('asc')}
                  >
                    Low to High
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${filters.priceOrder === 'desc' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                    onClick={() => handleSortChange('desc')}
                  >
                    High to Low
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {isFilterOpen && (
          <div className="w-full px-4 md:px-8 lg:px-30 mt-4">
            <div className="p-4 rounded-lg shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Size</label>
                  <select
                    name="size"
                    value={filters.size}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded-md bg-surface text-text border-gray-700 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  >
                    <option value="">All Sizes</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Main Category</label>
                  <select
                    name="mainCategory"
                    value={filters.mainCategory}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded-md bg-surface text-text border-gray-700 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  >
                    <option value="">All Categories</option>
                    {Object.keys(categoryMap).map(cat => (
                      <option key={cat} value={cat}>{formatString(cat)}</option>
                    ))}
                  </select>
                </div>

                {/* Only show subcategory when a main category is selected */}
                {(filters.mainCategory || slug) && (
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">
                      Sub Category
                    </label>
                    <select
                      name="subCategory"
                      value={filters.subCategory}
                      onChange={handleFilterChange}
                      className="w-full p-2 border rounded-md bg-surface text-text border-gray-700 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                    >
                      <option value="">All Sub Categories</option>
                      {getAvailableSubcategories().map(subCategory => (
                        <option key={subCategory} value={subCategory}>{subCategory}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Add Clear Filter button */}
              <div className="flex justify-end">
                <Link
                  to="/category"
                  className="px-4 py-2 text-white rounded-md transition-colors"
                >
                  Clear Filters
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 md:px-8 lg:px-30 py-4 mt-2">
          {isLoading && allProducts.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : isError ? (
            <div className="text-center py-20">
              <p className="text-red-500">Error loading products. Please try again later.</p>
              <p className="text-gray-400 mt-2">{error?.message}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {allProducts.map(product => (
                  <div key={product._id || product.id} className="w-full">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {allProducts.length === 0 && !isLoading && (
                <div className="text-center py-20">
                  <p className="text-gray-400">No products found. Try changing your filters.</p>
                </div>
              )}

              {hasNextPage && (
                <div ref={ref} className="flex justify-center mt-8">
                  {isFetchingNextPage && (
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Categories;