import { default as express } from 'express';
const router = express.Router();
import { getDatabase, ref, set, get } from 'firebase/database';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword, 
    sendSignInLinkToEmail 
} from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '../database/FirebaseDb.js';
import { v4 as uuidv4 } from 'uuid';
import { serviceProviderMaster, customerMaster, vendorTypes } from '../models/index.js';
import axios from 'axios';
import {
    getAuth,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider
} from "firebase/auth";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const algorithm = 'aes-256-cbc'; // Algorithm to use for encryption
const key = Buffer.from(process.env.PASSWORD_ENCRYPTION_SECRET_KEY, 'hex'); // Secret key, should be 32 bytes
const iv = crypto.randomBytes(16); // Initialization vector, should be 16 bytes

function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

function decrypt(text) {
    const [iv, encryptedText] = text.split(':');
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

router.post("/passwordlessSignIn/", async (req, res) => {
    const { inputValue, inputType, userType } = req.query;

    try {
        if (inputType === "EMAIL") {
            const actionCodeSettings = {
                url: 'http://localhost:5173/DescriptionPage',
                handleCodeInApp: true,
            };

            sendSignInLinkToEmail(firebaseAuth, "adikrishna1972@gmail.com", actionCodeSettings)
                .then(() => {
                    return res.status(200).json({ message: "Successfully Sent Sign-In mail" });
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    return res.status(errorCode).json({ message: errorMessage });
                });
        } else if (inputType === "PHONE") {
            // Implement phone sign-in logic here
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.post("/loginWithPassword", async (req, res) => {
    const { userEmail, userPassword, userType } = req.body;

    try {
        const user = userType === "CUSTOMER" ? await customerMaster.findOne({"customerEmail": userEmail}) : await serviceProviderMaster.findOne({"vendorEmail": userEmail});

        if (!user) {
            return res.status(401).json({message: "No User records found!! Please check your email to continue or Sign Up."});
        }

        const originalPassword = decrypt(userType === "CUSTOMER" ? user.customerPassword : user.vendorPassword);

        if (originalPassword !== userPassword) {
            return res.status(401).json({message: "Wrong password"});
        }

        const accessToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1w"}
        );

        const { customerPassword, vendorPassword, ...info } = user._doc;

        res.status(200).json({ accessToken });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.post("/registerUser", async (req, res) => {
    const { userType, data, user } = req.body;

    const cipherText = encrypt(data.password);

    try {
        const existingCustomers = await customerMaster.find({
            $or: [
                { "customerEmail": data.email },
                { "customerContact": data.phone }
            ]
        });

        const existingVendors = await serviceProviderMaster.find({
            $or: [
                { "vendorEmail": data.email },
                { "vendorContact": data.phone }
            ]
        });

        if (existingCustomers.length > 0 || existingVendors.length > 0) {
            return res.status(401).json({ message: 'User already exists!!' });
        }

        const response = userType === "CUSTOMER" ? await axios.post(`${process.env.SERVER_URL}/eventify_server/customerMaster/`, {
            customerUid: user.uid,
            customerName: data.fullName,
            customerEmail: data.email,
            customerPassword: cipherText,
            customerContact: data.phone,
            customerCurrentLocation: data.location,
            programId: "USER"
        }) : await axios.post(`${process.env.SERVER_URL}/eventify_server/serviceProviderMaster/`, {
            vendorUid: user.uid,
            vendorName: data.fullName,
            vendorTypeId: data.vendorTypeInfo,
            vendorCurrentLocation: data.location,
            vendorContact: data.phone,
            vendorEmail: data.email,
            vendorPassword: cipherText,
            vendorCompanyName: data.brandName,
            vendorLocation: data.cityName,
            eventTypes: data.eventTypesInfo,
            programId: "USER"
        });

        const userRef = ref(firebaseDb, 'Users/' + user.uid);
        await set(userRef, {
            userType: userType,
            name: data.fullName,
            email: data.email,
            contact: data.phone,
            _id: response.data._id,
        });

        const accessToken = jwt.sign(
            { id: response.data._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1w"}
        );

        console.log("User Created Successfully!!", user.uid);
        return res.status(200).json({ accessToken });
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

router.get("/getUserData/:id", async (req, res) => {
    const currentUserId = req.params.id;

    if (!currentUserId) {
        return res.status(404).json({message: "Data not found!"});
    }

    try {
        const userRef = ref(firebaseDb, 'Users/' + currentUserId);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const userData = snapshot.val();

            let userRecord;
            let vendorRecord = null;
            const userType = userData.userType;

            if (userType === "CUSTOMER") {
                userRecord = await customerMaster.findById(userData._id);
            } else if (userType === "VENDOR") {
                userRecord = await serviceProviderMaster.findById(userData._id);
                vendorRecord = await vendorTypes.findById(userRecord.vendorTypeId);
            }

            console.log(userRecord);
            return res.status(200).json({
                UID: currentUserId,
                Document: userRecord,
                userType: userType,
                vendorType: vendorRecord?.vendorType
            });
        } else {
            return res.status(404).json({message: "User not found!"});
        }
    } catch (error) {
        return res.status(500).json(error.message);
    }
});

export default router;
