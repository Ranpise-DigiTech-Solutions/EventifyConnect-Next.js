"use client"

import React, { useRef } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { motion } from 'framer-motion';
import { DestinationsCard } from '@/components/sub-components';

import styles from './destinations.module.scss';

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 1.75,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 1,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

const cardsData = {
  card1: {
    discount: '20% off',
    new: true,
    stars: 4,
    reviews: 2,
    title: 'Autumn in Japan | $3,500',
    img: "/images/Hall_01.jpg",
    video:
      'https://v4.cdnpk.net/videvo_files/video/free/video0483/large_watermarked/_import_60d962f06b3ef8.86089157_FPpreview.mp4',
    description:
      '6 excursions to the main cities of the country, admire the beautiful autumn season',
    deadline: '7 days',
  },
  card2: {
    discount: '20% off',
    new: false,
    stars: 4,
    reviews: 4,
    title: 'Autumn in Japan | $3,500',
    img: "/images/Hall_02.jpg",
    video: '',
    description:
      '6 excursions to the main cities of the country, admire the beautiful autumn season',
    deadline: '7 days',
  },
  card3: {
    discount: '25% off',
    new: true,
    stars: 5,
    reviews: 5,
    title: 'Autumn in Japan | $3,500',
    img: "/images/Hall_03.jpg",
    video:
      'https://v4.cdnpk.net/videvo_files/video/free/video0483/large_watermarked/_import_60d962f06b3ef8.86089157_FPpreview.mp4',
    description:
      '6 excursions to the main cities of the country, admire the beautiful autumn season',
    deadline: '7 days',
  },
  card4: {
    discount: '40% off',
    new: false,
    stars: 4,
    reviews: 2,
    title: 'Autumn in Japan | $3,500',
    img: "/images/Hall_04.jpg",
    video: '',
    description:
      '6 excursions to the main cities of the country, admire the beautiful autumn season',
    deadline: '7 days',
  },
  card5: {
    discount: '20% off',
    new: true,
    stars: 5,
    reviews: 10,
    title: 'Autumn in USA | $8,500',
    img: "/images/Hall_05.jpg",
    video:
      'https://v4.cdnpk.net/videvo_files/video/free/video0483/large_watermarked/_import_60d962f06b3ef8.86089157_FPpreview.mp4',
    description:
      '6 excursions to the main cities of the country, admire the beautiful autumn season',
    deadline: '7 days',
  },
  card6: {
    discount: '20% off',
    new: true,
    stars: 5,
    reviews: 10,
    title: 'Autumn in USA | $8,500',
    img: "/images/Hall_06.jpg",
    video: '',
    description:
      '6 excursions to the main cities of the country, admire the beautiful autumn season',
    deadline: '7 days',
  },
};

const Destinations = () => {
  const cardsArray = Object.values(cardsData);
  const carouselRef = useRef<Carousel>(null);

  const handleCustomPrevClick = () => {
    if (carouselRef.current) {
      const currentSlide = carouselRef.current.state.currentSlide;
      const totalSlides = carouselRef.current.state.totalItems;
      const targetSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
      carouselRef.current.goToSlide(targetSlide);
    }
  };

  const handleCustomNextClick = () => {
    if (carouselRef.current) {
      carouselRef.current.goToSlide(carouselRef.current.state.currentSlide + 1);
    }
  };

  return (
    <div className={`${styles.main__container} ${styles.destinations__container}`} id="destinations">
      <div className={styles.destination__wrapper}>
        <div className={styles.sub__wrapper_1}>
          <p className={styles.caption}>popularity</p>
          <div className={styles.wrapper}>
            <div className={styles.title}>
              <h2>
                most popular <br /> marriage destinations
              </h2>
            </div>

            <div className={styles.navigation__buttons}>
              <button className={`${styles.main__button} ${styles.button}`} title='mainBtn'>view all tours</button>

              <button className={`${styles.arrow__buttons} ${styles.button}`} title='arrowBtn1' onClick={handleCustomPrevClick}>
                <ArrowBackIcon />
              </button>

              <button className={`${styles.arrow__buttons} ${styles.button}`} title='arrowBtn2' onClick={handleCustomNextClick}>
                <ArrowForwardIcon />
              </button>
            </div>
          </div>
        </div>
        <div className={styles.sub__wrapper_2}>
          <Carousel
            ref={carouselRef}
            responsive={responsive}
            dotListClass="custom-dot-list-style"
            itemClass="carousel-item-padding-40-px"
            swipeable={true}
            draggable={false}
            infinite={true}
            autoPlay={true}
            autoPlaySpeed={4000}
            keyBoardControl={false}
            slidesToSlide={1}
            arrows={false}
            renderButtonGroupOutside
            containerClass="carousel-container"
          >
            {cardsArray.map((card, index) => (
              <motion.div className={styles.card} key={index}>
                <DestinationsCard key={index} card={card} />
              </motion.div>
            ))}
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default Destinations;
