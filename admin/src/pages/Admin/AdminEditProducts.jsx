/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, X, Plus, Minus, Save } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const AdminEditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { aToken, backendUrl } = useContext(AdminContext);

  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    name_ar: "",
    description: "",
    description_ar: "",
    category: "",
    category_ar: "",
    subcategory: "",
    subcategory_ar: "",
    price: "",
    discountPrice: "",
    stock: "",
    sku: "",
    brand: "",
    brand_ar: "",
    tags: "",
    specifications: JSON.stringify({}),
    isPublished: true,
    isFeatured: false,
  });
  const [images, setImages] = useState([]);
  const [specifications, setSpecifications] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoadingProduct(true);
      const { data } = await axios.get(
        `${backendUrl}/api/products/${productId}`
      );

      if (data.success && data.product) {
        const product = data.product;

        setFormData({
          name: product.name || "",
          name_ar: product.name_ar || "",
          description: product.description || "",
          description_ar: product.description_ar || "",
          category: product.category || "",
          category_ar: product.category_ar || "",
          subcategory: product.subcategory || "",
          subcategory_ar: product.subcategory_ar || "",
          price: product.price || "",
          discountPrice: product.discountPrice || "",
          stock: product.stock || "",
          sku: product.sku || "",
          brand: product.brand || "",
          brand_ar: product.brand_ar || "",
          tags: product.tags?.join(", ") || "",
          specifications: JSON.stringify(product.specifications || {}),
          isPublished: product.isPublished || false,
          isFeatured: product.isFeatured || false,
        });

        // Set specifications
        if (product.specifications) {
          const specsArray = Object.entries(product.specifications).map(
            ([key, value]) => ({
              key,
              value,
            })
          );
          setSpecifications(specsArray);
        }

        // Set images previews
        if (product.images && product.images.length > 0) {
          const imagePreviews = product.images.map((url) => ({
            url,
            preview: url,
          }));
          setImages(imagePreviews);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("فشل في تحميل بيانات المنتج");
      navigate("/admin/products");
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formDataToSend = new FormData();

      // Add form data
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add new images
      images.forEach((image) => {
        if (image.file) {
          formDataToSend.append("images", image.file);
        }
      });

      const { data } = await axios.put(
        `${backendUrl}/api/products/admin/${productId}`,
        formDataToSend,
        {
          headers: {
            token: aToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success("✅ تم تحديث المنتج بنجاح");
        navigate("/admin/products");
      } else {
        toast.error("❌ " + (data.message || "حدث خطأ"));
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("❌ فشل في تحديث المنتج: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the component is similar to AdminCreateProduct.js
  // (handleImageUpload, removeImage, addSpecification, etc.)

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-textSoft text-lg">جاري تحميل بيانات المنتج...</p>
        </div>
      </div>
    );
  }

  return (
    // ... The form UI is identical to AdminCreateProduct.js
    // but with a different title and loading existing data
    <div>{/* Similar form structure as AdminCreateProduct.js */}</div>
  );
};

export default AdminEditProduct;
