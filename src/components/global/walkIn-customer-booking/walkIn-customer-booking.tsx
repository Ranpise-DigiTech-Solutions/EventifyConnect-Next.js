import React from 'react'

type Props = {
    open: boolean;
    handleClose: () => void;
    hallData: any;
    serviceProviderData: any;
}

const WalkInCustomerBookingDialogComponent = ({ open, handleClose, hallData, serviceProviderData }: Props) => {
  return (
    <div>WalkInCustomerBookingDialogComponent</div>
  )
}

export default WalkInCustomerBookingDialogComponent