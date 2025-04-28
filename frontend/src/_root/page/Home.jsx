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
    console.error('Error loading home content:', error);
    // Consider adding an error state UI here
  }

  // console.log('Home Content:', homeContent);

  return (
    <>
      {/* Hero is loaded immediately with animation */}
      <div className='pt-8'>
        <Hero bannerImages={homeContent?.heroBannerImages} />
      </div>

      {/* Other sections load when scrolled into view */}
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