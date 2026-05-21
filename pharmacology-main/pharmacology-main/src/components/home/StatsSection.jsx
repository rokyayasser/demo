import React, { useState, useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import AnimatedText from "../common/AnimatedContent";

// مكون العداد الفرعي - يدعم الأعداد الصحيحة والعشرية
const Counter = ({ target, suffix = "", duration = 3500 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;

    let startTime = null;
    // Parse target as float to support decimals (e.g., 3.5)
    const endValue = parseFloat(target);

    // Determine number of decimal places in target
    const decimalPlaces = (endValue.toString().split(".")[1] || "").length;

    // If target is integer, decimalPlaces = 0, we show integer
    // If target has .5, we show one decimal

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = currentTime - startTime;

      let currentValue;
      if (progress >= duration) {
        currentValue = endValue;
      } else {
        const eased = progress / duration; // linear
        currentValue = eased * endValue;
      }

      // Format according to decimal places
      let displayValue;
      if (decimalPlaces === 0) {
        displayValue = Math.floor(currentValue); // integer
      } else {
        displayValue = currentValue.toFixed(decimalPlaces);
      }

      setCount(displayValue);

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, isInView]);

  return (
    <span ref={ref} className="text-3xl md:text-4xl font-bold gradient-text">
      +{count}
      {suffix}
    </span>
  );
};

const StatsSection = () => {
  const stats = [
    { id: 1, target: 8, suffix: "M", label: "Followers" },
    { id: 2, target: 50, suffix: "", label: "Successful Story" },
    { id: 3, target: 3.5, suffix: "B", label: "Views" },
  ];

  return (
    <section className="py-16 px-4 md:px-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {stats.map((stat, index) => (
          <AnimatedText key={stat.id} delay={index * 0.2}>
            <div className="bg-white rounded-2xl shadow-sm px-8 w-full py-5 flex items-center gap-3 min-w-[350px] md:min-w-[400px]">
              <Counter
                target={stat.target}
                suffix={stat.suffix}
                duration={2000}
              />
              <span className="text-sm md:text-base font-bold text-gray-900">
                {stat.label}
              </span>
            </div>
          </AnimatedText>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
