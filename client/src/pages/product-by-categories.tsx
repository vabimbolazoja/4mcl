import Header from "@/components/header";
import FeaturedProducts from "@/components/productsbyCategory";
import Footer from "@/components/footer";

export default function Products() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <FeaturedProducts />
      <Footer />
    </div>
  );
}
