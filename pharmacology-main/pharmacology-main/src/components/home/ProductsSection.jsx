/* eslint-disable no-unused-vars */
// pages/Products.jsx  (user side)
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { ProductContext } from "../../context/ProductContext";
import AnimatedText from "../../components/common/AnimatedContent";
import Card from "../../components/common/Card";
import { FiPackage, FiStar } from "react-icons/fi";

const Products = () => {
  const navigate = useNavigate();
  const {
    products: rawProducts,
    getAllProducts,
    isLoading,
  } = useContext(ProductContext);
  const [search, setSearch] = useState("");

  // Guard: always work with an array even if context returns unexpected shape
  const products = Array.isArray(rawProducts)
    ? rawProducts
    : Array.isArray(rawProducts?.products)
      ? rawProducts.products
      : Array.isArray(rawProducts?.data)
        ? rawProducts.data
        : [];

  useEffect(() => {
    getAllProducts();
  }, []);

  const filtered = search
    ? products.filter((p) =>
        (p.title_ar || p.title || "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : products;

  return (
    <div className="mt-40 my-12 px-4 sm:px-6 lg:px-10" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-right">
          <AnimatedText delay={0.1}>
            <div className="text-xs md:text-sm text-secondary mb-3 flex items-center gap-1">
              <span className="cursor-pointer" onClick={() => navigate("/")}>
                الرئيسية
              </span>
              <span>/</span>
              <span>المنتجات</span>
            </div>
          </AnimatedText>
          <AnimatedText delay={0.2}>
            <h1 className="text-2xl md:text-4xl font-bold mb-4">
              منتجاتنا الموصى بها
            </h1>
          </AnimatedText>
        </div>

        {/* Search */}
        <div className="mb-10 max-w-md">
          <div className="relative">
            <Search
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-xl
                focus:ring-2 focus:ring-[#1e4b8f] text-right bg-gray-50/50 outline-none"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#9b61db] border-t-transparent" />
          </div>
        )}

        {/* Grid */}
        {!isLoading && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-500 text-lg">
                  {search
                    ? "لم يتم العثور على منتجات."
                    : "لا توجد منتجات متاحة حالياً."}
                </p>
              </div>
            ) : (
              filtered.map((product) => {
                const unavailable = product.available === false;
                return (
                  <motion.div
                    key={product._id}
                    whileHover={unavailable ? {} : { y: -8 }}
                    className="relative"
                  >
                    {unavailable && (
                      <div
                        className="absolute inset-0 z-10 flex items-end justify-center
                        pb-6 rounded-2xl bg-black/30 pointer-events-none"
                      >
                        <span
                          className="bg-red-500 text-white text-sm font-bold
                          px-5 py-2 rounded-full shadow-lg"
                        >
                          غير متاح حالياً
                        </span>
                      </div>
                    )}
                    <AnimatedText delay={0.2}>
                      <Card
                        item={{
                          image: product.image,
                          title: product.title_ar || product.title,
                          desc: product.description_ar || product.description,
                          price: product.discountPrice
                            ? `${product.discountPrice} جنيه`
                            : `${product.price} جنيه`,
                          meta1: product.category || "",
                          meta2: product.rating?.toFixed?.(1) || "4.5",
                        }}
                        Meta1Icon={FiPackage}
                        Meta2Icon={FiStar}
                        buttonText={unavailable ? "غير متاح" : "عرض المنتج"}
                        onClick={
                          unavailable
                            ? undefined
                            : () => navigate(`/products/${product._id}`)
                        }
                      />
                    </AnimatedText>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
