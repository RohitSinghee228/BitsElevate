import Banner from '../components/Home/Banner'
import BecomeInstructor from '../components/Home/BecomeInstructor'
import BitsElevateForBusiness from '../components/Home/BitsElevateForBusiness'
import Feature1 from '../components/Home/Featured/Feature1'
import Feature2 from '../components/Home/Featured/Feature2'
import FillerDiv from '../components/Home/FillerDiv'
import Swiper from '../components/Home/Courses/Swiper'
import Modern3DWhyChooseUs from '../components/Home/SimpleWhyChooseUs'
import Modern3DPopularCourses from '../components/Home/SimplePopularCourses'
import Modern3DTestimonials from '../components/Home/SimpleTestimonials'
import Modern3DStatsCounter from '../components/Home/SimpleStatsCounter'
import Modern3DNewsletter from '../components/Home/SimpleNewsletter'
import Modern3DCallToAction from '../components/Home/SimpleCallToAction'

export default function Home() {
  return (
    <div>
      <Banner />
      <Modern3DWhyChooseUs />
      <Modern3DPopularCourses />
      <Feature1 />
      <Modern3DStatsCounter />
      <FillerDiv />
      <Swiper />
      <Modern3DTestimonials />
      <BecomeInstructor />
      <Modern3DNewsletter />
      <BitsElevateForBusiness />
      <Modern3DCallToAction />
      <Feature2 />
    </div>
  )
}
