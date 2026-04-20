import { useEffect, useState, useContext } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Sprout, Search, ShoppingCart, Menu, X } from "lucide-react";
import Logo from "../../attached_assets/logoSvg.svg"
import { Modal } from "antd";
import { useCart } from '../context/cartContext';
import { GlobalStateContext } from "../context/globalContext";
import { useUserCountry } from "@/hooks/useCountryLocatiom";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useLocation();
  const { origin, setOrigin } = useContext(GlobalStateContext);
  const [defaultModal, setDefaultModal] = useState(true)
  const actalUsercountry = localStorage?.getItem('user_country')


  // Cart item count state - will be connected to real cart later
  const { state, clearCart } = useCart();
  const cartItemCount = state?.items?.length


  const navItemsAuth = [
    { label: "Categories", href: "/categories" },
    { label: "Products", href: "/products" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Change Shopping Location", href: "shop-location" },
    { label: "My Orders", href: "/orders" },
    { label: "Store Location", href: "/store-locations" },

  ];

  const navItems = !sessionStorage?.getItem('4mttoken') ? [
    { label: "Categories", href: "/categories" },
    { label: "Products", href: "/products" },
    { label: "About", href: "/about" },
    { label: "Change Shopping Location", href: "shop-location" },
    { label: "Contact", href: "/contact" },
    { label: "Store Location", href: "/store-locations" },

  ] : navItemsAuth;


  const { country, loading } = useUserCountry();

  useEffect(() => {
    if (actalUsercountry)
    localStorage.setItem("user_country", actalUsercountry);
    setOrigin((prevState) => ({
      ...prevState,
      sourceOrigin: actalUsercountry === "US" ? "0" : actalUsercountry === "NG" ? "1" : actalUsercountry === "CA" ? "3" : actalUsercountry === "GB" ? "2" : "",
    }));
  }, [actalUsercountry])



  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50" style={{ cursor: 'pointer' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl sm:text-2xl font-bold text-slate-900">
                <img src={Logo} />
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" style={{ cursor: 'pointer' }}>
            {navItems.map((item) => (
              item.href.startsWith('/#') ? (
                <a
                  key={item.label}

                  href={item.href}
                  className="text-slate-700 hover:text-primary-600 font-medium transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <div>
                  {item?.href === 'shop-location' ? <div onClick={() => {
                    setOrigin((prevState) => ({
                      ...prevState,
                      sourceOrigin: ""
                    }));
                  }}

                  > {item?.label}</div> :
                    <Link
                      key={item.label}
                      href={item.href}
                      className="text-slate-700 hover:text-primary-600 font-medium transition-colors"
                    >
                      {item.label}
                    </Link>}
                </div>
              )
            ))}
          </nav>



          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="text-slate-700 hover:text-primary-600 relative p-2">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />

                <sup className=" text-xs" style={{ color: 'green' }}>
                  {cartItemCount}
                </sup>

              </Button>
            </Link>
            {!sessionStorage?.getItem('4mttoken') &&
              <div className="hidden sm:flex items-center space-x-2">

                <Link href="/login">
                  <Button variant="ghost" className="text-slate-700 hover:text-primary-600 text-sm px-3 py-2">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary-600 text-white hover:bg-primary-700 text-sm px-4 py-2">
                    Register
                  </Button>
                </Link>
              </div>}
            {sessionStorage?.getItem('4mttoken') &&
              <div className="hidden sm:flex items-center space-x-2">
                <div style={{ fontWeight: '800' }}>
                  <i className="fa fa-user-circle pr-1" style={{ color: '#10b981', }} />{" "} {sessionStorage.getItem('username')}
                </div>
                <div style={{ cursor: 'pointer', color: 'red' }} onClick={() => {
                  sessionStorage.clear()
                  setLocation("/login")
                }}>Log out <i className="fa fa-sign-out"></i></div>
              </div>
            }

            {/* Mobile Menu Button */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems?.map((item) => (
                    item.href.startsWith('/#') ? (
                      <a
                        key={item.label}
                        href={item.href}
                        style={{ whiteSpace: 'nowrap' }}
                        className="text-slate-700 hover:text-primary-600 font-medium transition-colors py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </a>
                    ) : (

                      <div>
                        {item?.href === 'shop-location' ? <div onClick={() => {
                          setOrigin((prevState) => ({
                            ...prevState,
                            sourceOrigin: ""
                          }));
                        }}

                        > {item?.label}</div> :
                          <Link
                            key={item.label}
                            href={item.href}
                            style={{ whiteSpace: 'nowrap' }}
                            className="text-slate-700 hover:text-primary-600 font-medium transition-colors"
                          >
                            {item.label}
                          </Link>}
                      </div>
                    )
                  ))}
                  <Link href="/cart">

                    <div style={{ display: 'flex' }}>
                      My cart <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />

                      <sup className=" text-xs" style={{ color: 'green' }}>
                        {cartItemCount}
                      </sup>

                    </div>
                  </Link>
                  {!sessionStorage?.getItem('4mttoken') &&
                    <div className="space-y-3 mt-4">
                      <Link href="/login">
                        <Button variant="ghost" className="text-slate-700 hover:text-primary-600 w-full">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/register">
                        <Button className="bg-primary-600 text-white hover:bg-primary-700 w-full">
                          Register
                        </Button>
                      </Link>
                    </div>}
                  {sessionStorage?.getItem('4mttoken') &&
                    <>
                      <div style={{ fontWeight: '800' }}>
                        <i className="fa fa-user-circle pr-1" style={{ color: '#10b981' }} />{" "}{sessionStorage.getItem('username')}
                      </div>
                      <div style={{ cursor: 'pointer', color: 'red' }} onClick={() => {
                        sessionStorage.clear()
                        setLocation("/login")
                      }}>Log out <i className="fa fa-sign-out"></i></div>
                    </>

                  }
                </div>
              </SheetContent>
            </Sheet>

            <Modal
              title=""
              open={origin.sourceOrigin === "" ? true : false}
              footer={false}
              width={500}
              maskClosable={false}
            >
              <div>
                <div className="d-flex justify-content-center py-3">
                  <div>
                    <div>
                      <h2 className="text-xl font-bold text-center">
                        Where are you Shopping from ?
                      </h2>
                    </div>
                    <p className="text-center pt-3">Please kindly indicate where you are shopping from so we can serve you well.</p>
                    <br />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Button
                        type="submit"
                        className=" bg-emerald-600 text-white hover:bg-emerald-700 py-3 font-semibold shadow-lg"
                        onClick={() => {
                          setOrigin((prevState) => ({
                            ...prevState,
                            sourceOrigin: "0",
                          }));

                        }}
                      >
                        USA
                      </Button>
                      <Button
                        type="submit"
                        className=" bg-emerald-600 text-white hover:bg-emerald-700 py-3 font-semibold shadow-lg"
                        onClick={() => {
                          setOrigin((prevState) => ({
                            ...prevState,
                            sourceOrigin: "2",
                          }));

                        }}
                      >
                        United Kingdom
                      </Button>
                      <Button
                        type="submit"
                        className=" bg-emerald-600 text-white hover:bg-emerald-700 py-3 font-semibold shadow-lg"
                        onClick={() => {
                          setOrigin((prevState) => ({
                            ...prevState,
                            sourceOrigin: "3",
                          }));

                        }}
                      >
                        Canada
                      </Button>
                      <Button
                        type="submit"
                        className="w bg-emerald-600 text-white hover:bg-emerald-700 py-3 font-semibold shadow-lg"
                        onClick={() => {
                          setOrigin((prevState) => ({
                            ...prevState,
                            sourceOrigin: "1",
                          }));



                        }}
                      >
                        Nigeria
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Modal>

            <Modal
              title=""
              open={defaultModal}
              footer={false}
              width={500}
              maskClosable={false}
              onCancel={() => {
                setDefaultModal(false)
              }}
            >
              <div className="d-flex justify-content-center py-3">
                <div>
                  <div>
                    <h2 className="text-xl font-bold text-center">
                      Shopping Location
                    </h2>
                  </div>
                  <p className="text-center pt-3">We can see you are shopping form {country || "Detecting"}</p>

                  <br />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Button
                      type="submit"
                      className=" bg-emerald-600 text-white hover:bg-emerald-700 py-3 font-semibold shadow-lg"
                      onClick={() => {
                        setDefaultModal(false)
                        setOrigin((prevState) => ({
                          ...prevState,
                          sourceOrigin: country === "US" ? "0" : country === "NG" ? "1" : country === "CA" ? "3" : country === "GB" ? "2" : "",
                        }));

                      }}
                    >
                      Confirm Location
                    </Button>
                    <Button
                      type="submit"
                      className=" bg-emerald-600 text-white hover:bg-emerald-700 py-3 font-semibold shadow-lg"
                      onClick={() => {
                        setDefaultModal(false)
                        setOrigin((prevState) => ({
                          ...prevState,
                          sourceOrigin: "",
                        }));

                      }}
                    >
                      Change Location
                    </Button>

                  </div>
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </header>
  );
}
