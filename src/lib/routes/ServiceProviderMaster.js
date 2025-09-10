import { default as express } from 'express';
const router = express.Router();
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

import { serviceProviderMaster } from '../models/index.js';
import { firebaseStorage } from '../database/FirebaseDb.js';
router.get("/", async (req, res) => {
    const filter = {};

    try {
        const serviceProviderDetails = await serviceProviderMaster.find(filter);

        if(!serviceProviderDetails) {
            return res.status(404).json({message: "No Records Found"});
        }

        return res.status(200).json(serviceProviderDetails); 
    } catch(error) {
        return res.status(500).json({message: error.message});
    }
});

  
router.get("/getServiceProviderDetails", async (req, res) => {
    const serviceProviderId = req.query.serviceProviderId;

    try {
        const serviceProvider = await serviceProviderMaster.findById(serviceProviderId);

        if (!serviceProvider) {
            return res.status(404).json({ message: "Customer not found" });
        }

        return res.status(200).json(serviceProvider);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.patch('/:serviceProviderId', async (req, res) => {
    const serviceProviderId = req.params.serviceProviderId;
    const updatedData = req.body;
    
    try {
        const updatedServiceProvider = await serviceProviderMaster.findByIdAndUpdate(
            { _id: serviceProviderId }, // Query for finding the document
            { $set: updatedData }, // Use $set operator to update existing fields and add new ones
            { new: true, upsert: true } // Set new and upsert options to true
        );

        if (!updatedServiceProvider) {
            return res.status(404).json({ message: 'Service provider not found' });
        }

        return res.status(200).json(updatedServiceProvider);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


router.post("/", async (req, res) => { 
    const newDocument = new serviceProviderMaster(req.body);

    if(!newDocument) {
        return res.status(404).json({message: "Request Body attachment not found!!"});
    }

    try {
        const savedDocument = await newDocument.save();
        return res.status(200).json(savedDocument);
    } catch(err) {
        return res.status(500).json(err);
    }
});

router.patch('/uploadUserImage/:userId', async (req, res) => {
    
    try {
       
        // Check if required fields are present in the request
        if (!req.files || !req.files.image) {
            return res.status(400).send('Required fields are missing.');
        }

        const userId = req.params.userId;
        const file = req.files.image;
        const userProfileFolder = `VENDOR/userProfile`;
        const fileName = `${userProfileFolder}/${userId}/${Date.now()}_${file.name}`;
        const firebaseFile = firebaseStorage.ref().child(fileName);

        // Upload the file to Firebase Storage
        await firebaseFile.put(file.data);

        // Get the public download URL
        const downloadURL = await firebaseFile.getDownloadURL();

        // Update the user document with the download URL
        const updatedDocument = await serviceProviderMaster.findByIdAndUpdate(
            userId,
            { serviceProviderProfileImage: downloadURL }, // Assuming this is the correct field to update
            { new: true }
        );

        if (!updatedDocument) {
            return res.status(404).json({ message: "User not found!" });
        }

        return res.status(200).json(updatedDocument);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Something went wrong');
    }
});

export default router;