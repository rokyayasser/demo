/* eslint-disable no-unused-vars */
import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

const AddService = () => {
  const [serviceImg, setServiceImg] = useState(false);
  const [title, setTitle] = useState("");
  const [title_ar, setTitleAr] = useState("");
  const [category, setCategory] = useState("Laboratory");
  const [category_ar, setCategoryAr] = useState("المعامل");
  const [description, setDescription] = useState("");
  const [fees, setFees] = useState("");
  const [duration, setDuration] = useState("30 minutes");
  const [features, setFeatures] = useState([""]);

  const { backendUrl, aToken } = useContext(AdminContext);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  };

  const addFeature = () => {
    setFeatures([...features, ""]);
  };

  const removeFeature = (index) => {
    const newFeatures = features.filter((_, i) => i !== index);
    setFeatures(newFeatures);
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      if (!serviceImg) {
        return toast.error("يرجى رفع صورة الخدمة");
      }

      const validFeatures = features.filter((f) => f.trim() !== "");
      if (validFeatures.length === 0) {
        return toast.error("يرجى إضافة ميزة واحدة على الأقل");
      }

      const formData = new FormData();
      formData.append("image", serviceImg);
      formData.append("title", title);
      formData.append("title_ar", title_ar);
      formData.append("category", category);
      formData.append("category_ar", category_ar);
      formData.append("description", description);
      formData.append("fees", Number(fees));
      formData.append("duration", duration);
      formData.append("features", JSON.stringify(validFeatures));

      const { data } = await axios.post(
        `${backendUrl}/api/admin/add-service`,
        formData,
        {
          headers: { token: aToken },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setServiceImg(false);
        setTitle("");
        setTitleAr("");
        setCategory("Laboratory");
        setCategoryAr("المعامل");
        setDescription("");
        setFees("");
        setDuration("30 minutes");
        setFeatures([""]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  const categories = [
    { en: "Endocrinology", ar: "الغدد الصماء" },
    { en: "Gastroenterology", ar: "أمراض الجهاز الهضمي" },
    { en: "Nutrition", ar: "التغذية" },
    { en: "ChronicDiseases", ar: "الأمراض المزمنة" },
    { en: "Orthopedics", ar: "المفاصل والعظام" },
    { en: "SpecialConsultation", ar: "استشارات خاصة" },
  ];

  return (
    <motion.form
      onSubmit={onSubmitHandler}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="m-5 w-full"
      dir="rtl"
    >
      <motion.p
        variants={itemVariants}
        className="mb-3 text-lg font-medium text-primary"
      >
        إضافة خدمة طبية
      </motion.p>

      <motion.div
        variants={itemVariants}
        className="bg-white px-8 py-8 border border-borderLight rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll"
      >
        {/* Image Upload */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-4 mb-8 text-textSoft"
        >
          <label htmlFor="service-img">
            <img
              className="w-24 h-24 bg-lightBg rounded-lg cursor-pointer object-cover border-2 border-borderLight"
              src={
                serviceImg
                  ? URL.createObjectURL(serviceImg)
                  : assets.upload_area
              }
              alt=""
            />
          </label>
          <input
            onChange={(e) => setServiceImg(e.target.files[0])}
            type="file"
            id="service-img"
            hidden
            accept="image/*"
          />
          <p>
            رفع صورة الخدمة
            <br />
            <span className="text-xs text-textSoft">اختر صورة واضحة</span>
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-start gap-10 text-textMain">
          {/* Left Column */}
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            {[
              "Title English",
              "Title Arabic",
              "Category",
              "Fees",
              "Duration",
            ].map((label, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex-1 flex flex-col gap-1"
              >
                <p>
                  {label === "Title English"
                    ? "اسم الخدمة (English)"
                    : label === "Title Arabic"
                    ? "اسم الخدمة (عربي)"
                    : label === "Category"
                    ? "التخصص"
                    : label === "Fees"
                    ? "السعر (جنيه)"
                    : "المدة"}
                </p>

                {label === "Category" ? (
                  <select
                    className="border border-borderLight bg-lightBg rounded px-3 py-2 focus:outline-none focus:border-secondary"
                    onChange={(e) => {
                      const selectedIndex = e.target.selectedIndex;
                      setCategory(e.target.value);
                      setCategoryAr(categories[selectedIndex].ar);
                    }}
                    value={category}
                  >
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat.en}>
                        {cat.ar} - {cat.en}
                      </option>
                    ))}
                  </select>
                ) : label === "Duration" ? (
                  <select
                    className="border border-borderLight bg-lightBg rounded px-3 py-2 focus:outline-none focus:border-secondary"
                    onChange={(e) => setDuration(e.target.value)}
                    value={duration}
                  >
                    <option value="15 minutes">15 دقيقة</option>
                    <option value="20 minutes">20 دقيقة</option>
                    <option value="30 minutes">30 دقيقة</option>
                    <option value="45 minutes">45 دقيقة</option>
                    <option value="1 hour">ساعة</option>
                    <option value="1.5 hours">ساعة ونصف</option>
                    <option value="2 hours">ساعتين</option>
                  </select>
                ) : label === "Title English" ? (
                  <input
                    className="border border-borderLight bg-lightBg rounded px-3 py-2 focus:outline-none focus:border-secondary"
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                    type="text"
                    placeholder="Complete Blood Test"
                    required
                  />
                ) : label === "Title Arabic" ? (
                  <input
                    className="border border-borderLight bg-lightBg rounded px-3 py-2 focus:outline-none focus:border-secondary"
                    onChange={(e) => setTitleAr(e.target.value)}
                    value={title_ar}
                    type="text"
                    placeholder="تحليل دم شامل"
                    required
                  />
                ) : (
                  <input
                    className="border border-borderLight bg-lightBg rounded px-3 py-2 focus:outline-none focus:border-secondary"
                    onChange={(e) => setFees(e.target.value)}
                    value={fees}
                    type="number"
                    placeholder="300"
                    required
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Right Column */}
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            {/* Description */}
            <motion.div
              variants={itemVariants}
              className="flex-1 flex flex-col gap-1"
            >
              <p>الوصف</p>
              <textarea
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                className="border border-borderLight bg-lightBg rounded px-3 py-2 focus:outline-none focus:border-secondary"
                placeholder="وصف شامل للخدمة الطبية..."
                rows={4}
                required
              />
            </motion.div>

            {/* Features */}
            <motion.div
              variants={itemVariants}
              className="flex-1 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <p>المميزات</p>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addFeature}
                  className="text-primary text-sm hover:underline"
                >
                  + إضافة ميزة
                </motion.button>
              </div>

              <AnimatePresence>
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-2 mt-2"
                  >
                    <input
                      className="border border-borderLight bg-lightBg rounded px-3 py-2 flex-1 focus:outline-none focus:border-secondary"
                      type="text"
                      placeholder={`الميزة ${index + 1}`}
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                    />
                    {features.length > 1 && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFeature(index)}
                        className="text-red-500 px-2 hover:text-red-600"
                      >
                        ✕
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="bg-primary px-10 py-3 mt-6 text-white rounded-full hover:bg-secondary transition-all"
        >
          إضافة الخدمة
        </motion.button>
      </motion.div>
    </motion.form>
  );
};

export default AddService;
