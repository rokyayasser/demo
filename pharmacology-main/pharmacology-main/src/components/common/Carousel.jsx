import React, { useState, useRef } from "react";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa6";
import CarouselCard from "./CarouselCard";
import Button from "./Button";

const Carousel = ({
  data = [],
  Meta1Icon,
  Meta2Icon,
  ButtonIcon,
  buttonText,
  gradientColor = "from-[#3a4417]",
  to,
  onClick,

}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = data?.length || 0;

  const startX = useRef(0);
  const isDragging = useRef(false);

  const handleNext = () =>
    setActiveIndex((prev) => (prev + 1) % total);

  const handlePrev = () =>
    setActiveIndex((prev) => (prev - 1 + total) % total);

  const handleCardClick = (index) => {
    if (!isDragging.current) {
      setActiveIndex(index);
    }
  };

  const handlePointerDown = (e) => {
    startX.current = e.clientX;
    isDragging.current = false;
  };

  const handlePointerMove = (e) => {
    const diff = e.clientX - startX.current;
    if (Math.abs(diff) > 10) {
      isDragging.current = true;
    }
  };

  const handlePointerUp = (e) => {
    const diff = e.clientX - startX.current;
    const threshold = 60;

    if (diff < -threshold) {
      handleNext();
    } else if (diff > threshold) {
      handlePrev();
    }

    startX.current = 0;
  };

  const getCardStyle = (index) => {
    let diff = index - activeIndex;

    if (diff > Math.floor(total / 2)) diff -= total;
    if (diff < -Math.floor(total / 2)) diff += total;

    if (diff === 0)
      return "translate-x-0 scale-100 opacity-100 z-30 brightness-100 shadow-2xl";
    if (diff === 1)
      return "translate-x-[50%] md:translate-x-[60%] scale-[0.85] opacity-90 z-20 brightness-[0.4]";
    if (diff === -1)
      return "-translate-x-[50%] md:-translate-x-[60%] scale-[0.85] opacity-90 z-20 brightness-[0.4]";
    if (diff === 2)
      return "translate-x-[90%] md:translate-x-[110%] scale-[0.7] opacity-50 z-10 brightness-[0.2] pointer-events-none";
    if (diff === -2)
      return "-translate-x-[90%] md:-translate-x-[110%] scale-[0.7] opacity-50 z-10 brightness-[0.2] pointer-events-none";

    return "scale-50 opacity-0 z-0 pointer-events-none";
  };

  return (
    <div
      dir="rtl"
      className="relative w-full h-[550px] flex justify-center items-center mt-6 touch-pan-y"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <Button
        onClick={handlePrev}
        className="hidden md:flex absolute left-8 z-40 w-10 h-10 items-center justify-center rounded-xl"
      >
        <FaChevronLeft className="text-lg" />
      </Button>

      <Button
        onClick={handleNext}
        className="hidden md:flex absolute right-8 z-40 w-10 h-10 items-center justify-center rounded-xl"
      >
        <FaChevronRight className="text-lg" />
      </Button>

      {data?.map((item, index) => (
        <CarouselCard
          key={item.id}
          item={item}
          Meta1Icon={Meta1Icon}
          Meta2Icon={Meta2Icon}
          ButtonIcon={ButtonIcon}
          buttonText={buttonText}
          gradientColor={gradientColor}
          className={getCardStyle(index)}
          onClick={onClick ? () => onClick(item) : undefined}
          to={!onClick && to ? to.replace(":id", item.id || item._id) : undefined}
         
        />
        
      ))}
    </div>
  );
};

export default Carousel;