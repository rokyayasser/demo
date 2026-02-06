/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { assets } from "../../assets/assets";

const ServiceDetails = ({ serviceInfo }) => {
  if (!serviceInfo) {
    return (
      <div className="text-center py-10">
        <p className="text-textSoft">لا تتوفر معلومات الخدمة</p>
      </div>
    );
  }

  return (
    <motion.div className="flex flex-col lg:flex-row gap-8 mb-12">
      <motion.div className="lg:w-1/3">
        <motion.img
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="w-full h-64 lg:h-80 object-cover rounded-2xl shadow-xl border-2 border-borderLight"
          src={serviceInfo.image}
          alt={serviceInfo.title}
        />
      </motion.div>

      <motion.div className="lg:w-2/3 border border-borderLight rounded-2xl p-8 bg-white shadow-lg">
        <motion.p
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 text-2xl font-semibold text-primary mb-2"
        >
          {serviceInfo.title}
          <motion.img
            animate={{ rotate: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-5"
            src={assets.verified_icon}
            alt="verified"
          />
        </motion.p>

        <p className="text-secondary text-sm mb-4 font-medium">
          {serviceInfo.category_ar}
        </p>
        <p className="text-textSoft text-sm mb-6 leading-relaxed">
          {serviceInfo.description}
        </p>

        <div className="mb-6">
          <p className="font-medium text-textMain mb-3">المميزات:</p>
          <ul className="list-disc pr-5 text-textSoft text-sm space-y-2">
            {serviceInfo.features?.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="hover:text-secondary transition-colors"
              >
                {feature}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-textMain font-medium mb-2">سعر الخدمة:</p>
            <p className="text-primary text-3xl font-bold">
              {serviceInfo.fees} جنيه
            </p>
          </div>

          {serviceInfo.duration && (
            <div className="text-center">
              <p className="text-textSoft text-sm mb-1">المدة</p>
              <p className="text-textMain font-medium">
                {serviceInfo.duration}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ServiceDetails;
