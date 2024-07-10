"use client"

import React from "react";

import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useState, useRef, useCallback } from "react";

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
  return (
    <div
      className={styles.card__container}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!isHovered || !card.video ? (
        <>
          <img src={`${card.img}`} alt="banner" className={styles.clip} />
          <div className={styles.overlay}></div>
          <div className={styles.wrapper}>
            <div className={styles.tags}>
              <button className={styles.discount}>{card.discount}</button>
              {card.new && <button className={styles.new}>new</button>}
            </div>
            <div className={styles.contents}>
              <div className={styles.stars}>
                <div className={styles.icons}>
                  <span>
                    <StarIcon className={styles['bx-icon']} />
                  </span>
                  <span>
                    <StarIcon className={styles['bx-icon']} />
                  </span>
                  <span>
                    <StarIcon className={styles['bx-icon']} />
                  </span>
                  <span>
                    <StarIcon className={styles['bx-icon']} />
                  </span>
                  <span>
                    <StarIcon className={`${styles['bx-icon']} ${styles['inactive']}`} />
                  </span>
                </div>
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
      ) : (
        <video src={card.video} autoPlay={true} loop className={styles.clip}></video>
      )}
    </div>
  );
};

export default DestinationCardSubComponent;
