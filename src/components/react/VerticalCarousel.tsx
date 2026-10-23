import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";

interface ImageData {
  src: string;
  alt: string;
}

interface VerticalCarouselProps {
  images: ImageData[];
  scrollSpeed?: number;
  interval?: number;
}

const VerticalCarousel: React.FC<VerticalCarouselProps> = ({
  images,
  scrollSpeed = 3,
  interval = 50,
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const lastTsRef = useRef<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const x = useMotionValue(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    y.set(0);
    x.set(0);
    lastTsRef.current = null;
  }, [images, scrollSpeed, interval, y, x]);

  useAnimationFrame((t, delta) => {
    const container = carouselRef.current;
    const content = contentRef.current;
    if (!container || !content || images.length === 0) return;

    const pixelsPerSecond = (scrollSpeed * 1000) / Math.max(1, interval);
    const distance = (pixelsPerSecond * delta) / 1000;

    if (isMobile) {
      const maxScroll = Math.max(0, content.scrollWidth - container.clientWidth);
      if (maxScroll <= 0) return;
      let nextX = x.get() - distance;
      if (Math.abs(nextX) >= maxScroll - 1) nextX = 0;
      x.set(nextX);
    } else {
      const maxScroll = Math.max(0, content.scrollHeight - container.clientHeight);
      if (maxScroll <= 0) return;
      let nextY = y.get() - distance;
      if (Math.abs(nextY) >= maxScroll - 1) nextY = 0;
      y.set(nextY);
    }
  });

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-gray-100 gap-2">
        {["#d991c2", "#9869b8", "#6756cc"].map((color, index) => (
          <div
            key={index}
            className={`w-5 h-5 rounded-full animate-bounce`}
            style={{ backgroundColor: color, animationDelay: `${index * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden relative" ref={carouselRef}>
      <motion.div
        ref={contentRef}
        style={{
          y: isMobile ? 0 : y,
          x: isMobile ? x : 0,
          willChange: "transform",
        }}
        className="h-full flex gap-10 flex-row items-center md:flex-col"
      >
        {images.map(({ src, alt }, index) => (
          <div
            key={index}
            className="flex grow justify-center h-full min-w-screen md:w-full md:min-w-0 md:h-auto"
          >
            <img
              src={src}
              alt={alt}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              fetchPriority={index === 0 ? "high" : "low"}
              className="object-contain max-h-[80vh] max-w-[90vw] md:max-w-full"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default VerticalCarousel;