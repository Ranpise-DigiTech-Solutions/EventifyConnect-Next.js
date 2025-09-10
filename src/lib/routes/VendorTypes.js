import { default as express } from 'express';
const router = express.Router();

import { vendorTypes } from '../models/index.js';

router.get("/", async (req, res) => {
    try {
        const filter = {}

        const vendorDetails = await vendorTypes.find(filter);

        if(!vendorDetails) {
            return res.status(404).json({message: "No Records Found"});
        }

        return res.status(200).json(vendorDetails); 
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
});

router.post("/", async (req, res) => { 
    const newDocument = new vendorTypes(req.body);

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

router.get("/getVendorTypeId", async (req, res) => {

    const { vendorType } = req.query;

    if (!vendorType) {
        return res.status(404).json({message: "No Records Found! Query parameters empty!!"});
    }

    try {
        var document = await vendorTypes.findOne({ "vendorType": vendorType });

        if (document) {
            var documentId = document._id;
            return res.status(200).json(documentId);
        } else {
            return res.status(404).json({message: "Not Found! No documents match your condition!"});
        }

    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}); 

export default router;