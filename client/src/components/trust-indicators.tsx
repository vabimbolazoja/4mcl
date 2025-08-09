import { Leaf, Globe, Award, Headphones } from "lucide-react";

export default function TrustIndicators() {
  const indicators = [
    {
      icon: Leaf,
      title: "Fresh & Organic",
      description: "Sourced directly from trusted African farms"
    },
    {
      icon: Globe,
      title: "Global Delivery",
      description: "Worldwide shipping to diaspora communities"
    },
    {
      icon: Award,
      title: "Quality Certified",
      description: "FDA approved and quality guaranteed"
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Expert customer service always available"
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {indicators.map((indicator, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <indicator.icon className="text-primary-600 h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 sm:mb-2 text-sm sm:text-base">{indicator.title}</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{indicator.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
