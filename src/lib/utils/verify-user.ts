import axios from 'axios';

export const verifyUserByEmail = async (emailId: string): Promise<boolean> => {

    try {
      // The API call is now made without the reCAPTCHA token header.
      const response = await axios.get(`/api/routes/userAuthentication/checkUserExistence/?emailId=${emailId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // This is kept in case it's needed for other authentication
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
