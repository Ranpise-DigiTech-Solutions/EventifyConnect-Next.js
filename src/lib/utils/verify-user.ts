import axios from 'axios';

export const verifyUserByEmail = async (emailId: string, captchaToken: string): Promise<boolean> => {

    try {
      const response = await axios.get(`/api/routes/userAuthentication/checkUserExistence/?emailId=${emailId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Captcha-Token": captchaToken,
          },
          withCredentials: true, // Include credentials (cookies, authorization headers, TLS client certificates)
        });
      if(response?.data?.exists === true) {
        // User exists
        return true;
      } else {
        // User does not exist
        return false;
      }
    } catch (error) {
      // User does not exist
      console.error('User does not exist:', error);
      return false;
    }
  };