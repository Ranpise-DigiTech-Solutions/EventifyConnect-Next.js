import React from 'react'

import styles from './location.module.scss';

type Props = {}

const LocationComponent = (props: Props) => {
    return (
        <div className={styles['location-container']}>
          <h2>Location</h2>
          <iframe
            width="100%"
            height="100%"
            src="https://maps.google.com/maps?width=100%&amp;height=600&amp;hl=en&amp;coord=52.70967533219885,-8.020019531250002&amp;q=1%20Grafton%20Street%2C%20Dublin%2C%20Ireland&amp;ie=UTF8&amp;t=&amp;z=14&amp;iwloc=B&amp;output=embed"
            title="Google Maps"
            style={{ border: 0, borderRadius: '10px' }}
            allowFullScreen
          ></iframe>
        </div>
      );
}

export default LocationComponent