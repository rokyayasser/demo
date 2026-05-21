

// Components
import Header from "../components/home/Header";
import StatsSection from "../components/home/StatsSection";
import WhyChooseUs from "../components/home/WhyChooseUs";
import ConsultationsSection from "../components/home/ConsultationsSection";
import CoursesSection from "../components/home/CoursesSection";
import ProductsSection from "../components/home/ProductsSection";
import BlogsSection from "../components/home/BlogsSection";
import CTA from "../components/home/CTA";
import Banner from "../components/home/Banner";
import Testimonials from "../components/home/Testimonials";
import LatestVideos from "../components/home/LatestVideos";
import SocialSection from "../components/home/SocialSection";

const Home = () => {


  return (
    <div
      className="overflow-hidden"
    >
      <Header />
      <StatsSection/>
      <WhyChooseUs/>
      <LatestVideos/>
      <ConsultationsSection/>
      <CoursesSection/>
      <ProductsSection/>
      <BlogsSection/>
      <Testimonials/>
      <SocialSection/>
      <div className="md:mt-20">
        <CTA/>
      </div>
      {/* <Banner/> */}
 
    </div>
  );
};

export default Home;
