/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";

// Components
import Header from "../components/home/Header";

import Banner from "../components/home/Banner";
import TopServices from "../components/TopServices";

const Home = () => {
  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="overflow-hidden"
    >
      <Header />
      <TopServices />
      <Banner />
    </motion.div>
  );
};

export default Home;
