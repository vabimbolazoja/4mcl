import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from '../context/cartContext';
import axios from "axios";
import { Star, Heart, Share2, ShoppingCart, ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThreeDots } from "react-loader-spinner";
import config from "../../src/config"
import { cartItems } from "@shared/schema";
interface Product {
  id: number;
  name: string;
  description: string;
  priceUsd: string;
  priceNgn: string;
  imageUrl: string;
  rating: string;
  reviewCount: number;
  category: string;
  inStock: boolean;
  weight: string;
  origin: string;
  nutritionalInfo?: string;
  storageInstructions?: string;
}

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD');
  const [actualProd, setActualProd] = useState({})
  const { toast } = useToast();
  const { data: product, isLoading, error } = useQuery({
    queryKey: [`${config.baseurl}product/${params?.id}`],
    queryFn: () =>
      axios
        .get(`${config.baseurl}product/${params?.id}`)
        .then((res) => res.data),
    retry: 1,
  });

  const { state, addItem } = useCart();

  const handleAddToCart = async () => {
    if (quantity >= product?.moq) {
      setIsAdding(true);
      const cartItem = state.items.find(item => item._id === product._id);
      console.log(cartItem)
      if (cartItem?._id) {
        toast({
          title: "Add to Cart!",
          description: `${product?.name} is already in your cart.`,
          variant: "destructive",

        });
      }
      else {
        const newProd = { ...product, quantity: quantity }
        addItem(newProd)
        toast({
          title: "Add to Cart!",
          description: `${product?.name} is added to your cart.`,

        });
      }
    }
    else {
      toast({
        title: "Add to Cart!",
        description: `${`Minimum order quantity for ${product?.name} is ${product?.moq}`}.`,
        variant: "destructive",

      });
      return;
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Product link copied to clipboard.",
      });
    }
  };

  useEffect(() => {
    setIsAdding(false)
  }, [quantity])

  if (!product && !isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center py-8 my-8">


            <h1 className="text-2xl font-bold text-slate-900">Product not found</h1>
            <Link href="/">
              <Button className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {isLoading &&
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <ThreeDots
            visible={isLoading}
            height="60"
            width="60"
            color="#10b981"
            radius="9"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>}

      {!isLoading &&
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-slate-600 mb-8">
            <Link href="/" className="hover:text-emerald-600">Home</Link>
            <span>/</span>
            <Link href="/#categories" className="hover:text-emerald-600">{product.category?.name}</Link>
            <span>/</span>
            <span className="text-slate-900">{product.name}</span>
          </div>

          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-slate-600 hover:text-emerald-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div>
              <div className="aspect-square rounded-2xl overflow-hidden mb-4">
                <img
                  src={product?.imageUrls[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {product?.imageUrls?.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-emerald-600' : 'border-slate-200 hover:border-emerald-300'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                  {product.category?.name} 
                </Badge>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`${isFavorite ? 'text-red-500' : 'text-slate-400'} hover:text-red-500`}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleShare} className="text-slate-400 hover:text-emerald-600">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">{product.name}</h1>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(parseFloat(4)) ? 'text-yellow-400 fill-current' : 'text-slate-300'
                        }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Button
                    variant={currency === 'USD' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrency('USD')}
                    className="text-xs"
                  >
                    USD
                  </Button>
                  <Button
                    variant={currency === 'NGN' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrency('NGN')}
                    className="text-xs"
                  >
                    NGN
                  </Button>
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {currency === 'USD' ? `$${product.priceUsd}` : `₦${product.priceNaira}`}
                </div>
                <p className="text-slate-600 mt-1"> MOQ: {product.moq}</p>
              </div>

              <p className="text-slate-600 mb-6 leading-relaxed">{product.description}</p>

              {/* Quantity and Add to Cart */}
              <div className="flex items-center space-x-4 mb-8">
                <div className="flex items-center border border-slate-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-slate-600 hover:text-emerald-600"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-slate-600 hover:text-emerald-600"
                  >
                    +
                  </button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 py-3"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                  <Truck className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Free Shipping</p>
                    <p className="text-xs text-slate-600">Orders over $50</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Quality Guarantee</p>
                    <p className="text-xs text-slate-600">Fresh & authentic</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                  <RotateCcw className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Easy Returns</p>
                    <p className="text-xs text-slate-600">30-day policy</p>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Nutritional Information</h3>
                    <p className="text-slate-600 text-sm">{product.nutritionalInfo}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Storage Instructions</h3>
                    <p className="text-slate-600 text-sm">{product.storageInstructions}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>}

      <Footer />
    </div>
  );
}