// components/ReCaptchaCheckbox.tsx

import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaCheckboxProps {
  sitekey: string;
  onChange: (token: string | null) => void;
}

const ReCaptchaCheckbox: React.FC<ReCaptchaCheckboxProps> = ({ sitekey, onChange }) => {
  const handleRecaptchaChange = (token: string | null) => {
    onChange(token);
  };

  return (
    <ReCAPTCHA
      sitekey={sitekey}
      onChange={handleRecaptchaChange}
    />
  );
};

export default ReCaptchaCheckbox;
