import React from 'react'
import Image from 'next/image';

import VisibilityIcon from "@mui/icons-material/Visibility";

import styles from './stories.module.scss';

type Props = {}

const StoriesContainer = (props: Props) => {
    return (
        <div className={styles.storiesComponent__container}>
          <div className={styles.stories__wrapper}>
            <h4 className={styles.sub_title}>stories</h4>
            <h2 className={styles.title}>real wedding stories</h2>
            <div className={styles.gallery__wrapper}>
              <a href="#" className={`${styles.gallery_item} ${styles.gallery_item_1}`}>
                <img src={"/images/wedding0.jpg"} alt="Story1" />
                <div className={styles.content}>
                  <h4 className={styles.story_title}>Rajesh and Aishwarya</h4>
                  <p className={styles.story_desc}>
                    We recently celebrated our wedding at Parivar hall Ullal, and it
                    was an absolutely magical experience from start to finish.
                  </p>
                  <VisibilityIcon className={styles.icon} />
                </div>
              </a>
              <a href="#" className={`${styles.gallery_item} ${styles.gallery_item_2}`}>
                <img src={"/images/wedding1.jpg"} alt="Story2"/>
                <div className={styles.content}>
                  <h4 className={styles.story_title}>Sumit and Neeta</h4>
                  <p className={styles.story_desc}>
                    We recently celebrated our wedding at AB shetty hall
                    mangalore,the whole function finished beyond my expectation.
                  </p>
                  <VisibilityIcon className={styles.icon} />
                </div>
              </a>
              <a href="#" className={`${styles.gallery_item} ${styles.gallery_item_3}`}>
                <img src={"/images/birthday01.png"} alt="Story3"/>
                <div className={styles.content}>
                  <h4 className={styles.story_title}>Rahul</h4>
                  <p className={styles.story_desc}>
                    I recently had the pleasure of celebrating my 30th birthday at
                    the AB shetty Banquet Hall, and it was an unforgettable
                    experience from start to finish.
                  </p>
                  <VisibilityIcon className={styles.icon} />
                </div>
              </a>
              <a href="#" className={`${styles.gallery_item} ${styles.gallery_item_4}`}>
                <img src={"/images/wedding4.jpg"} alt="Story4"/>
                <div className={styles.content}>
                  <h4 className={styles.story_title}>Ajith and Neha</h4>
                  <p className={styles.story_desc}>
                    We recently celebrated our wedding at Parivar hall Ullal, We
                    couldn&apos;t have asked for a better venue or team to celebrate
                    such an important milestone in our lives.
                  </p>
                  <VisibilityIcon className={styles.icon} />
                </div>
              </a>
              <a href="#" className={`${styles.gallery_item} ${styles.gallery_item_5}`}>
                <img src={"/images/anniversary01.png"} alt="Story5"/>
                <div className={styles.content}>
                  <h4 className={styles.story_title}>Adithya</h4>
                  <p className={styles.story_desc}>
                    We recently celebrated our 25th wedding anniversary at the
                    Crystal Palace Banquet Hall, and it was an evening that exceeded
                    all our expectations.
                  </p>
                  <VisibilityIcon className={styles.icon} />
                </div>
              </a>
            </div>
          </div>
        </div>
      );
}

export default StoriesContainer