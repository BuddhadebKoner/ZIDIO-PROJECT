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
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const AdminSettings = () => {
  const { getToken } = useAuth();

  const [initialLoading, setInitialLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
    const formattedTime = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata'
    });
    return `${formattedDate} ${formattedTime}`;
  };

  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const token = await getToken();
        if (!token) {
          toast.error("You need to be logged in to access this page");
          return;
        }
        const res = await getHomeContent(token);

        if (res?.data?.success) {
          setInitialData(res.data.homeContent);
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

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-fit mt-20">
        <LoaderCircle className="w-10 h-10 animate-spin" />
        <p className="mt-4 text-gray-300">Loading home content settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-16 h-fit">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Home Content Settings</h1>
          <p className="text-gray-400">Customize your homepage sections and featured content</p>
        </div>
        <div className="text-right text-gray-400">
          {initialData?.updatedAt && (
            <p>Last updated at : {formatDateTime(initialData.updatedAt)}</p>
          )}
        </div>
      </div>

      <BannerSection initialBanners={initialData?.heroBannerImages || []} />
      <ExclusiveProductsSection initialProducts={initialData?.exclusiveProducts || []} />
      <NewArrivalsSection initialProducts={initialData?.newArrivals || []} />
      <CollectionsSection initialCollections={initialData?.collections || []} />
      <OfferFeaturedSection initialOffers={initialData?.offerFeatured || []} />
      <BestSellersSection initialBestSeller={initialData?.alltimeBestSellers || []} />
      <WomenFeaturedSection initialProducts={initialData?.womenFeatured || []} />
    </div>
  );
};

export default AdminSettings;