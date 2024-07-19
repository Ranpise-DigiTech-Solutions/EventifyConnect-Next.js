// components/ReCaptchaInvisible.tsx

import React, { useEffect, useState } from 'react';

interface ReCaptchaInvisibleProps {
  sitekey: string;
  onVerify: (token: string) => void;
}

const ReCaptchaInvisible: React.FC<ReCaptchaInvisibleProps> = ({ sitekey, onVerify }) => {
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  useEffect(() => {
    const loadRecaptchaScript = () => {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${sitekey}`;
      script.onload = () => setRecaptchaLoaded(true);
      document.body.appendChild(script);
    };

    loadRecaptchaScript();
  }, [sitekey]);

  const handleVerify = () => {
    if (window.grecaptcha) {
      window.grecaptcha.execute(sitekey, { action: 'submit' }).then((token: string) => {
        onVerify(token);
      });
    }
  };

  return (
    <button onClick={handleVerify} disabled={!recaptchaLoaded}>
      Verify with reCAPTCHA
    </button>
  );
};

export default ReCaptchaInvisible;
