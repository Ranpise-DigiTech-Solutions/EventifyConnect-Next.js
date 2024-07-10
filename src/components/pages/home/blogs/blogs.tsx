import React from "react";
import { BlogsCard } from "@/components/sub-components";
import styles from "./blogs.module.scss";

type Props = {};

const cardsArray = {
  blog1: {
    title: "Best bridal wear stores!",
    image: "/images/blogs01.jpg",
    description:
      "Bridal shopping in Bangalore? Well, then chances are you'll have to visit Commercial Street, which is bridal...",
    categorized: true,
    date: "june 11/2019",
  },
  blog2: {
    title: "cool new baraat ideas that are LIT!",
    image: "/images/blogs02.jpg",
    description:
      "Why have the same old Braat that probably everyone in your wedding has already danced to, including you...",
    categorized: true,
    date: "june 6/2019",
  },
};

const Blogs = (props: Props) => {
  return (
    <div className={`${styles.main__container} ${styles.blogs__container}`}>
      <h3 className={styles.sub__title}>blogs</h3>
      <h2 className={styles.title}>Marriage articles</h2>
      <p className={styles.description}>
        Unlocking the Secrets to a Blissful Marriage: Insights, Advice, and
        Inspiration Inside!
      </p>
      <div className={styles.articles__wrapper}>
        {Object.values(cardsArray).map((card, index) => (
          <div className={styles.card} key={index}>
            <BlogsCard key={index} card={card} />
          </div>
        ))}
      </div>
      <button>view all blogs</button>
    </div>
  );
};

export default Blogs;
