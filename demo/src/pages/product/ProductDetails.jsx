/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductContext } from "../../context/ProductContext";
import { AppContext } from "../../context/AppContext";
import { motion } from "framer-motion";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RefreshCw,
  ChevronLeft,
  Minus,
  Plus,
  Check,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const {
    currentProduct,
    getProductDetails,
    addToCart,
    formatPrice,
    calculateDiscountPercentage,
    isProductInCart,
    getCartQuantity,
    relatedProducts,
  } = useContext(ProductContext);

  const { token } = useContext(AppContext);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const sizes = ["S", "M", "L", "XL", "XXL"];
  const colors = [
    { name: "أحمر", value: "#DC2626" },
    { name: "أزرق", value: "#2563EB" },
    { name: "أخضر", value: "#16A34A" },
    { name: "أسود", value: "#000000" },
    { name: "أبيض", value: "#FFFFFF", border: true },
  ];

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    await getProductDetails(productId);
  };

  useEffect(() => {
    if (currentProduct) {
      setQuantity(getCartQuantity(currentProduct._id) || 1);
    }
  }, [currentProduct]);

  const handleAddToCart = async () => {
    if (!token) {
      toast.info("يجب تسجيل الدخول أولاً لإضافة المنتج إلى السلة");
      navigate("/login", { state: { from: `/products/${productId}` } });
      return;
    }

    // Validate selections
    if (currentProduct.specifications?.size && !selectedSize) {
      toast.error("الرجاء اختيار المقاس");
      return;
    }

    if (currentProduct.specifications?.color && !selectedColor) {
      toast.error("الرجاء اختيار اللون");
      return;
    }

    if (quantity > currentProduct.stock) {
      toast.error(
        `الكمية المطلوبة غير متوفرة. المتوفر: ${currentProduct.stock}`
      );
      return;
    }

    const result = await addToCart(
      currentProduct._id,
      quantity,
      selectedSize,
      selectedColor
    );

    if (result) {
      toast.success("تمت إضافة المنتج إلى السلة");
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/cart");
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `تحقق من هذا المنتج: ${currentProduct?.name_ar}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentProduct?.name_ar,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("تم نسخ رابط المنتج");
    }
  };

  const increaseQuantity = () => {
    if (quantity < currentProduct.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (!currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-textSoft text-lg">جاري تحميل تفاصيل المنتج...</p>
        </div>
      </div>
    );
  }

  const discountPercentage = calculateDiscountPercentage(
    currentProduct.price,
    currentProduct.discountPrice
  );

  const isInCart = isProductInCart(currentProduct._id);
  const cartQuantity = getCartQuantity(currentProduct._id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-borderLight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-textSoft">
            <button
              onClick={() => navigate("/products")}
              className="hover:text-primary"
            >
              المنتجات
            </button>
            <ChevronLeft size={16} />
            <button
              onClick={() =>
                navigate(`/products?category=${currentProduct.category}`)
              }
              className="hover:text-primary"
            >
              {currentProduct.category_ar}
            </button>
            <ChevronLeft size={16} />
            <span className="text-primary font-medium">
              {currentProduct.name_ar}
            </span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Images */}
            <div>
              {/* Main Image */}
              <div className="mb-4">
                <img
                  src={currentProduct.images[selectedImage]}
                  alt={currentProduct.name_ar}
                  className="w-full h-96 object-contain rounded-xl bg-gray-50"
                />
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {currentProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${currentProduct.name_ar} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-textMain mb-2">
                  {currentProduct.name_ar}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={18}
                        className={`${
                          star <= (currentProduct.averageRating || 0)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-textSoft">
                    ({currentProduct.averageRating?.toFixed(1) || 0}) •{" "}
                    {currentProduct.reviewsCount || 0} تقييم
                  </span>
                  <span className="text-textSoft">
                    • رمز المنتج: {currentProduct.sku}
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {currentProduct.discountPrice ? (
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-red-600">
                        {formatPrice(currentProduct.discountPrice)}
                      </span>
                      <span className="text-xl line-through text-textSoft">
                        {formatPrice(currentProduct.price)}
                      </span>
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-bold">
                        خصم {discountPercentage}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold">
                      {formatPrice(currentProduct.price)}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="mb-6">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
                      currentProduct.stock > 10
                        ? "bg-green-100 text-green-700"
                        : currentProduct.stock > 0
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {currentProduct.stock > 0 ? (
                      <>
                        <Check size={16} />
                        <span>متوفر ({currentProduct.stock} قطعة)</span>
                      </>
                    ) : (
                      <>
                        <X size={16} />
                        <span>نفذ من المخزون</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Size Selection */}
              {currentProduct.specifications?.size && (
                <div className="mb-6">
                  <h3 className="font-bold text-textMain mb-3">المقاس</h3>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center ${
                          selectedSize === size
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-borderLight hover:border-primary"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {currentProduct.specifications?.color && (
                <div className="mb-6">
                  <h3 className="font-bold text-textMain mb-3">اللون</h3>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`flex flex-col items-center gap-2 ${
                          selectedColor === color.name
                            ? "text-primary"
                            : "text-textMain"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full border-2 ${
                            selectedColor === color.name
                              ? "border-primary"
                              : color.border
                              ? "border-gray-300"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: color.value }}
                        />
                        <span className="text-xs">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="font-bold text-textMain mb-3">الكمية</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-borderLight rounded-xl">
                    <button
                      onClick={decreaseQuantity}
                      className="px-4 py-3 hover:bg-gray-50"
                      disabled={quantity <= 1}
                    >
                      <Minus size={20} />
                    </button>
                    <span className="px-4 py-3 text-lg font-bold w-16 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={increaseQuantity}
                      className="px-4 py-3 hover:bg-gray-50"
                      disabled={quantity >= currentProduct.stock}
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  <div className="text-sm text-textSoft">
                    {currentProduct.stock} قطعة متوفرة
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 mb-8">
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={currentProduct.stock === 0 || isInCart}
                    className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${
                      isInCart
                        ? "bg-green-100 text-green-700"
                        : "bg-primary text-white hover:bg-secondary"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <ShoppingCart size={24} />
                    {isInCart
                      ? `مضاف في السلة (${cartQuantity})`
                      : "أضف إلى السلة"}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={currentProduct.stock === 0}
                    className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    شراء الآن
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsInWishlist(!isInWishlist)}
                    className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 ${
                      isInWishlist
                        ? "border-red-500 text-red-600 bg-red-50"
                        : "border-borderLight text-textMain hover:bg-gray-50"
                    }`}
                  >
                    <Heart
                      size={20}
                      className={isInWishlist ? "fill-current" : ""}
                    />
                    {isInWishlist ? "مضاف للمفضلة" : "أضف للمفضلة"}
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex-1 py-3 rounded-xl border border-borderLight text-textMain hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <Share2 size={20} />
                    مشاركة
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Truck className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">شحن سريع</p>
                    <p className="text-xs text-textSoft">توصيل خلال 2-3 أيام</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Shield className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">ضمان الجودة</p>
                    <p className="text-xs text-textSoft">ضمان 30 يوم إرجاع</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <RefreshCw className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">إرجاع مجاني</p>
                    <p className="text-xs text-textSoft">
                      إرجاع مجاني خلال 14 يوم
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Shield className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">دفع آمن</p>
                    <p className="text-xs text-textSoft">مدفوعات مشفرة وآمنة</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-borderLight">
            <div className="flex overflow-x-auto">
              {["description", "specifications", "reviews", "shipping"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-4 font-medium whitespace-nowrap border-b-2 ${
                      activeTab === tab
                        ? "border-primary text-primary"
                        : "border-transparent text-textSoft hover:text-textMain"
                    }`}
                  >
                    {tab === "description" && "الوصف"}
                    {tab === "specifications" && "المواصفات"}
                    {tab === "reviews" && "التقييمات"}
                    {tab === "shipping" && "الشحن والتوصيل"}
                  </button>
                )
              )}
            </div>

            <div className="p-8">
              {activeTab === "description" && (
                <div className="prose prose-lg max-w-none">
                  <p className="text-textMain leading-relaxed whitespace-pre-line">
                    {currentProduct.description_ar}
                  </p>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(currentProduct.specifications || {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-3 border-b border-borderLight"
                      >
                        <span className="text-textMain font-medium">{key}</span>
                        <span className="text-textSoft">{value}</span>
                      </div>
                    )
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <div className="flex items-center gap-8 mb-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary mb-2">
                        {currentProduct.averageRating?.toFixed(1) || "0.0"}
                      </div>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={20}
                            className={`${
                              star <= (currentProduct.averageRating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-textSoft">
                        من {currentProduct.reviewsCount || 0} تقييم
                      </p>
                    </div>

                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div
                          key={star}
                          className="flex items-center gap-3 mb-2"
                        >
                          <div className="w-20 text-sm">{star} نجوم</div>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400"
                              style={{ width: "70%" }}
                            ></div>
                          </div>
                          <div className="w-10 text-sm text-left">70%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews List */}
                  {currentProduct.ratings &&
                  currentProduct.ratings.length > 0 ? (
                    <div className="space-y-6">
                      {currentProduct.ratings
                        .slice(0, 5)
                        .map((rating, index) => (
                          <div
                            key={index}
                            className="border-b border-borderLight pb-6 last:border-0 last:pb-0"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold">
                                  {rating.userId?.name?.charAt(0) || "م"}
                                </div>
                                <div>
                                  <h4 className="font-medium">
                                    {rating.userId?.name || "مستخدم"}
                                  </h4>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        size={14}
                                        className={`${
                                          star <= (rating.rating || 0)
                                            ? "text-yellow-400 fill-current"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <span className="text-sm text-textSoft">
                                {rating.createdAt
                                  ? new Date(
                                      rating.createdAt
                                    ).toLocaleDateString("ar-EG")
                                  : "غير معروف"}
                              </span>
                            </div>
                            {rating.review && (
                              <p className="text-textMain">{rating.review}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      لا توجد تقييمات حتى الآن
                    </p>
                  )}
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3">سياسة الشحن</h3>
                    <ul className="space-y-2 text-textMain">
                      <li className="flex items-start gap-2">
                        <Check className="text-green-500 mt-1" size={18} />
                        <span>
                          الشحن داخل القاهرة: 30 جنيه (توصيل خلال 24-48 ساعة)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="text-green-500 mt-1" size={18} />
                        <span>
                          الشحن خارج القاهرة: 50 جنيه (توصيل خلال 2-3 أيام عمل)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="text-green-500 mt-1" size={18} />
                        <span>شحن مجاني للطلبات فوق 500 جنيه</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-3">سياسة الإرجاع</h3>
                    <ul className="space-y-2 text-textMain">
                      <li className="flex items-start gap-2">
                        <Check className="text-green-500 mt-1" size={18} />
                        <span>
                          يمكنك إرجاع المنتج خلال 14 يوم من استلام الطلب
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="text-green-500 mt-1" size={18} />
                        <span>يجب أن يكون المنتج في حالته الأصلية</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="text-green-500 mt-1" size={18} />
                        <span>سيتم استرداد المبلغ خلال 5-7 أيام عمل</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary">
                منتجات ذات صلة
              </h2>
              <button
                onClick={() =>
                  navigate(`/products?category=${currentProduct.category}`)
                }
                className="text-primary hover:text-secondary font-medium"
              >
                عرض الكل
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <motion.div
                  key={product._id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden group"
                >
                  <div
                    onClick={() => navigate(`/products/${product._id}`)}
                    className="cursor-pointer"
                  >
                    <img
                      src={product.mainImage}
                      alt={product.name_ar}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="p-4">
                      <h3 className="font-bold text-textMain mb-2 line-clamp-2">
                        {product.name_ar}
                      </h3>
                      <div className="flex items-center justify-between">
                        {product.discountPrice ? (
                          <div>
                            <span className="font-bold text-red-600">
                              {formatPrice(product.discountPrice)}
                            </span>
                            <span className="text-sm text-textSoft line-through mr-2">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
