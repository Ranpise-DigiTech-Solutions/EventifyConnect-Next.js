import { default as express } from 'express';
const router = express.Router();
import { firebaseStorage } from '../database/FirebaseDb.js';
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { customerMaster } from '../models/index.js';

router.get("/", async (req, res) => {
    const filter = {};

    try {
        const customerDetails = await customerMaster.find(filter);

        if(!customerDetails) {
            return res.status(404).json({message: "No Records Found"});
        }

        return res.status(200).json(customerDetails); 
    } catch(error) {
        return res.status(500).json({message: error.message});
    }
});

// get the total hall owner count
router.get("/getCustomerCount", async(req, res) => {

    const filter = {};

    try {
        const customerCount = await customerMaster.countDocuments(filter);

        if(typeof customerCount !== "number") {
            return res.status(501).json({message: "Connection to server failed."});
        }

        return res.status(200).json(customerCount);
    } catch(error) {
        return res.status(500).json({message: error.message});
    }
});

router.get("/:customerId", async (req, res) => {
    const customerId = req.params.customerId;

    try {
        const customer = await customerMaster.findById(customerId);

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        return res.status(200).json(customer);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.post("/", async (req, res) => { 
    const newDocument = new customerMaster(req.body);

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
router.patch('/:customerId', async (req, res) => {
    console.log(req.body);
    const customerId = req.params.customerId;
    const updatedData = req.body;

    try {
        const updatedCustomer = await customerMaster.findByIdAndUpdate(
            { _id: customerId},
            { $set: updatedData },
            { new: true ,upsert: true}
        );

        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        return res.status(200).json(updatedCustomer);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


router.patch('/uploadUserImage', async (req, res) => {
    try {
        // Check if required fields are present in the request
        if (!req.files || !req.files.customerProfileImage) {
            return res.status(400).send('No image file was uploaded.');
        }

        const { userType, userId } = req.query;
        const file = req.files.customerProfileImage;
        const folderName = userType;
        const userProfileFolder = `${folderName}/userProfile`;
        const fileName = `${userProfileFolder}/${userId}/${Date.now()}_${file.name}`;
        const firebaseFile = firebaseStorage.ref().child(fileName);

        // Upload the file to Firebase Storage
        const snapshot = await firebaseFile.put(file.data);

        // Get the public download URL
        const downloadURL = await snapshot.ref.getDownloadURL();

        // Ensure userId is in the correct ObjectId format
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid userId format' });
        }

        // Update the customer document with the download URL
        const updatedDocument = await customerMaster.findByIdAndUpdate(
            userId,
            { customerProfileImage: downloadURL },
            { new: true }
        );

        if (!updatedDocument) {
            return res.status(404).json({ message: "Document not found!" });
        }

        return res.status(200).json(updatedDocument);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Something went wrong');
    }
});

router.post('/updateCustomerData', async (req, res) => {

    console.log("Entered updateCustomer")

    const documentId = req.query.documentId;
    const customerData = req.body;
    const userId = req.query.userId;

    if(!customerData || !userId || !documentId) {
        return res.status(404).json({message: "Required Fields missing in the Request body!!"});
    }

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
        return res.status(400).json({ message: "Invalid documentId format!" });
    }

    const documentObjectId = new mongoose.Types.ObjectId(documentId);

    try {
        const postBody = {
            ...customerData,
        }

        const updatedDocument = await customerMaster.findByIdAndUpdate(
            documentObjectId,
            postBody,
            { new: true }
        );
        
        if (!updatedDocument) {
            return res.status(404).json({ message: "Document not found!" });
        }
        
        return res.status(200).json(updatedDocument);
    } catch(error) {
        return res.status(500).json(error.message);
    }
});




export default router;