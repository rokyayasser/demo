// src/components/common/DualPrice.jsx
// Shows EGP price + live USD equivalent
// Usage: <DualPrice egp={service.fees} />
//        <DualPrice egp={500} size="lg" />

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
    sm: { egp: "text-sm", usd: "text-xs" },
    md: { egp: "text-lg", usd: "text-sm" },
    lg: { egp: "text-3xl", usd: "text-lg" },
    xl: { egp: "text-4xl", usd: "text-xl" },
  };
  const s = sizeMap[size] || sizeMap.md;

  return (
    <span className={`inline-flex flex-col items-end gap-0.5 ${className}`}>
      {/* Primary: EGP */}
      <span className={`font-extrabold text-[#2d1b5a] ${s.egp}`}>
        {numEgp.toLocaleString("ar-EG")} جنيه
      </span>
      {/* Secondary: USD equivalent */}
      {rate ? (
        <span className={`text-gray-400 font-medium ${s.usd}`}>
          ≈ {toUsd(numEgp, rate)}
        </span>
      ) : (
        <span className={`text-gray-300 ${s.usd}`}>جارٍ التحميل...</span>
      )}
    </span>
  );
};

export default DualPrice;
