import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpCircle, Package, Truck, RefreshCw, CreditCard, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('');

  const supportCategories = [
    {
      icon: Package,
      title: "Orders & Products",
      description: "Questions about placing orders, product availability, and specifications",
      articles: 12
    },
    {
      icon: Truck,
      title: "Shipping & Delivery",
      description: "Shipping times, tracking orders, and delivery information",
      articles: 8
    },
    {
      icon: RefreshCw,
      title: "Returns & Exchanges",
      description: "Return policy, exchange process, and refund information",
      articles: 6
    },
    {
      icon: CreditCard,
      title: "Payment & Billing",
      description: "Payment methods, billing issues, and invoice questions",
      articles: 5
    },
    {
      icon: HelpCircle,
      title: "Account Help",
      description: "Account setup, password reset, and profile management",
      articles: 7
    },
    {
      icon: MessageCircle,
      title: "Contact Support",
      description: "Get in touch with our customer service team",
      articles: 3
    }
  ];

  const popularArticles = [
    {
      title: "How to track my order?",
      category: "Shipping",
      readTime: "2 min read"
    },
    {
      title: "What payment methods do you accept?",
      category: "Payment",
      readTime: "1 min read"
    },
    {
      title: "How to return or exchange items?",
      category: "Returns",
      readTime: "3 min read"
    },
    {
      title: "International shipping information",
      category: "Shipping",
      readTime: "4 min read"
    },
    {
      title: "Creating and managing your account",
      category: "Account",
      readTime: "2 min read"
    },
    {
      title: "Product authenticity guarantee",
      category: "Products",
      readTime: "3 min read"
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
              Support <span className="text-primary-600">Center</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Find answers to common questions, get help with your orders, or contact our support team. 
              We're here to make your experience with authentic African foods seamless.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 rounded-lg border-2 border-slate-200 focus:border-primary-600 text-base"
                />
                <Button className="absolute right-2 top-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Categories */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">How can we help you?</h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Browse our help categories to find the information you need
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {supportCategories.map((category, index) => (
              <Card key={index} className="group cursor-pointer hover:shadow-xl transition-shadow">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-primary-200 transition-colors">
                    <category.icon className="text-primary-600 h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">{category.title}</h3>
                  <p className="text-slate-600 text-sm sm:text-base mb-3 sm:mb-4 leading-relaxed">{category.description}</p>
                  <p className="text-primary-600 text-sm font-medium">{category.articles} articles</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">Popular Articles</h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Quick answers to the most common questions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {popularArticles.map((article, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <span className="inline-block px-3 py-1 bg-primary-100 text-primary-600 text-xs font-medium rounded-full">
                      {article.category}
                    </span>
                    <span className="text-slate-500 text-xs sm:text-sm">{article.readTime}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 hover:text-primary-600 transition-colors">
                    {article.title}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support CTA */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-primary-600 to-emerald-600 rounded-2xl p-8 sm:p-12 text-white">
            <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Still need help?</h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90 leading-relaxed">
              Can't find what you're looking for? Our support team is ready to help you with any questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-primary-600 hover:bg-slate-50 px-6 sm:px-8 py-3 font-semibold">
                Contact Support
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600 px-6 sm:px-8 py-3 font-semibold">
                Live Chat
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}