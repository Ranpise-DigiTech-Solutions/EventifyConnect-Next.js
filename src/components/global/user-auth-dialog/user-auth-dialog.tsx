import React from 'react'

type Props = {
    open: boolean;
    handleClose: () => void;
    handleRegistrationDialogOpen: () => void;
}

const UserAuthDialogComponent = ({ open, handleClose, handleRegistrationDialogOpen }: Props) => {
  return (
    <div>UserAuthDialogComponent</div>
  )
}

export default UserAuthDialogComponent