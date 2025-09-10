import { default as express } from 'express';
const router = express.Router();

import { eventTypes } from '../models/index.js';

router.post("/", async (req, res) => { 
    const newDocument = new eventTypes(req.body);

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

router.get("/", async (req, res) => {

    const filter = {};

    try {
        const eventDetails = await eventTypes.find(filter);

        if(!eventDetails) {
            return res.status(404).json({message: "No Records Found"});
        }

        return res.status(200).json(eventDetails); 
    } catch(error) {
        return res.status(500).json({message: error.message});
    }
});
router.get("/getEventName/:eventId", async (req, res) => {
    const { eventId } = req.params;

    try {
        const eventDetails = await eventTypes.findById(eventId);

        if (!eventDetails) {
            return res.status(404).json({ message: "No event found for the provided ID" });
        }

        const eventName = eventDetails.eventName;
        return res.status(200).json({ eventName });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


router.get("/getEventId", async (req, res) => {

    const { eventName } = req.query;

    if (!eventName) {
        return res.status(404).json({message: "No Records Found! Query parameters empty!!"});
    }

    try {
        var document = await eventTypes.findOne({ "eventName": eventName });

        if (document) {
            var documentId = document._id;
            return res.status(200).json(documentId);
        } else {
            return res.status(404).json({message: "Not Found! No documents match your condition!"});
        }

    } catch(error) {
        return res.status(500).json({message: error.message});
    }
});

router.get("/getEventIds", async (req, res) => {

    const { eventNames } = req.body;

    if (!eventNames || !Array.isArray(eventNames)) {
        return res.status(400).json({ message: "Invalid or missing eventNames parameter" });
    }

    try {
        const documents = await eventTypes.find({ "eventName": { $in: eventNames } });

        if (documents.length === 0) {
            return res.status(404).json({ message: "No documents found for the provided event names" });
        }

        // Create an object mapping event names to event IDs
        const eventIdsMap = {};
        documents.forEach((document) => {
            eventIdsMap[document.eventName] = document._id;
        });

        // Create an array of event IDs in the same order as the input event names
        const eventIds = eventNames.map((eventName) => eventIdsMap[eventName]);

        return res.status(200).json(eventIds);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

});

export default router;