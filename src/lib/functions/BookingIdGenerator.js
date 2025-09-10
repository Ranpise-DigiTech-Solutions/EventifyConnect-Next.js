/* eslint-disable linebreak-style */
/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable linebreak-style */
const functions = require("firebase-functions/v2");
const logger = require("firebase-functions/logger");
const {doc, getDoc, updateDoc} = require('firebase/firestore');
const {firestore} = require("../database/FirebaseDb.js");

const {onRequest} = functions.https;


module.exports.bookingIdGenerator = onRequest(async (req, res) => {
    try {
        const docRef = doc(firestore, "counters", "bookingMasterId");
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            logger.error('bookingIdGenerator', 'Document does not exist!');
            return res.status(404).send("Document not found!");
        }

        const data = docSnap.data();
        const prevId = data.currentId;
        const newId = prevId + 1;

        // Update the Firestore document with the new ID
        await updateDoc(docRef, {currentId: newId});

        logger.info('bookingIdGenerator', `Generated ID: ${newId}`);

        // Return the new ID in JSON format
        return res.status(200).json({id: newId});
    } catch (err) {
        logger.error('bookingIdGenerator', err.message);
        return res.status(500).send("Internal server error");
    }
});
