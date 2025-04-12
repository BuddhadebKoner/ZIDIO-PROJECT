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

const Home = () => {
  return (
    <>
      {/* Hero is loaded immediately with animation */}
      <div className='pt-8'>
        <Hero />
      </div>

      {/* Other sections load when scrolled into view */}
      <AnimatedSection delay={100}>
        <ExclusiveProduct />
      </AnimatedSection>

      <AnimatedSection delay={150}>
        <NewArivals />
      </AnimatedSection>

      <AnimatedSection delay={200}>
        <ShowAllCollection />
      </AnimatedSection>

      <AnimatedSection delay={250}>
        <ShowByTShirtType />
      </AnimatedSection>

      <AnimatedSection delay={300}>
        <ToHotToMissed />
      </AnimatedSection>

      <AnimatedSection delay={350}>
        <AllTimeBestSeller />
      </AnimatedSection>

      <AnimatedSection delay={400}>
        <WomenCropTops />
      </AnimatedSection>
    </>
  );
};

export default Home;