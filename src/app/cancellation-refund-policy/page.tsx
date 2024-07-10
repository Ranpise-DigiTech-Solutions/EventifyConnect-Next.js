import React from 'react'
import styles from './page.module.scss';

type Props = {}

const CancellationAndRefundPolicy = (props: Props) => {
  return (
    <div className={styles.cancellationPolicy__container}>
    <h1 className={styles.heading}>Cancellation & Refund Policy</h1>
    <div className={styles.summary}>
      <p>
        Any Cancellation time-frame to avoid any penalty is the sole
        discretion of the Hall owner. This needs to be discussed between
        customer and the hall owner. We are no way responsible for this.
      </p>
      <br />
      <p>
        Any fees or penalties that may apply for cancellations made outside of
        the specified cancellation period. This needs to be discussed between
        customer and the hall owner Issuing refunds in the event of a
        cancellation is between customer and the hall owner.
      </p>
      <br />
      <p>
        The detailed instruction on Process relating to cancelling any booking
        will be provided in the website. Certain non-refundable products,
        services, or promotional offers may have different cancellation
        policies. This is between the customer and hall owner or vendor
        Contact information for users to reach out with questions or concerns
        about cancellations, refunds, or the cancellation policy in general
        Will be provided.
      </p>
    </div>
  </div>
  )
}

export default CancellationAndRefundPolicy