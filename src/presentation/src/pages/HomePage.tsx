import React from 'react';
import { Box } from '@chakra-ui/react';
import Hero from '../components/Home/Hero';
import WhyChooseUs from '../components/Home/WhyChooseUs';
import PopularCourses from '../components/Home/PopularCourses';
import TrendingTopics from '../components/Home/TrendingTopics';
import Testimonials from '../components/Home/Testimonials';
import StatsCounter from '../components/Home/StatsCounter';
import Newsletter from '../components/Home/Newsletter';
import CallToAction from '../components/Home/CallToAction';

const HomePage: React.FC = () => {
  return (
    <Box>
      <Hero />
      <WhyChooseUs />
      <PopularCourses />
      <TrendingTopics />
      <StatsCounter />
      <Testimonials />
      <Newsletter />
      <CallToAction />
    </Box>
  );
};

export default HomePage; 