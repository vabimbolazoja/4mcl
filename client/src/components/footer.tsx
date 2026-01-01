import { Sprout } from "lucide-react";
import { useState, useContext } from "react";
import Logo from "../../attached_assets/logoSvg.svg"
import { Link, useLocation, useSearch } from "wouter";
import { Modal } from "antd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { GlobalStateContext } from "../context/globalContext";
import trackService from "../services/track-order"
export default function Footer() {
  const [openModal, setOpenModal] = useState(false)
  const [trackOrderOpen, setOpenTrackOrder] = useState(false)
  const [order_ref, setOrderRef] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [location,setLocation] = useLocation()
  const { toast } = useToast();
  const { origin, setOrigin } = useContext(GlobalStateContext);


  const trackOrder = () => {
    setOpenModal(true)
  }

  const onTrakc = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = await trackService.trackOrder(order_ref);
      if (result) {
        console.log(result)
        setIsLoading(false)
        setOrderRef("")
        setOrigin((prevState) => ({
          ...prevState,
          trackOrders: result
        }));
        setTimeout(() => {
          setLocation('/track-order')
        },500)
        setOpenModal(false)
      }
      else {
        setIsLoading(false)
        setOpenModal(false)
        toast({
          title: "Login failed",
          description: result?.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setIsLoading(false)
      setOpenModal(false)
      toast({
        title: "Login failed",
        description: err?.response?.data?.message,
        variant: "destructive",
      });
    }
  }


  return (
    <footer className="bg-slate-900 text-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4 sm:mb-6">
              <span className="text-xl sm:text-2xl font-bold">
                <Link href="/" className="flex-shrink-0 flex items-center">
                  <span className="text-xl sm:text-2xl font-bold text-slate-900">
                    <img src={Logo} />
                  </span>
                </Link>
              </span>
            </div>
            <p className="text-slate-300 mb-4 sm:mb-6 max-w-md text-sm sm:text-base leading-relaxed">
              Connecting diaspora communities with authentic African foods. Quality ingredients, delivered worldwide with love and care.
            </p>
            <div className="flex space-x-4">
              <a href="https://web.facebook.com/4marketdays?_rdc=1&_rdr#" target="_blank"  className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            
              <a href="https://www.instagram.com/4_market_days" target="_blank" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447c0-1.297.49-2.448 1.297-3.323.875-.807 2.026-1.297 3.323-1.297 1.297 0 2.448.49 3.323 1.297.875.875 1.297 2.026 1.297 3.323 0 1.297-.422 2.448-1.297 3.323-.875.807-2.026 1.297-3.323 1.297z" />
                </svg>
              </a>
              
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li><a href="/about" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">About Us</a></li>
              <li><a href="/products" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">All Products</a></li>
              <li><a href="/categories" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">Categories</a></li>
              <li onClick={trackOrder}><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">Track my Order</a></li>

            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Customer Support</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li><a href="/contact" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">Contact Us</a></li>
              <li><a href="/contact" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">FAQs</a></li>
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

      <Modal
        title="Track Your Order"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={openModal}
        footer={false}
        onCancel={() => setOpenModal(false)}
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
            Order Reference
          </label>
          <Input
            id="text"
            name="text"
            type="text"
            value={order_ref}
            onChange={(e) => setOrderRef(e?.target?.value)}
            required
            className="w-full"
            placeholder="Input your order reference number"
          />
        </div>
        <br />
        <Button
          type="submit"
          onClick={onTrakc}
          disabled={isLoading}
          className="w-full bg-emerald-600 text-white hover:bg-emerald-700 py-3 font-semibold shadow-lg"
        >
          {isLoading ? "Tracking..." : 'Track'}
        </Button>
      </Modal>

  
    </footer>
  );
}
