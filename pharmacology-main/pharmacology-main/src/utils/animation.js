// src/utils/animations.js

// أنيميشن ظهور النص مع تأثير الضبابية (Blur)
export const fadeUpBlur = (delayTime = 0) => ({
  hidden: { opacity: 0, y: 30, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut", delay: delayTime },
  },
});

// أنيميشن ظهور الكروت من الأسفل للأعلى
export const fadeUpCard = (delayTime = 0) => ({
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay: delayTime },
  },
});
