"use client";

import React, { useState, useRef, useCallback, memo, useMemo } from "react";
import Image from "next/image"; // Use Next.js Image component
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import styles from "./destinations-card.module.scss";

type Props = {
  card: {
    discount: string;
    new: boolean;
    stars: number;
    reviews: number;
    title: string;
    description: string;
    img: string;
    video: string;
    deadline: string;
  };
};

const DestinationCardSubComponent = ({ card }: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);

  const handleMouseEnter = useCallback(() => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      setIsHovered(true);
    }, 2000);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
  }, []);

  // Use useMemo to prevent unnecessary re-rendering of the star icons
  const renderStars = useMemo(() => {
    const starIcons = [];
    for (let i = 0; i < 5; i++) {
      const isFilled = i < card.stars;
      starIcons.push(
        <span key={i}>
          <StarIcon
            className={`${styles["bx-icon"]} ${!isFilled && styles.inactive}`}
          />
        </span>
      );
    }
    return starIcons;
  }, [card.stars]);

  return (
    <div
      className={styles.card__container}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Conditionally render video and image */}
      {isHovered && card.video ? (
        <video
          src={card.video}
          autoPlay
          loop
          muted
          playsInline
          className={styles.clip}
        />
      ) : (
        <>
          <Image
            src={card.img}
            alt={card.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
            className={styles.clip}
            priority
          />
          <div className={styles.overlay}></div>
          <div className={styles.wrapper}>
            <div className={styles.tags}>
              <button className={styles.discount}>{card.discount}</button>
              {card.new && <button className={styles.new}>new</button>}
            </div>
            <div className={styles.contents}>
              <div className={styles.stars}>
                <div className={styles.icons}>{renderStars}</div>
                <div className={styles.reviews}>{`(${card.reviews} Reviews)`}</div>
              </div>
              <div className={styles.title}>{card.title}</div>
              <div className={styles.description}>{card.description}</div>
              <div className={styles.expiry__date}>
                <div>
                  <AccessTimeIcon className={styles.icon} />
                </div>
                <div className={styles.deadline}>{`${card.deadline}`}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default memo(DestinationCardSubComponent);