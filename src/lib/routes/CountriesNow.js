import { default as express } from 'express';
const router = express.Router();
import axios from 'axios';

router.get('/getCitiesOfCountry', async(req, res)=> {
    const { countryName } = req.query;
    try {
        const apiURL = `https://countriesnow.space/api/v0.1/countries`;
        
        const response = await axios.get(apiURL);
        
        if (!response) {
            return res.status(502).json({message: "Bad Gateway! Received Invalid response from CountriesNow Server"});
        }

        const formatCity = (city, country) => `${city}, ${country}`;
        const indianCities = response.data.data
        .filter(({ country }) => country === countryName)
        .map(({ country, cities }) => cities.map(city => formatCity(city, country)))
        .flat();
        
        // const formattedCities = response.data.data.flatMap(({ country, cities }) =>
        //     cities.map(city => formatCity(city, country))
        // );

        return res.status(200).json(indianCities); 
    } catch(error) {
        return res.status(500).json({message: error.message});
    }
});

router.get('/getCountries', async(req, res)=> {
    try {
        const apiURL = `https://countriesnow.space/api/v0.1/countries/positions`;
        
        const response = await axios.get(apiURL);
        
        if (!response) {
            return res.status(502).json({message: "Bad Gateway! Received Invalid response from CountriesNow Server"});
        }

        const countries = [];

        response.data.data?.map(country => countries.push(country?.name));

        if (!countries) {
            return res.status(502).json({message: "Bad Gateway! Received Invalid response from CountriesNow Server"});
        }

        return res.status(200).json(countries); 
    } catch(error) {
        return res.status(500).json({message: error.message});
    }
});

router.get('/getStates', async(req, res)=> {

    const { countryName } = req.query;

    try {
        const apiURL = `https://countriesnow.space/api/v0.1/countries/states`;

        const reqBody = {
            "country": countryName
        }
        
        const response = await axios.post(apiURL, reqBody);
        
        if (!response) {
            return res.status(502).json({message: "Bad Gateway! Received Invalid response from CountriesNow Server"});
        }

        const states = [];

        response.data.data?.states?.map(state => states.push(state?.name));

        if (!states) {
            return res.status(502).json({message: "Bad Gateway! Received Invalid response from CountriesNow Server"});
        }

        return res.status(200).json(states); 
    } catch(error) {
        return res.status(500).json({message: error.message});
    }
});

router.get('/getCitiesOfState', async(req, res)=> {

    const { countryName, stateName } = req.query;

    try {
        const apiURL = `https://countriesnow.space/api/v0.1/countries/state/cities`;

        const reqBody = {
            "country": countryName,
            "state": stateName
        }
        
        const response = await axios.post(apiURL, reqBody);
        
        if (!response) {
            return res.status(502).json({message: "Bad Gateway! Received Invalid response from CountriesNow Server"});
        }

        const cities = response.data?.data;

        if (!cities) {
            return res.status(502).json({message: "Bad Gateway! Received Invalid response from CountriesNow Server"});
        }

        return res.status(200).json(cities); 
    } catch(error) {
        return res.status(500).json({message: error.message});
    }
});

export default router;