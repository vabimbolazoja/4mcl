import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from '../context/cartContext';
import { useToast } from "@/hooks/use-toast";
import { Modal } from "antd";
interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    priceUsd: string;
    priceNgn: string;
    imageUrl?: string;
    rating?: string;
    reviewCount?: number;
    category?: any;
  };
}

export default function ProductCard({ product, origin }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [openCartMsg, setOpenCartMsg] = useState(false)
  const [location, setLocation] = useLocation();
  const [cartMsg, setCartMsg] = useState("")
  const { addItem, incrementItem, decrementItem, removeItem, state } = useCart();
  const { toast } = useToast();


  const handleAddToCart = async () => {
    setIsAdding(true);
    const cartItem = state.items.find(item => item._id === product._id);
    if (cartItem?._id) {
      toast({
        title: "Add to Cart!",
        description: `${product?.name} is already in your cart.`,
        variant: "destructive",

      });
    }
    else {
      const newProd = { ...product, quantity: product?.moq }
      addItem(newProd)
      setOpenCartMsg(true)
      setCartMsg(`${product?.name} of the minum order quanity ${product?.moq} is now added to your cart.`)
    }
  }




  return (
    <Card className="group hover:shadow-xl hover:shadow-emerald-100 transition-all duration-300 hover:border-emerald-200 cursor-pointer">
      <CardContent className="p-0">
        <Link href={`/product/${product._id}`}>
        <div className="overflow-hidden rounded-t-lg aspect-[4/3]">
  <img
    src={product.imageUrls[0]}
    alt={product.name}
    className="w-full h-full object-contain"
  />
</div>

        </Link>
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            {product.category && (
              <span className="text-xs sm:text-sm text-primary-600 font-medium">{product.category?.name} </span>
            )}
            {product.rate && (
              <div className="flex items-center">
                <Star className="text-yellow-400 h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                <span className="text-xs sm:text-sm text-slate-600 ml-1">{product.rate}</span>
              </div>
            )}
          </div>
          <Link href={`/product/${product._id}`}>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 leading-tight hover:text-emerald-700 transition-colors">{product.name}</h3>

          </Link>
          <p className="text-slate-600 text-xs sm:text-sm mb-4 leading-relaxed">MOQ:{product.moq}</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-base sm:text-lg font-bold text-slate-900">{origin === '0' ? "$" : "N"}{origin === "0" ? product.priceUsd : origin === "1" ? product?.priceNaira : 'NA'}</span>
            </div>
            {product?.stock < 1 ?
              <div style={{ border: '1px solid red', background: 'red', padding: '8px', color: 'white', borderRadius: '10px' }}>
                Sold Out
              </div> :
              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs sm:text-sm px-4 py-2 w-full sm:w-auto shadow-lg"
              >
                {isAdding ? 'Added!' : 'Add to Cart'}
              </Button>}
          </div>
        </div>
      </CardContent>
      <Modal
        title="Add to Cart!"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={openCartMsg}
        footer={false}
        onCancel={() => setOpenCartMsg(false)}
      >
        <p className="p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">
          {cartMsg}
        </p>
        <br />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            type="submit"
            onClick={() => setOpenCartMsg(false)}
            className="w bg-emerald-600 text-white hover:bg-emerald-700 py-3 font-semibold shadow-lg"
          >
            Continue Shopping
          </Button>
          <Button
            type="submit"
            onClick={() => setLocation('/cart')
            }
            className="w bg-emerald-600 text-white hover:bg-emerald-700 py-3 font-semibold shadow-lg"
          >
            Checkout
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
