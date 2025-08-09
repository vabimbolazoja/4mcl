import { Sprout } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4 sm:mb-6">
              <Sprout className="text-primary-400 h-6 w-6 sm:h-8 sm:w-8 mr-2" />
              <span className="text-xl sm:text-2xl font-bold">4marketdays</span>
            </div>
            <p className="text-slate-300 mb-4 sm:mb-6 max-w-md text-sm sm:text-base leading-relaxed">
              Connecting diaspora communities with authentic African foods. Quality ingredients, delivered worldwide with love and care.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447c0-1.297.49-2.448 1.297-3.323.875-.807 2.026-1.297 3.323-1.297 1.297 0 2.448.49 3.323 1.297.875.875 1.297 2.026 1.297 3.323 0 1.297-.422 2.448-1.297 3.323-.875.807-2.026 1.297-3.323 1.297z"/>
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li><a href="#about" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">About Us</a></li>
              <li><a href="#categories" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">All Products</a></li>
              <li><a href="#categories" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">Categories</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">Special Offers</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">Recipes</a></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Customer Support</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li><a href="#contact" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">Contact Us</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">Shipping Info</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">Returns</a></li>
              <li><a href="#support" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">FAQs</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">Track Order</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-slate-400 text-xs sm:text-sm text-center md:text-left">© 2024 4marketdays. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <a href="#" className="text-slate-400 hover:text-white transition-colors text-xs sm:text-sm">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors text-xs sm:text-sm">Terms of Service</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors text-xs sm:text-sm">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
