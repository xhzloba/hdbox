"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Показываем кнопку когда прокрутка больше 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-6 right-6
        w-14 h-14
        rounded-full
        text-white
        shadow-md hover:shadow-lg
        transition-all duration-300
        flex items-center justify-center
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        z-50
        border border-border

        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}
      `}
      style={{
        background: 'linear-gradient(131deg, rgb(25, 25, 25), rgb(36, 35, 35))',
        boxShadow: 'rgb(0, 0, 0) 7px 5px 8px, rgb(48, 49, 50) 2px 2px 20px inset'
      }}
      aria-label="Наверх"
    >
      <ArrowUp size={28} className="text-gray-400" />
    </button>
  );
};

export default BackToTopButton;