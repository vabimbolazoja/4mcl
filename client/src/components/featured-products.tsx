import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react"; 'react'
import { Button } from "@/components/ui/button";
import ProductCard from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useSearch } from 'wouter'
import config from "../config"
import axios from "axios";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Empty } from "antd";
import { GlobalStateContext } from "../context/globalContext"
import { Pagination } from "antd";
export default function FeaturedProducts() {
  const { origin, setOrigin } = useContext(GlobalStateContext);
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [`${config.baseurl}products-active?page=${page}&limit=${limit}`],
    queryFn: () =>
      axios
        .get(`${config.baseurl}products-active?page=${page}&limit=${limit}`)
        .then((res) => res.data),
    retry: 1,

  });




  const products = data?.products || [];
  const totalPages = data?.pages * 10 || 10;
  const currentPage = data?.page || 1;


  useEffect(() => {
    setPage(currentPage)
  },[currentPage])

 

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);



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



  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-slate-50" id="products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">Our Products</h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Our most popular items loved by customers worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }, (_, i) => (
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
            ))
          ) : (

            products?.map((product) => (
              <ProductCard key={product.id} product={product} origin={origin.sourceOrigin} />
            ))
          )}
        </div>

        {products?.length === 0 && !isLoading &&
          <div className="text-center mb-12 sm:mb-16">
            <ShoppingBag className="mx-auto h-24 w-24 text-slate-300 mb-6" />
            <h4 className="">Products Not Found</h4>
          </div>}

        <br />
        {products?.length > 0 && !isLoading &&
        <div className="d-flex  justify-content-center align-items-center pt-5 pb-5" style={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            current={page}
            total={totalPages}
            onChange={pagination}
            itemRender={itemRender}
          />{" "}
        </div>}
      </div>
    </section>
  );
}
