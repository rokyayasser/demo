import React, { useState, useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import AnimatedText from "../common/AnimatedContent"; // تأكد من المسار

// مكون العداد الفرعي
const Counter = ({ target, suffix = "", duration = 3500 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;

    let startTime = null;
    const endValue = parseInt(target, 10);

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = currentTime - startTime;

      const currentCount = Math.min(
        Math.floor((progress / duration) * endValue),
        endValue
      );

      setCount(currentCount);

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
      +{count}{suffix}
    </span>
  );
};

const StatsSection = () => {
  const stats = [
    { id: 1, target: 8, suffix: "M", label: "Followers" },
    { id: 2, target: 50, suffix: "", label: "Successful Story" },
    { id: 3, target: 1, suffix: "B", label: "Views" },
  ];

  return (
    <section className="py-16 px-4 md:px-10" >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {stats.map((stat, index) => (
          <AnimatedText key={stat.id} delay={index * 0.2}>
            <div 
            className="bg-white rounded-2xl shadow-sm px-8 w-full py-5 flex items-center gap-3 min-w-[350px] md:min-w-[400px]">
              <Counter target={stat.target} suffix={stat.suffix} duration={2000} />
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