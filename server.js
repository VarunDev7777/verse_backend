import express, { json, static as Static } from "express"
import { config } from "dotenv"
import HomeRoutes from "./routes/home.routes.js"
import admin from 'firebase-admin';
import { resolve } from "path";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from 'firebase/app';
import { fileURLToPath } from "url";
import { dirname } from "path";


config();
const {  PORT } = process.env;
const app = express()

app.use(json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Serve Static Content
app.use("/assets", Static(resolve(__dirname, "assets")));

const firebaseConfig = {
	type: "service_account",
	project_id: process.env.FIREBASE_PROJECT_ID,
	private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
	private_key: (`${process.env.FIREBASE_PRIVATE_KEY}`).replace(/\\n/g, '\n'),
	client_email: process.env.FIREBASE_CLIENT_EMAIL,
	client_id: process.env.FIREBASE_CLIENT_ID,
	auth_uri: process.env.FIREBASE_AUTH_URI,
	auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
	token_uri: process.env.FIREBASE_TOKEN_URI,
	client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
	universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
}

const firebase = initializeApp(firebaseConfig);


// Initialize Firebase Admin SDK
admin.initializeApp({
	credential: admin.credential.cert(firebaseConfig),
	databaseURL: 'https://verse-9c645-default-rtdb.asia-southeast1.firebasedatabase.app/',
});
const db = admin.database();
// Push data to Firebase database
app.post('/api/saveData', async (req, res) => {
	try {
		admin.database().ref('cardContents').update(dataArr).then(() => {
			res.status(201).json({ message: 'Data updated successfully' });
		})
	} catch (error) {
		console.error('Error posting data:', error);
		res.status(500).json({ error: error.message })
	}
});

app.get('/api/fetchContent', async (req, res) => {
	try {
		const path = 'cardContents';
		const data = await admin.database().ref(path).get();
		res.status(200).json({ data })
	} catch (error) {
		res.status(500).json({ error: error.mesaage })
	}
})

// Firebase authentication endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Sign in the user with email and password
        const userCredential = await admin.auth().getUserByEmail(email);

        // If there's no error, the user exists
        // Now, you need to check the password
        await admin.auth().updateUser(userCredential.uid, {
            password: password
        });

        // Create a custom token for the user
        const customToken = await admin.auth().createCustomToken(userCredential.uid);

        // Send success response with custom token
        res.json({ success: true, customToken });
    } catch (error) {
        // Handle authentication errors
        console.error('Error authenticating user:', error);
        res.status(401).json({ success: false, error: `Authentication failed - ${error.message}` });
    }
});


app.post("/api/registerUser", async (req, res) => {
	try {
		const { email, password } = req.body;

		// Validate email address
		if (!validateEmail(email)) {
			return res.status(400).json({ message: "Invalid email address" });
		}

		const userRecord = await admin.auth().createUser({ email, password });

		res.status(200).json({ message: "User registered successfully", uid: userRecord.uid });
	} catch (error) {
		console.error("Error creating user:", error);
		res.status(500).json({ message: "Failed to register user" });
	}
});

// app.post("/api/forgetPassword", async (req, res) =>{
// 	try {
// 		const { email } = req.body;

// 	// Validate email address
// 	if (!validateEmail(email)) {
// 		return res.status(400).json({ message: "Invalid email address" });
// 	}

// 	await admin.auth().generatePasswordResetLink(email).then((link) =>{  

// 	});

// 	} catch (error) {
		
// 	}
// });

// user profile 
app.post("/api/updateUser", async (req, res) => {
	try {
		const {uuid} = req.query;
		const data = req.body;
		await db.ref(`users/${uuid}`).update(data);
        res.status(201).json({ message: 'Data added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding data' });
	}
})

app.use(HomeRoutes);

app.listen(PORT, () => {
	console.log(`App IS running on ${PORT}`)
});

// Function to validate email address
function validateEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}