import { useState, useEffect } from "react";
import { Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, CreditCard, Truck, Eye, MapPin, Phone, Mail, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from 'antd'
import { useCart } from '../context/cartContext';
import config from "../../src/config"
import paymentService from "../services/payment-service"
import { Modal } from 'antd'
import { useToast } from "@/hooks/use-toast";
import axios from 'axios'
interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: string;
  imageUrl: string;
  moq: Number;
}

interface Order {
  id: string;
  date: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'PAID';
  total: string;
  currency: 'USD' | 'NGN';
  items: OrderItem[];
  shippingAddress: string;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  paymentMethod?: string;
  subtotal?: string;
  // orderNotes?: string;
}

export default function OrderHistory() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();
  const [showReveiew, setShowReview] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const { state, clearCart, incrementItem, decrementItem } = useCart();
  const [openReturn, setOpenReturn] = useState(false)
  const { data, isLoading, refetch, error } = useQuery({
    queryKey: [`${config.baseurl}orders/customer/${sessionStorage?.getItem('4mtxxd')}?page=${page}&limit=${limit}`],
    queryFn: () =>
      axios
        .get(`${config.baseurl}orders/customer/${sessionStorage?.getItem('4mtxxd')}?page=${page}&limit=${limit}`)
        .then((res) => res.data),
    retry: 1,
  });

  const orders = data || [];
  const totalPages = data?.totalPages * 10 || 10;
  const currentPage = data?.page || 1;

  console.log(orders)


  useEffect(() => {
    setPage(currentPage)
  }, [currentPage])




  function itemRender(current, type, originalElement) {
    if (type === "prev") {
      return <a>Previous</a>;
    }
    if (type === "next") {
      return <a>Next</a>;
    }
    return originalElement;
  }

  const pagination = (page, pageSize) => {
    setPage(page);
    setLimit(pageSize)

  };

  useEffect(() => {
    refetch();

  }, [limit, page]);




  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';

      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'DELIVERED':
      case 'PAID':
      case 'SHIPPED':
        return <Truck className="h-4 w-4" />;
      case 'PROCESSING':
      case 'PENDING':
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

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

  useEffect(() => {
    var urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("order_id");
    const ref = urlParams.get("trxref");
    if (id && ref) {
      verifyPayment(id, ref)
    }
  }, [])


  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // empty dependency means run once when component mounts



  const verifyPayment = async (id: any, ref: any) => {
    try {
      const result = await paymentService.verify({ ref: ref, id: id });
      if (result) {
        clearCart()
        refetch()

      }
      else {
        toast({
          title: "Order Verification",
          description: result?.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Order Verification",
        description: err?.response?.data?.message,
        variant: "destructive",
      });
    }
  }

  const getItemsRow = (id: any) => {
    const filetedArr = orders?.orders?.find((d: any) => d?._id === id)
    return filetedArr?.orders

  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Order History</h1>
          <p className="text-slate-600">Track and manage your orders</p>
        </div>

        {orders?.orders?.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">No orders yet</h2>
              <p className="text-slate-600 mb-6">
                You haven't placed any orders yet. Start shopping to see your order history here.
              </p>
              <Link href="/">
                <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders?.orders?.map((order) => (
              <Card key={order._id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Order Header */}
                  <div className="bg-slate-50 p-4 sm:p-6 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">Order #{order.ref}</p>
                          <div className="flex items-center text-sm text-slate-600 mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <p className="font-semibold text-slate-900">Payment Status
                            <Badge className={`${getStatusColor(order.paymentStatus)} w-fit`}>
                              <div className="flex items-center">
                                <span className="ml-1 capitalize">{order.paymentStatus}</span>
                              </div>
                            </Badge>
                          </p>


                        </div>


                      </div>
                      <div>
                        <div>
                          <div>
                            ORDER STATUS:
                            <Badge className={`${getStatusColor(order.orderStatus)} w-fit`}>
                              <div className="flex items-center">
                                {getStatusIcon(order.orderStatus)}
                                <span className="ml-1 capitalize">{order.orderStatus}</span>
                              </div>
                            </Badge>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            
                            {order?.orderStatus === 'DELIVERED' &&
                              <Button
                                type="submit"
                                style={{ marginLeft: '1rem' }}
                                onClick={() => {
                                  setShowReview(true)
                                }}
                                className="mt-2 bg-blue-600 text-white hover:bg-blue-700 py-1 font-semibold shadow-lg"
                              >
                                Review Order
                              </Button>}
                              {order?.orderStatus === 'DELIVERED' &&
                              <p
                                onClick={() => setOpenReturn(true)}
                                className="mt-2 text-info pl-4"
                                style={{ textDecoration: '',fontWeight:'700', color:'blue' }}
                              >
                                Return Item
                              </p>}

                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            {order.paymentType === 'USD' ? '$' : '₦'}{order.totalAmt}
                          </p>
                          <p className="text-sm text-slate-600">{order.orders.length} item{order.orders.length > 1 ? 's' : ''}</p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold">Order Details - {order.ref}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-slate-50 rounded-lg">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge className={`${getStatusColor(order.orderStatus)}`}>
                                      <div className="flex items-center">
                                        {getStatusIcon(order.orderStatus)}
                                        <span className="ml-1 capitalize">{order.orderStatus}</span>
                                      </div>
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-slate-600">
                                    Order placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>

                              </div>

                              <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Items Ordered</h3>
                                <div className="space-y-4">
                                  {order.orders.map((item) => (
                                    <div key={item.prod_id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg">
                                      <img
                                        src={item.image}
                                        alt={item.prod_name}
                                        className="w-20 h-20 object-cover rounded-lg"
                                      />
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-slate-900">{item.prod_name}</h4>
                                        <p className="text-sm text-slate-600">Quantity: {item.qty}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold text-slate-900">
                                          {order.paymentType === 'USD' ? '$' : '₦'}{item.subtotal}
                                        </p>
                                        <p className="text-sm text-slate-600">each</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <Separator />

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Order Summary */}
                                <div>
                                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Subtotal</span>
                                      <span className="font-medium">
                                        {formatCurrency(order?.totalSub, order.paymentType === 'USD' ? "USD" : "NGN")}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Delivery Cost</span>
                                      <span className="font-medium">
                                        {formatCurrency(order?.deliveryCost, order.paymentType === 'USD' ? "USD" : "NGN")}
                                      </span>
                                    </div>

                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold">
                                      <span>Grand Total</span>
                                      <span>  {formatCurrency(order?.totalAmt, order.paymentType === 'USD' ? "USD" : "NGN")}
                                      </span>
                                    </div>
                                  </div>


                                </div>

                                <div>
                                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Customer Information</h3>
                                  {order.deliveryInfo && (
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-slate-600" />
                                        <span className="text-slate-600">{order.deliveryInfo.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-slate-600" />
                                        <span className="text-slate-600">{order.deliveryInfo.email}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-slate-600" />
                                        <span className="text-slate-600">{order.deliveryInfo.phone}</span>
                                      </div>
                                    </div>
                                  )}

                                  <div className="mt-6">
                                    <h4 className="font-semibold text-slate-900 mb-2">Shipping Address</h4>
                                    <div className="flex items-start gap-2">
                                      <MapPin className="h-4 w-4 text-slate-600 mt-0.5" />
                                      <span className="text-slate-600">{order.deliveryInfo?.address}</span>
                                    </div>
                                  </div>
                                  <Separator />
                                  <div className="mt-6">
                                    <h4 className="font-semibold text-slate-900 mb-2">Delivery Details</h4>
                                    <div className="flex items-start gap-2">
                                      <MapPin className="h-4 w-4 text-slate-600 mt-0.5" />
                                      <span className="text-slate-600">Rider Name - {order?.rider ?? 'NA'}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <MapPin className="h-4 w-4 text-slate-600 mt-0.5" />
                                      <span className="text-slate-600">Expected Delivery Date- {order?.expectedDate ?? 'NA'}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <MapPin className="h-4 w-4 text-slate-600 mt-0.5" />
                                      <span className="text-slate-600">Current Location- {order?.location ?? 'NA'}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <MapPin className="h-4 w-4 text-slate-600 mt-0.5" />
                                      <span className="text-slate-600">Status- {order?.orderStatus ?? 'NA'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>

                  Order Items
                  <div className="p-4 sm:p-6">
                    <div className="space-y-2">
                      {getItemsRow(order?._id)?.map((item) => (
                        <div key={item._id} className="flex items-center space-x-4">
                          <img
                            src={item.image}
                            alt={item.prod_name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900">{item.prod_name}</h3>
                            <p className="text-sm text-slate-600">Quantity: {item.qty}</p>
                          </div>

                          <div className="text-right">
                            <p className="font-medium text-slate-900">
                              {order.paymentType === 'USD' ? '$' : '₦'}{item.subtotal}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
                      {order.trackingNumber && (
                        <div className="flex items-center text-sm text-slate-600">
                          <Truck className="h-4 w-4 mr-2" />
                          Tracking: {order.trackingNumber}
                        </div>
                      )}
                      <div className="flex-1"></div>
                      <div className="flex gap-2">
                        {order.status === 'delivered' && (
                          <Button variant="outline" size="sm">
                            Reorder
                          </Button>
                        )}
                        {(order.status === 'shipped' || order.status === 'delivered') && order.trackingNumber && (
                          <Button variant="outline" size="sm">
                            Track Package
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          Download Invoice
                        </Button>
                      </div>
                    </div> */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Modal
          title="Return Prompt!"
          closable={{ 'aria-label': 'Custom Close Button' }}
          open={openReturn}
          footer={false}
          onCancel={() => setOpenReturn(false)}
        >
          <p className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg">
            We are sorry to learn that you may not be satisfied,Thank you for your request. Please contact us at support@4marketdays.com and our team will get in touch with you shortly."

          </p>
          <br />
          <Button
            type="submit"
            onClick={() => setOpenReturn(false)}
            className="w-full bg-emerald-600 text-white hover:bg-emerald-700 py-3 font-semibold shadow-lg"
          >
            DONE
          </Button>
        </Modal>

        <Modal
          title="Review!"
          closable={{ 'aria-label': 'Custom Close Button' }}
          open={showReveiew}
          footer={false}
          onCancel={() => setShowReview(false)}
        >
          <p className="p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg">
            Coming soon and will be available to you shortly.

          </p>
          <br />
          <Button
            type="submit"
            onClick={() => setShowReview(false)}
            className="w-full bg-emerald-600 text-white hover:bg-emerald-700 py-3 font-semibold shadow-lg"
          >
            DONE
          </Button>
        </Modal>


        {orders?.orders?.length > 0 && !isLoading &&
          <div className="d-flex  justify-content-center align-items-center pt-5 pb-5" style={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination
              current={page}
              total={totalPages}
              onChange={pagination}
              itemRender={itemRender}
            />{" "}
          </div>}
      </div>

      <Footer />
    </div>
  );
}