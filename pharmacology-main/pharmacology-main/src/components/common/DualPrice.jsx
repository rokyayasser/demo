// src/components/common/DualPrice.jsx
// Shows price in USD only (converted from EGP using live exchange rate)
// Usage: <DualPrice egp={service.fees} />
//        <DualPrice egp={course.price} size="lg" className="text-white" />

import React, { useEffect, useState } from "react";
import { getUsdToEgpRate, toUsd } from "../../utils/currency.service";

const DualPrice = ({ egp, size = "md", className = "" }) => {
  const [rate, setRate] = useState(null);

  useEffect(() => {
    getUsdToEgpRate().then(setRate);
  }, []);

  const numEgp = Number(egp);
  if (!numEgp) return <span className={className}>مجاني</span>;

  const sizeMap = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-3xl",
    xl: "text-4xl",
  };
  const textSize = sizeMap[size] || sizeMap.md;

  return (
    <span className={`font-extrabold ${textSize} ${className}`}>
      {rate ? toUsd(numEgp, rate) : "..."}
    </span>
  );
};

export default DualPrice;
