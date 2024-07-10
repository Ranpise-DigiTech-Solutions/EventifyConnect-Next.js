import React from 'react';
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
 // Dynamically generate star icons based on the number of stars
 const starIcons = [];
 for (let i = 0; i < stars; i++) {
   starIcons.push(<i key={i} className="fas fa-star"></i>);
 }
 // If stars are less than 5, add empty stars
 if (stars < 5) {
   for (let i = stars; i < 5; i++) {
     starIcons.push(<i key={i} className="far fa-star"></i>);
   }
 }

 return (
   <div className={styles['testimonial-box__sub-container']}>
     <div className={styles['box-top']}>
       <div className={styles.profile}>
         <div className={styles['profile-img']}>
           <Image src={avatarSrc} alt="Profile" width={50} height={50} layout={"responsive"}/>
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

export default TestimonialsBoxSubContainer