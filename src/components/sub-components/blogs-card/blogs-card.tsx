import React from 'react'
import Image from 'next/image';

import styles from './blogs-card.module.scss';

type Props = {
    card: {
        image: string,
        date: string,
        categorized: boolean,
        title: string,
        description: string
    }
}

const BlogsCard = ({ card }: Props) => {
    return (
        <div className={styles.blogcard__container}>
          <Image src={card.image} alt="" height={350} width={1000} />
          <div className={styles.contents}>
            <h4 className={styles.tag}>{`${card.date} | ${card.categorized ? 'categorized' : 'uncategorized'}`}</h4>
            <h3 className={styles.card__title}>{card.title}</h3>
            <p className={styles.card__description}>{card.description}</p>
          </div>
        </div>
      )
}

export default BlogsCard