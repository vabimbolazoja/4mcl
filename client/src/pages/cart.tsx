import { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from '../context/cartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { convertToCAD, convertToGBP, convertToUSD, convertCADtoUSD, convertGBPtoUSD } from "../lib/utils"
import { useToast } from "@/hooks/use-toast";
import paymentService from "../services/payment-service"
import { GlobalStateContext } from "../context/globalContext"
import { Radio, Modal } from 'antd'
import { useForm, Controller } from 'react-hook-form';
import configService from "../services/config-service"
import Location from "../components/Location/index"
import { useCurrencyConvert } from "../hooks/useCurrencyConvert"
export default function Cart() {


  const {
    register,
    reset,
    setValue,
    unregister, clearErrors,
    control,
    watch,
    formState: { errors },
  } = useForm();

  const { state, clearCart, incrementItem, decrementItem, removeItem } = useCart();
  const [openPaymentDetails, setOpenPaymentDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [guestForm, setGuestForm] = useState(false)
  const [openCartDetails, setOpenCardDetails] = useState(false)
  const [paymentPage, setPaymentPage] = useState(false)
  const [isValidating, setVerifyingAddress] = useState(false)
  const [acceptValid, setAcceptValid] = useState(false)
  const [validAddress, setValidAddress] = useState(true)
  const [amountGbp, setAmountGbp] = useState(null);
  const [amountCad, setAmountCad] = useState(null);
  const [gbpRates, setGbpRates] = useState({});
  const [cadRates, setCadRates] = useState({});
  const { origin, setOrigin } = useContext(GlobalStateContext);
  const [addressInvalid, setAddressInvalid] = useState(false)
  const [status, setStatus] = useState("")
  const [location, setLocation] = useLocation();
  const [addObj, setAddObj] = useState({})
  const [guestPostal, setGuestPostal] = useState("")
  const [guestCity, setGuestCity] = useState("")
  const [guestAddress, setGuestAddress] = useState("")
  const [guestAddressInfo, setGuestLocationIngo] = useState("")
  const [guestState, setGuestState] = useState("")

  const [userPostal, setUserPostal] = useState("")
  const [userCity, setUserCity] = useState("")
  const [userAddress, setUserAddress] = useState("")
  const [userAddressInfo, setUserLocationInfo] = useState("")
  const [userState, setUserState] = useState("")

  const [deliveryCountry, setDeliveryCountry] = useState("")
  const { toast } = useToast();
  const [radioValue, setRadioValue] = useState(1);
  const [configData, setConfigData] = useState<any[]>([]);
  const cartItems = state?.items ?? [];


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
    phone: "",
    postalCode: "",
    country: ""
  });
  const [guestData, setGuestData] = useState({
    email: '',
    deliveryAddress: '',
    fullName: "",
    phone: "",
    postalCode: "",
    country: ""
  });
  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleAddressSelect = (data: any) => {
    console.log(data)
  }



  useEffect(() => {
    getConfigs()
    window.scrollTo(0, 0);
  }, []);

  const getConfigs = async () => {
    try {
      const result = await configService.getConfigs();
      const arr = Object.values(result).filter((item) => typeof item === "object");
      setConfigData(arr)

    } catch (err: any) {

    }
  }



  const rateFuncGBP = async (amt) => {
    const ratesGBP = await convertToGBP(amt);
    return ratesGBP?.gbp;

  }

  const rateFuncCanadian = async (amt) => {
    const ratesCAD = await convertToCAD(amt);
    return ratesCAD?.cad;
  }

  useEffect(() => {
    if (!cartItems?.length) return;

    const loadRates = async () => {
      const gbpTemp = {};
      const cadTemp = {};

      for (const item of cartItems) {
        if (item.priceUsd) {
          gbpTemp[item.id] = await rateFuncGBP(item.priceUsd);
          cadTemp[item.id] = await rateFuncCanadian(item.priceUsd);
        }
      }

      setGbpRates(gbpTemp);
      setCadRates(cadTemp);
    };

    loadRates();
  }, [cartItems]);


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
      let price = 0;

      if (origin?.sourceOrigin === "2") {
        // GBP
        price = parseFloat(gbpRates[item.id] ?? 0);
      } else if (origin?.sourceOrigin === "3") {
        // CAD
        price = parseFloat(cadRates[item.id] ?? 0);
      } else if (origin?.sourceOrigin === "0") {
        // USD
        price = parseFloat(item.priceUsd ?? 0);
      } else {
        // NGN (default)
        price = parseFloat(item.priceNaira ?? 0);
      }

      return total + (price * (item.quantity ?? 1));
    }, 0);
  };

  function generateDeliveryFee(): number {
    if (!cartItems.length || !configData.length || !deliveryCountry) return 0;

    // find the matching config for the deliveryCountry
    const matchedConfig = configData.find((config) =>
      config.country.toLowerCase().includes(deliveryCountry.toLowerCase())
    );

    if (!matchedConfig) return 0;

    const pricePerKg = matchedConfig.deliveryPriceInKg;

    // calculate total delivery fee
    return cartItems.reduce((total, item) => {
      return total + item.quantity * pricePerKg;
    }, 0);
  }

  const calculateGrandTotal = (): string | number => {
    const productTotal = calculateTotal() || 0;
    const deliveryFee = generateDeliveryFee() || 0;
    return productTotal + deliveryFee;
  };

  const totalPayableVal = Number(calculateGrandTotal()) || 0;
  const { converted, loading } = useCurrencyConvert(
    totalPayableVal,
    origin?.sourceOrigin === "2" ? "GBP"
      : origin?.sourceOrigin === "3" ? "CAD"
        : null
  );

  if (!cartItems?.length) {
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
            <Link href="/products">
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

  const convetCADTOUSD = async (amt: any) => {
    const fromCAD = await convertToUSD(amt, "CAD");
    return fromCAD;
  }

  const convetGBPTOUSD = async (amt: any) => {
    const fromGBP = await convertToUSD(amt, "GBP");
    return fromGBP


  }






  const proceedPayment = () => {
    setOpenPaymentDetails(true)
  }



  const address = sessionStorage?.getItem('4mttoken') ? formData?.deliveryAddress : guestData?.deliveryAddress;
  const postalcode = sessionStorage?.getItem('4mttoken') ? formData?.postalCode : guestData?.postalCode;
  const country = sessionStorage?.getItem('4mttoken') ? formData?.country : guestData?.country;


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
      user_email: guestData?.email,
      currency: origin?.sourceOrigin === "0" ? 'USD' : 'NGN',
      orders: cartItems?.map((d) => ({
        prod_id: d?._id,
        prod_name: d?.name,
        moq: d?.moq,
        image: d?.imageUrls[0],
        price: currency === 'USD' ? d?.priceUsd : d?.priceNaira,
        qty: d?.quantity,
        subtotal: d?.quantity * (origin?.sourceOrigin === '0' ? d?.priceUsd : d?.priceNaira),
        deliveryCost: generateDeliveryFee()

      })),
      totalSub: calculateTotal(),
      totalAmt: origin?.sourceOrigin === "0" ? calculateGrandTotal() : origin?.sourceOrigin === "1" ? calculateGrandTotal() : converted,
      paymentType: origin?.sourceOrigin !== "1" ? 'USD' : 'NGN',
    }
    try {
      const result = await paymentService.initiate(data);
      if (result) {
        setPaymentPage(true)
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
  const formatCurrency = (
    amount: number | string,
    currency: "USD" | "NGN" | "EUR" | "CAD" = "USD",
    locale: string = "en-US"
  ): string => {
    const value = typeof amount === "string" ? parseFloat(amount) : amount;

    if (isNaN(value)) return "0.00";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

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
      currency: origin?.sourceOrigin === "0" ? 'USD' : 'NGN',
      orders: cartItems?.map((d) => ({
        prod_id: d?._id,
        prod_name: d?.name,
        moq: d?.moq,
        image: d?.imageUrls[0],
        price: currency === 'USD' ? d?.priceUsd : d?.priceNaira,
        qty: d?.quantity,
        subtotal: d?.quantity * (origin?.sourceOrigin === '0' ? d?.priceUsd : d?.priceNaira),
      })),
      totalAmt: origin?.sourceOrigin === "0" ? calculateGrandTotal() : origin?.sourceOrigin === "1" ? calculateGrandTotal() : converted,
      totalSub: calculateTotal(),
      paymentType: origin?.sourceOrigin !== "1" ? 'USD' : 'NGN',
      deliveryCost: generateDeliveryFee()
    }
    try {
      const result = await paymentService.initiate(data);
      if (result) {
        setPaymentPage(true)
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Shopping Cart </h1>
          <p className="text-slate-600">Review your items and proceed to checkout </p>
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
                          {origin?.sourceOrigin !== "" &&
                            <p className="text-primary-600 font-bold text-sm sm:text-base mt-1">
                              {
                            origin?.sourceOrigin === "2"
                              ? `GBP ${(parseFloat(gbpRates[item.id])).toLocaleString()}`
                              : origin?.sourceOrigin === "3"
                                ? `CAD ${(parseFloat(cadRates[item.id])).toLocaleString()}`
                                : origin?.sourceOrigin === "0"
                                  ? `$${(parseFloat(item.priceUsd)).toLocaleString()}`
                                  : `₦${(parseFloat(item.priceNaira)).toLocaleString()}`
                          } each
                            </p>}
                          <p className="text-primary-600 font-bold text-sm sm:text-base mt-1">
                            MOQ: {item?.moq}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-center space-x-2">
                        {item?.moq < item.quantity &&
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantityDecrease(item._id)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>}
                        <span className="mx-3 font-medium w-8 text-center">{item.quantity}</span>
                        {item?.quantity < item?.stock &&
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantityIncrease(item._id)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end">
                        <p className="font-bold text-slate-900">
                          {
                            origin?.sourceOrigin === "2"
                              ? `GBP ${(parseFloat(gbpRates[item.id]) * item.quantity || 0).toFixed(2)}`
                              : origin?.sourceOrigin === "3"
                                ? `CAD ${(parseFloat(cadRates[item.id]) * item.quantity || 0).toFixed(2)}`
                                : origin?.sourceOrigin === "0"
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">Payment Currency</label>
                  <div className="flex space-x-2">
                    <Button
                      variant={origin?.sourceOrigin === '0' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                    >
                      USD ($)
                    </Button>
                    <Button
                      variant={origin?.sourceOrigin === "2" ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                    >
                      GBP (E)
                    </Button>
                    <Button
                      variant={origin?.sourceOrigin === "3" ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                    >
                      CAD (CA)
                    </Button>
                    <Button
                      variant={origin?.sourceOrigin === "1" ? 'default' : 'outline'}
                      size="sm"
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
                      {origin?.sourceOrigin === "0"
                        ? `$${calculateTotal().toFixed(2)}`
                        : origin.sourceOrigin === "2" ? `GBP${calculateTotal().toFixed(2)}` : origin?.sourceOrigin === "3" ? `CAD${calculateTotal().toFixed(2)}` : `₦${calculateTotal().toLocaleString()}`
                      }
                    </span>
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
                        <DialogTitle className="text-xl font-bold">Delivery Information </DialogTitle>
                      </DialogHeader>
                      {sessionStorage?.getItem('4mttoken') ?
                        <form onSubmit={(e) => {
                          e.preventDefault()
                          if (!userAddressInfo) {
                            return;
                          }
                          setOpenCardDetails(true)
                        }} className="space-y-6">

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
                          <div className="pb-3">
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                              Delivery Address
                            </label>
                            <Location

                              setAddress={setUserAddress}
                              setCity={setUserCity}
                              setState={setUserState}
                              setPostal={setUserPostal}
                              setLocationInfo={setUserLocationInfo}
                              register={register}
                              control={control}
                              errors={errors}
                              watch={watch}
                              setValue={setValue}
                              reset={reset}
                              country={origin?.sourceOrigin === "0" ? 'us' : origin?.sourceOrigin === "2" ? 'gb' : origin?.sourceOrigin === "3" ? 'ca' : 'ng'}
                            />

                          </div>


                          <Button
                            type="submit"
                            className="w-full bg-emerald-600 text-white hover:bg-emerald-700 py-3 font-semibold shadow-lg"
                          >
                            {isLoading ? 'Submitting...' : 'Complete'}
                          </Button>
                        </form> :
                        <div>
                          {guestForm ?
                            <div>

                              <form onSubmit={(e) => {
                                e.preventDefault()
                                if (!guestAddressInfo) {
                                  return;
                                }
                                setOpenCardDetails(true)
                              }} className="space-y-6">
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
                                <div className="pb-3">
                                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                    Delivery Address
                                  </label>
                                  <Location
                                    setAddress={setGuestAddress}
                                    setCity={setGuestCity}
                                    setState={setGuestState}
                                    setPostal={setGuestPostal}
                                    setLocationInfo={setGuestLocationIngo}
                                    register={register}
                                    control={control}
                                    errors={errors}
                                    watch={watch}
                                    setValue={setValue}
                                    reset={reset}
                                    country={origin?.sourceOrigin === "0" ? 'us' : origin?.sourceOrigin === "2" ? 'gb' : origin?.sourceOrigin === "3" ? 'ca' : 'ng'}

                                  />


                                </div>




                                <div>
                                </div>
                                <Button
                                  type="submit"
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
                  <Link href="/products" className={"mt-5"}>
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

      <Modal
        title="Cart Details"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={openCartDetails}
        width={500}
        footer={false}
        onCancel={() => {
          setOpenCardDetails(false)
          setOpenPaymentDetails(true)
          setFormData({
            email: '',
            deliveryAddress: '',
            fullName: sessionStorage?.getItem('4mtfname') ? sessionStorage?.getItem('4mtfname') : "",
            phone: "",
            postalCode: "",
            country: ""
          });
          setStatus("")
          setGuestData({
            email: '',
            deliveryAddress: '',
            fullName: "",
            phone: "",
            postalCode: "",
            country: ""
          })

        }
        }
        maskClosable={false}
      >
        <div>
          <div>
            {paymentPage &&
              <p className="p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">
                <strong>🎉 Order Submitted Successfully.</strong> We will be redirecting you to a payment page to complete your order purchase.
              </p>}
            <br />
            <div className="flex justify-between mb-3">
              <h4 className="">Cart Subtotal Amount</h4>
              <h4 className="font-medium text-green-600">
                {formatCurrency(calculateTotal(), origin?.sourceOrigin === '0' ? "USD" : origin?.sourceOrigin === '1' ? "NGN" : origin?.sourceOrigin === '2' ? 'GBP' : 'CAD')}
              </h4>
            </div>
            <div className="flex justify-between mb-3">
              <h4 className="">Delivery Cost</h4>
              <h4 className="font-medium text-green-600">
                {formatCurrency(generateDeliveryFee(), origin?.sourceOrigin === '0' ? "USD" : origin?.sourceOrigin === '1' ? "NGN" : origin?.sourceOrigin === '2' ? 'GBP' : 'CAD')}
              </h4>
            </div>
            <div className="flex justify-between mb-3">
              <h4 className="">Grand Total</h4>
              <h4 className="font-medium text-green-600">
                {formatCurrency(calculateGrandTotal(), origin?.sourceOrigin === '0' ? "USD" : origin?.sourceOrigin === '1' ? "NGN" : origin?.sourceOrigin === '2' ? 'GBP' : 'CAD')}
              </h4>
            </div>
            <div className="flex justify-between">
              <h4 className="">Payable Amount - Only ($) Accepted </h4>
              {origin?.sourceOrigin === "0" &&
                <h4 className="font-medium text-green-600">
                  {formatCurrency(calculateGrandTotal(), 'USD')}
                </h4>}
              {origin?.sourceOrigin === "1" &&
                <h4 className="font-medium text-green-600">
                  {formatCurrency(calculateGrandTotal(), 'NGN')}
                </h4>}
              {origin?.sourceOrigin === "2" &&
                <h4 className="font-medium text-green-600">
                  ${converted}
                </h4>}

              {origin?.sourceOrigin === "3" &&
                <h4 className="font-medium text-green-600">
                  ${converted}
                </h4>}
            </div>
          </div>
        </div>
        <br />
        <Button
          type="submit"
          disabled={isLoading}
          onClick={sessionStorage?.getItem('4mttoken') ? handleSubmit : handleGuestPay}
          className="w-full bg-emerald-600 text-white hover:bg-emerald-700 py-3 font-semibold shadow-lg"
        >
          Complete Payment
        </Button>
      </Modal>

      <Footer />
    </div>
  );
}