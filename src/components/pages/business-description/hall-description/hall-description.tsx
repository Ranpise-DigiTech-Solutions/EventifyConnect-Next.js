import React from 'react';

import ReactStars from "react-stars";
import Carousel from "react-multi-carousel";
import PropTypes from "prop-types";

import { FaMapMarkerAlt } from "react-icons/fa";
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { FaPenNib } from "react-icons/fa6";

import styles from './hall-description.module.scss';

// @TODO: Handle error condition for hallData if its not in proper format
type Props = {
    hallData: any
}

const HallDescriptionComponent = ({ hallData }: Props) => {
  
    const responsive = {
        desktop: {
          breakpoint: { max: 3000, min: 1024 },
          items: 1,
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

      // Render component JSX
      return (
        <>
          <div className={styles.hallDescription__container}>
            <div className={styles.slider__wrapper}>
              <Carousel
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
                arrows={true}
                containerClass={styles['carousel-container']}
              >
                {hallData && hallData.hallImages && hallData.hallImages.map((image : string, index: number) => (
                  <img src={image} key={index} alt="Img" />
                ))}
              </Carousel>
            </div>
            <div className={styles.quickinfo}>
              <h2>{hallData.hallName}</h2>
              <h3 className={styles.location}>
                <a href="https://www.google.com/maps/dir//TMA+Pai+Convention+Centre,+MG+Rd,+Kodailbail,+Mangaluru,+Karnataka+575003/@12.8803793,74.7986391,13z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3ba35a44b7805283:0xbb55b8b40db48da!2m2!1d74.8398387!2d12.8803825?entry=ttu">
                  <FaMapMarkerAlt /> {hallData.hallTaluk}, {hallData.hallCity}, {hallData.hallState}
                </a>
              </h3>
              <div className={styles['stars-container']}>
                <ReactStars
                  count={5}
                  value={4} // Initially set to 4 stars
                  size={40}
                  color2={"#ffd700"}
                  edit={false}
                  className={styles['stars-icon']}
                />
              </div>
              <div className={styles.menu__wrapper}>
                <div className={`${styles.photosMenu} ${styles.menuOption}`}>
                  <PhotoLibraryIcon className={styles.icon} />
                  <p>10 Photos</p>
                </div>
                <div className={styles.verticalLine}></div>
                <div className={`${styles.favouriteMenu} ${styles.menuOption}`}>
                  <FavoriteBorderOutlinedIcon className={styles.icon} />
                  <p>Shortlist</p>
                </div>
                <div className={styles.verticalLine}></div>
                <div className={`${styles.reviewMenu} ${styles.menuOption}`}>
                  <FaPenNib className={styles.icon} />
                  <p>Write a Review</p>
                </div>
                <div className={styles.verticalLine}></div>
                <div className={`${styles.shareMenu} ${styles.menuOption}`}>
                  <ShareOutlinedIcon className={styles.icon} />
                  <p>Share</p>
                </div>
              </div>
            </div>
          </div>
        </>
      );
}

export default HallDescriptionComponent