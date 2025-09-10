import React, { useMemo, forwardRef } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide, { SlideProps } from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";

type Props = {
  open: boolean;
  handleClose: () => void;
  message?: string; // Change to optional
};

// Use forwardRef and ensure the component signature matches TransitionProps
const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const UnderConstructionPopupSubComponent = ({
  open,
  handleClose,
  message,
}: Props) => {
  // Memoize the transition component to prevent unnecessary re-renders
  const MemoizedTransition = useMemo(() => Transition, []);
  
  // Handle the default message value inside the component
  const displayMessage = message || "This section is under construction. We will provide details soon.";

  return (
    <Dialog
      open={open}
      TransitionComponent={MemoizedTransition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>{"Alert"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          {displayMessage}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnderConstructionPopupSubComponent;