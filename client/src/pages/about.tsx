import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Users, Heart, Globe, Mail, MapPin } from "lucide-react";
import { Link } from "wouter";
import heroiMG from "../../attached_assets/WhatsApp Image 2025-07-06 at 08.28.25.jpeg"
import {
  BUSINESS,
  // canadaAddressLine,
  nigeriaAddressLine,
} from "@/lib/business-info";

export default function About() {
  const values = [
    {
      icon: Leaf,
      title: "Quality First",
      description: "We source only the finest African foods directly from trusted farms and suppliers across the continent."
    },
    {
      icon: Users,
      title: "Community Focused",
      description: "Built by diaspora, for diaspora. We understand the importance of authentic flavors from home."
    },
    {
      icon: Heart,
      title: "Cultural Connection",
      description: "Every product tells a story of heritage, tradition, and the love that connects us to our roots."
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Delivering authentic African foods worldwide, bridging the gap between home and heritage."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-50 to-emerald-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-6">
              About <span className="text-primary-600">4marketdays</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to connect diaspora communities worldwide with the authentic flavors of Africa. 
              Every ingredient tells a story of home, heritage, and the bonds that unite us across continents.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">Our Story</h2>
              <p className="text-lg sm:text-xl text-slate-600 mb-4 sm:mb-6 leading-relaxed">
                4marketdays was born from a simple desire - to bring the authentic taste of home to African communities living abroad. 
                Founded by diaspora members who understood the challenge of finding quality African foods in foreign lands.
              </p>
              <p className="text-lg sm:text-xl text-slate-600 mb-4 sm:mb-6 leading-relaxed">
                What started as a small initiative to help families access traditional ingredients has grown into a trusted platform 
                serving thousands of customers worldwide. We work directly with farmers and suppliers across Africa to ensure 
                every product meets our high standards for quality and authenticity.
              </p>
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
                Today, we're proud to be the bridge that connects diaspora communities with their culinary heritage, 
                one authentic ingredient at a time. We sell and ship African grocery products to customers in the{" "}
                {BUSINESS.shippingRegions.join(", ")}.
              </p>
            </div>
            <div className="relative">
              <img 
                src={heroiMG}
                alt="African market scene" 
                className="rounded-xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Business Information — required for payment compliance visibility */}
      <section className="py-12 sm:py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Business Information</h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {BUSINESS.name} operates as an online African grocery marketplace. Our contact details and
              operating addresses match the information on our payment merchant profile.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 mb-3">
                <Mail className="h-5 w-5 text-primary-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">Email & Phone</h3>
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">{BUSINESS.email}</p>
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mt-2">{BUSINESS.phones.join(" · ")}</p>
            </div>
            {/* Canada address — commented off
            <div className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 mb-3">
                <MapPin className="h-5 w-5 text-primary-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Canada</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{canadaAddressLine}</p>
            </div>
            */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 mb-3">
                <MapPin className="h-5 w-5 text-primary-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">Nigeria</h3>
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">{nigeriaAddressLine}</p>
            </div>
          </div>
          <p className="text-center text-lg sm:text-xl text-slate-600 mt-8">
            Policies:{" "}
            <Link href="/terms" className="text-primary-600 hover:underline">Terms & Conditions</Link>
            {" · "}
            <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
            {" · "}
            <Link href="/refund" className="text-primary-600 hover:underline">Refund Policy</Link>
            {" · "}
            <Link href="/contact" className="text-primary-600 hover:underline">Contact Us</Link>
          </p>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">Our Values</h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-shadow">
                <CardContent className="p-6 sm:p-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <value.icon className="text-primary-600 h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3 sm:mb-4">{value.title}</h3>
                  <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
