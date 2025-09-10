import React, { useMemo, memo } from 'react';
import Image from 'next/image';

import styles from './testimonials-box.module.scss';

type Props = {
    name: string,
    userName: string,
    avatarSrc: string,
    comment: string,
    stars: number,
}

const TestimonialsBoxSubContainer = ({ name, userName, avatarSrc, comment, stars }: Props) => {
    // Use useMemo to memoize the star icons. They will only be re-created
    // if the 'stars' prop changes.
    const starIcons = useMemo(() => {
        const icons = [];
        // Loop to render filled stars
        for (let i = 0; i < stars; i++) {
            icons.push(<i key={i} className="fas fa-star" />);
        }
        // Loop to render empty stars
        for (let i = stars; i < 5; i++) {
            icons.push(<i key={i} className="far fa-star" />);
        }
        return icons;
    }, [stars]);

    return (
        <div className={styles['testimonial-box__sub-container']}>
            <div className={styles['box-top']}>
                <div className={styles.profile}>
                    <div className={styles['profile-img']}>
                        {/* Use 'fill' with a parent div for better responsiveness */}
                        <Image 
                            src={avatarSrc} 
                            alt={`Profile picture of ${name}`}
                            fill
                            sizes="(max-width: 768px) 50px, (max-width: 1200px) 50px, 50px"
                            style={{ objectFit: 'cover', borderRadius: '50%' }}
                        />
                    </div>
                    <div className={styles['name-user']}>
                        <strong>{name}</strong>
                        <span>@{userName}</span>
                    </div>
                </div>
                <div className={styles.reviews}>{starIcons}</div>
            </div>
            <div className={styles['client-comment']}>
                <p>{comment}</p>
            </div>
        </div>
    );
}

// Wrap the component in React.memo to prevent unnecessary re-renders
export default memo(TestimonialsBoxSubContainer);