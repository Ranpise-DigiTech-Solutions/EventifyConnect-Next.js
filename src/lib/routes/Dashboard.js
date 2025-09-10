// Import necessary modules
import express from 'express';
import axios from 'axios';
import { firebaseStorage } from '../database/FirebaseDb.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Create a new router
const router = express.Router();

// Variable to store monthly visit data


// Function to update the visit count in Firebase Realtime Database and store monthly visit data
async function updateVisitCount(year, month) {
    const url = `https://chatbot-5f9b6-default-rtdb.firebaseio.com/userVisits/${year}.json`;

    try {
        // Fetch existing data
        const { data: existingData } = await axios.get(url);

        // Initialize count
        let newCount = 1;

        if (existingData && existingData[month]) {
            // Increment existing count
            newCount = existingData[month] + 1;
        }

        // Update the count in Firebase
        const response = await axios.patch(url, JSON.stringify({ [month]: newCount }));
      //  console.log('Update successful:', response.data);
        const { data: finalData } = await axios.get(url);
        // Update monthly visit data
        
        return finalData;
    } catch (error) {
        console.error('Failed to update data:', error);
    }
   
}

// Server Endpoint to provide real-time updates
router.get('/userVisits', async (req, res) => {
   // console.log('User visit endpoint called');

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // Adjusted to start from 1 for month
    let userVisits = 0;

    // Check if the session contains information about the user's visit
    if (!req.session.visited) {
      //  console.log('New visit detected');

        // If not visited, mark the visit and increment the visit count
        req.session.visited = true;
        userVisits = await updateVisitCount(currentYear, currentMonth);
    } else {
      //  console.log('Already visited');
    }

    // Send real-time updates to the client
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial visit count (not really necessary since we're updating in real-time)
    res.write(`data: ${JSON.stringify({ userVisits })}\n\n`);

    // Cleanup function to remove session on connection close
    req.on('close', () => {
        delete req.session.visited;
    });
    return res;
});



export default router;
