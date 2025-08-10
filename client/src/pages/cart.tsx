import { useState } from "react";
import { Link, useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from '../context/cartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Location from "../components/Location/index"
import paymentService from "../services/payment-service"
import { Radio } from 'antd'
export default function Cart() {
  // Sample cart items for demonstration
  const { state, clearCart, incrementItem, decrementItem, removeItem } = useCart();
  const [openPaymentDetails, setOpenPaymentDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [guestForm, setGuestForm] = useState(false)
  const [location, setLocation] = useLocation();
  const [addObj, setAddObj] = useState({})
  const { toast } = useToast();
  const [radioValue, setRadioValue] = useState(1);
  const style = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  };
  const onChange = (e) => {
    setRadioValue(e.target.value);
  };
  const [formData, setFormData] = useState({
    email: '',
    deliveryAddress: '',
    fullName: sessionStorage?.getItem('4mtfname') ? sessionStorage?.getItem('4mtfname') : "",
    phone: ""
  });
  const [guestData, setGuestData] = useState({
    email: '',
    deliveryAddress: '',
    fullName: "",
    phone: ""
  });
  const total = state.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleInputChangeGuest = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const cartItems = state?.items;

  const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD');

  const updateQuantityDecrease = (id: number) => {
    decrementItem(id)
  };

  const updateQuantityIncrease = (id: number) => {
    incrementItem(id)
  };

  const removeItemUpdate = (id: number) => {
    removeItem(id)
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = currency === 'USD' ? parseFloat(item.priceUsd) : parseFloat(item.priceNaira);
      return total + (price * item.quantity);
    }, 0);
  };

  const formatPrice = (priceUsd: string, priceNgn: string) => {
    if (currency === 'USD') {
      return `$${priceUsd}`;
    }
    return `₦${priceNgn}`;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-24 w-24 text-slate-300 mb-6" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">Your cart is empty</h1>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any authentic African foods to your cart yet.
              Start exploring our amazing selection!
            </p>
            <Link href="/">
              <Button className="bg-emerald-600 text-white hover:bg-emerald-700 px-8 py-3 shadow-lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  const handleSubmitGuest = (e) => {
    e.preventDefault()
    if (radioValue === 1) {
      setGuestForm(true)
    }
    else if (radioValue === 2) {
      setLocation("/login")
    }
    else if (radioValue === 3) {
      setLocation("/register")
    }
    else {
      window.location.href = "/"
    }
  }

  const proceedPayment = () => {
    setOpenPaymentDetails(true)
  }

  const handleGuestPay = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const deliveryInfo = {
      name: guestData?.fullName,
      email: guestData?.email,
      phone: guestData?.phone,
      address: guestData?.deliveryAddress ? guestData?.deliveryAddress : "USA",
    }

    const data = {
      deliveryInfo: deliveryInfo,
      user_id: '6895cd9fb97e7a9fe487d6e1',
      user_email: 'olisa57@mailinator.com',
      currency: currency,
      orders: cartItems?.map((d) => ({
        prod_id: d?._id,
        prod_name: d?.name,
        moq: d?.moq,
        image: d?.imageUrls[0],
        price: currency === 'USD' ? d?.priceUsd : d?.priceNaira,
        qty: d?.quantity,
        subtotal: d?.quantity * (currency === 'USD' ? d?.priceUsd : d?.priceNaira),
      })),
      totalAmt: calculateTotal(),
      paymentType: currency
    }
    try {
      const result = await paymentService.initiate(data);
      if (result) {
        setIsLoading(false)
        toast({
          title: "Checkout",
          description: result?.message,
        });
        setTimeout(() => {
          window.location.href = result.paystack.data?.authorization_url;

        }, 1400)
      }
      else {
        setIsLoading(false)
        toast({
          title: "Checkout",
          description: result?.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setIsLoading(false)
      toast({
        title: "Checkout",
        description: err?.response?.data?.message,
        variant: "destructive",
      });
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const deliveryInfo = {
      name: formData?.fullName,
      email: formData?.email,
      phone: formData?.phone,
      address: formData?.deliveryAddress ? formData?.deliveryAddress : "USA",
    }

    const data = {
      deliveryInfo: deliveryInfo,
      user_id: sessionStorage?.getItem('4mtxxd'),
      user_email: sessionStorage?.getItem('4mtxxm'),
      currency: currency,
      orders: cartItems?.map((d) => ({
        prod_id: d?._id,
        prod_name: d?.name,
        moq: d?.moq,
        image: d?.imageUrls[0],
        price: currency === 'USD' ? d?.priceUsd : d?.priceNaira,
        qty: d?.quantity,
        subtotal: d?.quantity * (currency === 'USD' ? d?.priceUsd : d?.priceNaira),
      })),
      totalAmt: calculateTotal(),
      paymentType: currency
    }
    try {
      const result = await paymentService.initiate(data);
      if (result) {
        setIsLoading(false)
        toast({
          title: "Checkout",
          description: result?.message,
        });
        setTimeout(() => {
          window.location.href = result.paystack.data?.authorization_url;

        }, 1400)
      }
      else {
        setIsLoading(false)
        toast({
          title: "Checkout",
          description: result?.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setIsLoading(false)
      toast({
        title: "Checkout",
        description: err?.response?.data?.message,
        variant: "destructive",
      });
    }
  };


  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Shopping Cart</h1>
          <p className="text-slate-600">Review your items and proceed to checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                      <div className="sm:col-span-2 flex items-center space-x-4">
                        <img
                          src={item.imageUrls[0]}
                          alt={item.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 text-sm sm:text-base">{item.name}</h3>
                          <p className="text-primary-600 font-bold text-sm sm:text-base mt-1">
                            {formatPrice(item.priceUsd, item.priceNaira)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-center space-x-2">
                       
                        <span className="mx-3 font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantityIncrease(item._id)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end">
                        <p className="font-bold text-slate-900">
                          {currency === 'USD'
                            ? `$${(parseFloat(item.priceUsd) * item.quantity).toFixed(2)}`
                            : `₦${(parseFloat(item.priceNaira) * item.quantity).toLocaleString()}`
                          }
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItemUpdate(item._id)}
                          className="text-red-600 hover:text-red-700 ml-4"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Order Summary</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                  <div className="flex space-x-2">
                    <Button
                      variant={currency === 'USD' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrency('USD')}
                      className="flex-1"
                    >
                      USD ($)
                    </Button>
                    <Button
                      variant={currency === 'NGN' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrency('NGN')}
                      className="flex-1"
                    >
                      NGN (₦)
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium">
                      {currency === 'USD'
                        ? `$${calculateTotal().toFixed(2)}`
                        : `₦${calculateTotal().toLocaleString()}`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-slate-900">Total</span>
                      <span className="text-lg font-bold text-slate-900">
                        {currency === 'USD'
                          ? `$${calculateTotal().toFixed(2)}`
                          : `₦${calculateTotal().toLocaleString()}`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700 py-3 shadow-lg" onClick={proceedPayment}>
                        Proceed to Checkout
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Order Details </DialogTitle>
                      </DialogHeader>
                      {sessionStorage?.getItem('4mttoken') ?
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                              Full Name
                            </label>
                            <Input
                              id="fullName"
                              name="fullName"
                              type="text"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              required
                              className="w-full"
                              placeholder="Full Name"
                            />
                          </div>

                          <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                              Email Address
                            </label>
                            <div className="relative">
                              <Input
                                id="email"
                                name="email"
                                type={"email"}
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full pr-12"
                                placeholder="Email Address"
                              />

                            </div>
                          </div>
                          <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                              Phone Number
                            </label>
                            <div className="relative">
                              <Input
                                id="phone"
                                name="phone"
                                type={"text"}
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                className="w-full pr-12"
                                placeholder="Phone Number"
                              />

                            </div>
                          </div>
                          <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                              Delivery Address
                            </label>
                            <div className="relative">
                              <Location setAddObj={setAddObj} />

                            </div>
                          </div>

                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-emerald-600 text-white hover:bg-emerald-700 py-3 font-semibold shadow-lg"
                          >
                            {isLoading ? 'Submitting...' : 'Complete'}
                          </Button>
                        </form> :
                        <div>
                          {guestForm ?
                            <div>
                              <form onSubmit={handleGuestPay} className="space-y-6">
                              <div>
                                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                    Full Name
                                  </label>
                                  <Input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    value={guestData.fullName}
                                    onChange={handleInputChangeGuest}
                                    required
                                    className="w-full"
                                    placeholder="Full Name"
                                  />
                                </div>

                                <div>
                                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                    Email Address
                                  </label>
                                  <div className="relative">
                                    <Input
                                      id="email"
                                      name="email"
                                      type={"email"}
                                      value={guestData.email}
                                      onChange={handleInputChangeGuest}
                                      required
                                      className="w-full pr-12"
                                      placeholder="Email Address"
                                    />

                                  </div>
                                </div>
                                <div>
                                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                    Phone Number
                                  </label>
                                  <div className="relative">
                                    <Input
                                      id="phone"
                                      name="phone"
                                      type={"text"}
                                      value={guestData.phone}
                                      onChange={handleInputChangeGuest}
                                      required
                                      className="w-full pr-12"
                                      placeholder="Phone Number"
                                    />

                                  </div>
                                </div>
                                <div>
                                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                    Delivery Address
                                  </label>
                                  <div className="relative">
                                    <Location setAddObj={setAddObj} />

                                  </div>
                                </div>
                                <Button
                                  type="submit"
                                  disabled={isLoading}
                                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700 py-3 font-semibold shadow-lg"
                                >
                                  Proceed
                                </Button>
                              </form>
                            </div> :
                            <div className="container py-5">
                              <h5 className="pt-3 font-weight-bold"><span className="text-danger">NB: {" "}</span>We have detected that you are not logged in or don't have an account with us</h5>
                              <br />
                              <form onSubmit={handleSubmitGuest} className="space-y-6">
                                <Radio.Group
                                  style={style}
                                  onChange={onChange}
                                  value={radioValue}
                                  options={[
                                    {
                                      value: 1,
                                      label: 'Do you want to proceed to pay for this product as a guest user that does not have an account with 4marketdays?',
                                    },
                                    {
                                      value: 2,
                                      label: 'Login an existing account and complete purchase so we can add this to your purchase records',
                                    },
                                    {
                                      value: 3,
                                      label: 'Register an new account , so you can always come back to buy easily and see your purchase records',
                                    },

                                  ]}
                                />
                                <Button
                                  type="submit"
                                  disabled={isLoading}
                                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700 py-3 font-semibold shadow-lg"
                                >
                                  Proceed
                                </Button>
                              </form>
                            </div>}
                        </div>}


                    </DialogContent>
                  </Dialog>
                  <br />
                  <Link href="/" className={"mt-5"}>
                    <Button variant="outline" className="w-full" style={{ marginTop: '1rem' }}>
                      Continue Shopping
                    </Button>
                  </Link>
                </div>


              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}