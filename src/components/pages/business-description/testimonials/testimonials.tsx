import React from 'react'

import { TestimonialsBox } from '@/components/sub-components';
import styles from './testimonials.module.scss';

type Props = {}

const TestimonialsComponent = (props: Props) => {
    return (
        <section className={styles.testimonials__container}>
          <div className={styles['testimonial-heading']}>
            <span>Latest Review</span>
            <h4>What Clients Say</h4>
          </div>
          <div className={styles['testimonial-box-container']}>
            <TestimonialsBox
              name="Liam Mendes"
              userName="liammendes"
              avatarSrc="https://cdn3.iconfinder.com/data/icons/avatars-15/64/_Ninja-2-512.png"
              comment="Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem, quaerat quis? Provident temporibus architecto asperiores nobis maiores nisi a. Quae doloribus ipsum aliquam tenetur voluptates incidunt blanditiis sed atque cumque."
              stars={4}
            />
            <TestimonialsBox
              name="Noah Wood"
              userName="noahwood"
              avatarSrc="https://cdn3.iconfinder.com/data/icons/avatars-15/64/_Ninja-2-512.png"
              comment="Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem, quaerat quis? Provident temporibus architecto asperiores nobis maiores nisi a. Quae doloribus ipsum aliquam tenetur voluptates incidunt blanditiis sed atque cumque."
              stars={5}
            />
            <TestimonialsBox
              name="Oliver Queen"
              userName="oliverqueen"
              avatarSrc="https://cdn3.iconfinder.com/data/icons/avatars-15/64/_Ninja-2-512.png"
              comment="Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem, quaerat quis? Provident temporibus architecto asperiores nobis maiores nisi a. Quae doloribus ipsum aliquam tenetur voluptates incidunt blanditiis sed atque cumque."
              stars={4}
            />
            <TestimonialsBox
              name="Barry Allen"
              userName="barryallen"
              avatarSrc="https://cdn3.iconfinder.com/data/icons/avatars-15/64/_Ninja-2-512.png"
              comment="Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem, quaerat quis? Provident temporibus architecto asperiores nobis maiores nisi a. Quae doloribus ipsum aliquam tenetur voluptates incidunt blanditiis sed atque cumque."
              stars={4}
            />
          </div>
        </section>
      );
}

export default TestimonialsComponent