import { default as express } from 'express';
const router = express.Router();
import pkg from 'gpt4all';
const { GPT4ALL } = pkg;

import { collection, addDoc, query, getDocs } from 'firebase/firestore';
import { firestore } from '../database/FirebaseDb.js';


router.get("/", async (req, res) => {

    const { sessionId } = req.query;

    if (!sessionId) {
        return res.status(404).json({message: "No Records Found! Query parameters empty!!"});
    }

    try {
        const messagesQuery = query(collection(firestore, `/chats/SessionID_${sessionId}/Messages/`));
        const querySnapshot = await getDocs(messagesQuery);
        const fetchedMessages = querySnapshot.docs.map((doc) => doc.data());

        return res.status(200).json(fetchedMessages);

    } catch(error) {
        console.log(error);
        return res.status(500).json({message: error.message});
    }
});

router.post("/", async (req, res) => {

    const { sessionId, inputValue, sender } = req.body;
    
    if(!sessionId || !inputValue || !sender) {
        return res.status(404).json({message: "Request Body attachment not found!!"});
    }

    try {
        const docRef = await addDoc(collection(firestore, `/chats/SessionID_${sessionId}/Messages/`), {
            content: inputValue,
            sender ,
            timestamp: new Date().toISOString(),
          });
          console.log('Document written with ID: ', docRef.id);

          return res.status(200).json({message: "Document Upload Successfull!!"});

    } catch (error) {
        return res.status(500).json({message: error.message});
    }
});

router.get("/getResponse", async (req, res) => {

    try {

        const gpt4all = new GPT4ALL({
            model: 'gpt4all-j', // Choose the desired model
        });
        const prompt = 'Tell me about React.';
        const response = await gpt4all.generate(prompt);
        console.log('GPT4ALL Response:', response);
        return res.status(200).json(response);

    }catch (error) {
        return res.status(500).json(error);
    }
});

export default router;