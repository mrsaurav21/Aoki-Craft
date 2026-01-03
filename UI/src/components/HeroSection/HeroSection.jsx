import React from "react";
import HeroImg from "../../assets/img/hero3.jpeg";

const HeroSection = () => {
  return (
    <div
      className="relative flex items-center bg-cover flext-start bg-center text-left h-svh w-full"
      style={{ backgroundImage: `url(${HeroImg})` }}
    >
      <div className="absolute top-0 right-0 bottom-0 left-0"></div>
      <main className="px-10 lg:px-24 z-10">
        <div className="text-left">
          <h2 className="text-2xl text-white">Discover Modern Living</h2>
        </div>
        <p className="mt-3 text-white sm:mt-5 sm:max-w-xl text-6xl">
          Elevate your home with exclusive
        </p>
        <p className="mt-3 text-white sm:mt-5 sm:max-w-xl text-2xl">
          interiors and timeless furniture.
        </p>
        <button className="border rounded mt-6 border-black hover:bg-white hover:text-black hover:border-black text-white bg-black w-44 h-12">
          Shop Now
        </button>
      </main>
    </div>
  );
};

export default HeroSection;
