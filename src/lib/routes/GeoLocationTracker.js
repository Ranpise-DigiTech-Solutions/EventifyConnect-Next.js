import { default as express } from 'express';
const router = express.Router();

router.get("/getCityName", async(req, res) => {

    const { latitude, longitude } = req.query;
    const hereAppId = process.env.HERE_APP_ID;
    const hereApiKey = process.env.HERE_API_KEY;

    try {
        const apiUrl = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&apiKey=${hereApiKey}&appCode=${hereAppId}`;
        fetch(apiUrl)
          .then(response => response.json())
          .then(data => {

            const cityName = data["items"][0]["address"]["city"];
            const countryName = data["items"][0]["address"]["countryName"];
            return res.status(200).json(cityName + ", " + countryName);

          })
          .catch(error => ('Error:', error));
    } catch(error) {
        return res.status(500).json({message: error.message});
    }
});

export default router;