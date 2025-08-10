import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useCart } from '../context/cartContext';
import { useToast } from "@/hooks/use-toast";
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

export default function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, incrementItem, decrementItem, removeItem, state } = useCart();
  const { toast } = useToast();


  const handleAddToCart = async () => {
    setIsAdding(true);
    const cartItem = state.items.find(item => item._id === product._id);
    if(cartItem?._id){
      toast({
        title: "Add to Cart!",
        description: `${product?.name} is already in your cart.`,
        variant: "destructive",

      });
    }
    else{
      const newProd = { ...product, quantity: product?.moq}
      addItem(newProd)
      toast({
        title: "Add to Cart!",
        description: `${product?.name} is now added to your cart.`,

      });
    }
    }

    
  

  return (
    <Card className="group hover:shadow-xl hover:shadow-emerald-100 transition-all duration-300 hover:border-emerald-200 cursor-pointer">
      <CardContent className="p-0">
        <Link href={`/product/${product._id}`}>
          <div className="overflow-hidden rounded-t-lg">
            <img 
              src={product.imageUrls[0]} 
              alt={product.name}
              className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
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
              <span className="text-base sm:text-lg font-bold text-slate-900">${product.priceUsd}</span>
              <span className="text-base sm:text-lg font-bold text-slate-900">₦{product.priceNaira}</span>
            </div>
            <Button 
              onClick={handleAddToCart}
              disabled={isAdding}
              className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs sm:text-sm px-4 py-2 w-full sm:w-auto shadow-lg"
            >
              {isAdding ? 'Added!' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
