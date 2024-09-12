// src/hooks/useRecaptcha.ts
import { useEffect, useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const useRecaptcha = () => {
  const [token, setToken] = useState<string | null>(null);
  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {

    const getToken = async ()=> {
      if(!executeRecaptcha) {
        return null;
      } else {
        const token = await executeRecaptcha('inquirySubmit');
        setToken(token);
      }
    }

    getToken();

  }, [executeRecaptcha]); 
  // 
  return token;
};

export default useRecaptcha;
