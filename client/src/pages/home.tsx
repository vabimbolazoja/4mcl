import Header from "@/components/header";
import Hero from "@/components/hero";
import TrustIndicators from "@/components/trust-indicators";
import ProductCategories from "@/components/product-categories";
import FeaturedProducts from "@/components/featured-products";
import Testimonials from "@/components/testimonials";
import Newsletter from "@/components/newsletter";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <TrustIndicators />
      <ProductCategories />
      <FeaturedProducts />
      <Testimonials />
      <Footer />
    </div>
  );
}
