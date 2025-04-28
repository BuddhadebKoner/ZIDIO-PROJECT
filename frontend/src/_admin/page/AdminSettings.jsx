import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import BannerSection from './sections/BannerSection.jsx';
import ExclusiveProductsSection from './sections/ExclusiveProductsSection.jsx';
import NewArrivalsSection from './sections/NewArrivalsSection.jsx';
import CollectionsSection from './sections/CollectionsSection.jsx';
import OfferFeaturedSection from './sections/OfferFeaturedSection.jsx';
import BestSellersSection from './sections/BestSellersSection.jsx';
import WomenFeaturedSection from './sections/WomenFeaturedSection.jsx';
import { getHomeContent } from '../../lib/api/admin.api.js';

const AdminSettings = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const res = await getHomeContent();

        // console.log('Response:', res.data.homeContent.collections);

        if (res?.data?.success) {
          setInitialData(res.data.homeContent);
          // console.log('Initial data:', res.data.homeContent);
        } else {
          toast.error(res?.data?.message || "Failed to load home content settings");
        }
        setInitialLoading(false);
      } catch (error) {
        console.error("Error fetching home content:", error);
        toast.error("Failed to load home content settings");
        setInitialLoading(false);
      }
    };

    fetchHomeContent();
  }, []);

  // Loading overlay for initial data fetch
  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-300">Loading home content settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-16">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Home Content Settings</h1>
        <p className="text-gray-400">Customize your homepage sections and featured content</p>
      </div>

      {/* Banner Information */}
      <BannerSection initialBanners={initialData.heroBannerImages} />

      {/* Exclusive Products */}
      <ExclusiveProductsSection initialProducts={initialData.exclusiveProducts} />

      {/* New Arrivals */}
      <NewArrivalsSection initialProducts={initialData.newArrivals} />

      {/* Featured Collection */}
      <CollectionsSection initialCollections={initialData.collections} />

      {/* Offer Featured */}
      <OfferFeaturedSection initialOffers={initialData.offerFeatured} />

      {/* Best Sellers */}
      <BestSellersSection initialBestSeller={initialData.alltimeBestSellers} />

      {/* Women Featured */}
      <WomenFeaturedSection initialProducts={initialData.womenFeatured} />
    </div>
  );
};

export default AdminSettings;