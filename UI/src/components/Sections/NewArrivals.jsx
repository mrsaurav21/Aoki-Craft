import React from "react";
import SectionHeading from "./SectionsHeading/SectionHeading";
import Card from "../Card/Card";
import beanbag from "../../assets/img/beanbag.webp";
import mirros from "../../assets/img/mirros.jpg";
import Curtains from "../../assets/img/curtains.jpg";
import Clock from "../../assets/img/clocks.jpg";
import Candles from "../../assets/img/candles.jpg";
import Rugs from "../../assets/img/rugs.webp";
import Cushion from "../../assets/img/cushions.jpg";
import Carousel from "react-multi-carousel";
import { responsive } from "../../utils/Section.constants";
import "./NewArrivals.css";

const items = [
  {
    title: "Beanbag",
    imagePath: beanbag,
  },
  {
    title: "Mirror",
    imagePath: mirros,
  },
  {
    title: "Curtain",
    imagePath: Curtains,
  },
  {
    title: "Clock",
    imagePath: Clock,
  },
  {
    title: "Cushion",
    imagePath: Cushion,
  },
  {
    title: "Candles",
    imagePath: Candles,
  },
  {
    title: "Rugs",
    imagePath: Rugs,
  },
];

const NewArrivals = () => {
  return (
    <>
      <SectionHeading title={"New Arrivals"} />
      <Carousel
        responsive={responsive}
        autoPlay={false}
        swipeable={true}
        draggable={false}
        showDots={false}
        infinite={false}
        partialVisible={false}
        itemClass={"react-slider-custom-item"}
        className="px-8"
      >
        {items &&
          items?.map((item, index) => (
            <Card
              key={item?.title + index}
              title={item.title}
              imagePath={item.imagePath}
            />
          ))}
      </Carousel>
    </>
  );
};

export default NewArrivals;
