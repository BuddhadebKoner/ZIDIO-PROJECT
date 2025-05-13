import React from 'react';
import ExclusiveProduct from '../../components/HomeSection/ExclusiveProduct';
import NewArivals from '../../components/HomeSection/NewArivals';
import ShowAllCollection from '../../components/HomeSection/ShowAllCollection';
import ShowByTShirtType from '../../components/HomeSection/ShowByTShirtType';
import ToHotToMissed from '../../components/HomeSection/ToHotToMissed';
import AllTimeBestSeller from '../../components/HomeSection/AllTimeBestSeller';
import Hero from '../../components/HomeSection/Hero';
import WomenCropTops from '../../components/HomeSection/WomenCropTops';
import { AnimatedSection } from '../../components/ui/AnimatedSection';
import { useGetHomeContent } from '../../lib/query/queriesAndMutation';
import FullPageLoader from '../../components/loaders/FullPageLoader';

const Home = () => {
  const {
    data: homeContent,
    isLoading,
    isError,
    error,
  } = useGetHomeContent();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <h2 className="text-2xl font-bold text-primary-300 mb-4">Unable to load content</h2>
        <p className="text-gray-400 mb-6">{error?.message || "Please try again later"}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className='pt-8'>
        <Hero bannerImages={homeContent?.heroBannerImages} />
      </div>

      <AnimatedSection delay={100}>
        <ExclusiveProduct products={homeContent?.exclusiveProducts} />
      </AnimatedSection>

      <AnimatedSection delay={150}>
        <NewArivals products={homeContent?.newArrivals} />
      </AnimatedSection>

      <AnimatedSection delay={200}>
        <ShowAllCollection collections={homeContent?.collections} />
      </AnimatedSection>

      <AnimatedSection delay={250}>
        <ShowByTShirtType />
      </AnimatedSection>

      <AnimatedSection delay={300}>
        <ToHotToMissed featured={homeContent?.offerFeatured} />
      </AnimatedSection>

      <AnimatedSection delay={350}>
        <AllTimeBestSeller products={homeContent?.alltimeBestSellers} />
      </AnimatedSection>

      <AnimatedSection delay={400}>
        <WomenCropTops featured={homeContent?.womenFeatured} />
      </AnimatedSection>
    </>
  );
};

export default Home;