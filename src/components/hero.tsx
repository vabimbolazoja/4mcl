import { Button } from "@/components/ui/button";
import { Truck, Shield } from "lucide-react";
import heroiMG from "../../attached_assets/WhatsApp Image 2025-07-06 at 08.28.25.jpeg"
export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary-50 to-emerald-50 py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
              Authentic African Foods{" "}
              <span className="text-primary-600">Delivered to Your Door</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Connect with your heritage through premium African foods. From fresh yams to exotic spices, we bring the authentic taste of home to diaspora communities worldwide.
            </p>
            <div className="flex justify-center lg:justify-start mb-6 sm:mb-8">
              <Button 
                size="lg" 

                className="bg-emerald-600 text-white hover:bg-primary-700 px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => {
                  const productsSection = document.getElementById('products');
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Shop Now
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center">
                <Truck className="text-primary-600 h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                <span className="text-slate-700 font-medium text-sm sm:text-base">Free Shipping $50+</span>
              </div>
              <div className="flex items-center">
                <Shield className="text-primary-600 h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                <span className="text-slate-700 font-medium text-sm sm:text-base">Quality Guaranteed</span>
              </div>
            </div>
          </div>
          <div className="relative order-first lg:order-last">
            <img 
              src={heroiMG}
              alt="African foods display" 
              className="rounded-xl sm:rounded-2xl shadow-2xl w-full h-auto max-h-96 sm:max-h-none object-cover"
            />
            <div className="absolute -bottom-3 -left-3 sm:-bottom-6 sm:-left-6 bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-xl">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 text-lg sm:text-2xl">❤️</span>
                </div>
                <div>
                  <p className="text-slate-900 font-semibold text-sm sm:text-base">10,000+</p>
                  <p className="text-slate-600 text-xs sm:text-sm">Happy Customers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
