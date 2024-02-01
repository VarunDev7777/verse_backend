import express, { json } from "express"
import { config } from "dotenv"
import HomeRoutes from "./routes/home.routes.js"
import admin from 'firebase-admin';

config();
const { PORT } = process.env;
const app = express()

app.use(json());

const firebaseConfig = {
	type: "service_account",
	project_id: process.env.FIREBASE_PROJECT_ID,
	private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
	private_key: process.env.FIREBASE_PRIVATE_KEY,
	client_email: process.env.FIREBASE_CLIENT_EMAIL,
	client_id: process.env.FIREBASE_CLIENT_ID,
	auth_uri: process.env.FIREBASE_AUTH_URI,
	auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
	token_uri: process.env.FIREBASE_TOKEN_URI,
	client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
	universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
}

// Initialize Firebase Admin SDK
admin.initializeApp({
	credential: admin.credential.cert(firebaseConfig),
	databaseURL: 'https://verse-9c645-default-rtdb.asia-southeast1.firebasedatabase.app/',
});

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

		const { email } = req.body;

		// Validate email address
		if (!validateEmail(email)) {
			return res.status(400).json({ message: "Invalid email address" });
		}

		// Sign in the user with email and password
		const userRecord = await admin.auth().getUserByEmail(email);
		const uid = userRecord.uid;
		const token = await admin.auth().createCustomToken(uid);

		res.json({ success: true, token });
	} catch (error) {
		console.error('Error authenticating user:', error);
		res.status(401).json({ success: false, error: 'Authentication failed' });
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

app.use(HomeRoutes);

app.listen(PORT, () => {
	console.log(`App IS running on ${PORT}`)
});

// Function to validate email address
function validateEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}