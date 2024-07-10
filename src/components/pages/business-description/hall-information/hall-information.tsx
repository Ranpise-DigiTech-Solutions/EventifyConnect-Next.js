import React from 'react';

import styles from './hall-information.module.scss';

type Props = {}

const HallInformationContainer = (props: Props) => {
    return (
        <div className={styles.HallInformation__container}>
          {/* Ambience Section */}
          <h2>AMBIENCE</h2>
          <p>The ambience of our hall is meticulously crafted to provide a luxurious and elegant atmosphere for your event. With tasteful decor and subtle lighting, we ensure a memorable experience for you and your guests.</p>
          <hr />
    
          {/* Food & Service Section */}
          <h2>FOOD & SERVICE</h2>
          <p>Indulge in a culinary journey with our exquisite food offerings prepared by our skilled chefs. Our attentive staff is dedicated to providing impeccable service, ensuring that every detail of your dining experience is perfect.</p>
          <hr />
    
          {/* Hotel Policies Section */}
          <h2>HOTEL POLICIES</h2>
          <p>
            Before booking our hall, please take note of our hotel policies to ensure a smooth and enjoyable event. We prioritize the comfort and safety of all our guests and have established guidelines to maintain a pleasant environment for everyone.
          </p>
          <ul>
            <li>No outside food or beverages are allowed.</li>
            <li>Smoking is strictly prohibited in all indoor areas.</li>
            <li>No pets are allowed on the premises.</li>
            <li>Guests are responsible for any damages to the property.</li>
            <li>No loud music or noise after 10 PM.</li>
          </ul>
          <hr />
        </div>
      );
}

export default HallInformationContainer