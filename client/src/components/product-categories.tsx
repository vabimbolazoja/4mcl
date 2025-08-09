import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import config from "../config"
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Empty } from 'antd'
import axios from "axios";
export default function ProductCategories() {
  const { toast } = useToast();
  const { data: categories, isLoading, error } = useQuery({
    queryKey: [`${config.baseurl}categories`],
    retry: 1,
    queryFn: () =>
      axios
        .get(`${config.baseurl}categories`)
        .then((res) => res.data),
  });




  return (
    <section className="py-12 sm:py-16 lg:py-20" id="categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">Shop by Category</h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover authentic African foods organized by type. From staples to spices, find everything you need.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {isLoading ? (
            Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                <Skeleton className="w-full h-40 sm:h-48" />
                <div className="p-4 sm:p-6">
                  <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 mb-2" />
                  <Skeleton className="h-5 sm:h-6 w-full mb-2" />
                  <Skeleton className="h-3 sm:h-4 w-3/4 mb-4" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
                    <Skeleton className="h-8 sm:h-9 w-16 sm:w-20" />
                  </div>
                </div>
              </div>
            ))) : 
            categories?.map((category) => (
              <Card key={category.id} className="group cursor-pointer hover:shadow-xl hover:shadow-emerald-100 transition-all duration-300 hover:border-emerald-200" >
                <Link to={`/products-category?category=${category?._id}&category_type=${category?.name}`}>
                  <CardContent className="p-0">
                    <div className="overflow-hidden rounded-t-lg">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">{category.name}</h3>
                      <p className="text-slate-600 mb-4 text-sm sm:text-base leading-relaxed">{category.description}</p>
                      <div className="flex items-center text-emerald-600 font-medium text-sm sm:text-base group-hover:text-emerald-700 transition-colors">
                        <span>Shop Now</span>
                        <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
        </div>

        {categories?.length === 0 &&
                    <div className="text-center mb-12 sm:mb-16">
                        <ShoppingBag className="mx-auto h-24 w-24 text-slate-300 mb-6" />
                        <h4 className="">Categories Not Found</h4>
                    </div>}
      </div>
    </section>
  );
}
