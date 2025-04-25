import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useFilterProducts } from '../../lib/query/queriesAndMutation';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ProductDataTable from '../../components/common/ProductDataTable';

const AdminCategory = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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

    let mainCategory = '';
    if (slug) {
      const categoryKey = Object.keys(categoryMap).find(
        cat => cat.toLowerCase() === slug.toLowerCase()
      );
      if (categoryKey) {
        mainCategory = categoryKey;
      }
    }

    return {
      page: parseInt(queryParams.get('page')) || 1,
      limit: parseInt(queryParams.get('limit')) || 10,
      priceOrder: queryParams.get('priceOrder') || '',
      size: queryParams.get('size') || '',
      mainCategory: mainCategory,
      subCategory: queryParams.get('subCategory') || ''
    };
  };

  const [filters, setFilters] = useState(getInitialFilters);

  const updateUrlWithFilters = (newFilters) => {
    const queryParams = new URLSearchParams();

    if (newFilters.page > 1) {
      queryParams.set('page', newFilters.page);
    }

    if (newFilters.priceOrder) queryParams.set('priceOrder', newFilters.priceOrder);
    if (newFilters.size) queryParams.set('size', newFilters.size);
    if (newFilters.subCategory) queryParams.set('subCategory', newFilters.subCategory);

    const basePath = '/admin/category';
    const path = newFilters.mainCategory
      ? `${basePath}/${newFilters.mainCategory.toLowerCase()}`
      : basePath;

    const queryString = queryParams.toString();
    const newUrl = queryString ? `${path}?${queryString}` : path;

    navigate(newUrl);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    const newFilters = {
      ...filters,
      [name]: value,
      ...(name === 'mainCategory' ? { subCategory: '' } : {}),
      page: 1
    };

    setFilters(newFilters);
    updateUrlWithFilters(newFilters);
  };

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

      setFilters(prev => {
        const newFilters = { ...prev, page: prev.page + 1 };
        updateUrlWithFilters(newFilters);
        return newFilters;
      });
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  const allProducts = data?.pages?.flatMap(page => page.products) || [];

  return (
    <div className="px-auto py-6">
      <h1 className="text-2xl font-bold mb-5">Filter Products</h1>
      <div className="glass-morphism p-4 rounded-lg shadow-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">
              Price Order
            </label>
            <select
              name="priceOrder"
              value={filters.priceOrder}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md bg-surface text-text border-gray-700 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
            >
              <option value="">Default Order</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">
              Size
            </label>
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
            <label className="block text-sm font-medium text-text-muted mb-1">
              Main Category
            </label>
            <select
              name="mainCategory"
              value={filters.mainCategory}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md bg-surface text-text border-gray-700 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
            >
              <option value="">All Categories</option>
              {Object.keys(categoryMap).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {filters.mainCategory && (
            <div className="md:col-span-2 lg:col-span-1">
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
                {filters.mainCategory && categoryMap[filters.mainCategory]?.map(subCategory => (
                  <option key={subCategory} value={subCategory}>
                    {subCategory}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <ProductDataTable
        products={allProducts}
        isLoading={isLoading}
        isError={isError}
        error={error}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
        onProductAction={(product) => {
          navigate(`/admin/products/${product.slug}`)
        }}
        actionLabel="Edit"
      />
    </div>
  );
};

export default AdminCategory;