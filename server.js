import express, { json } from "express"
import { config } from "dotenv"
import HomeRoutes from "./routes/home.routes.js"

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
	databaseURL: 'https://your-firebase-project-id.firebaseio.com', // Replace with your Firebase project URL
});

// Firebase authentication endpoint
app.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;

		try {
			// Sign in the user with email and password
			const userRecord = await admin.auth().getUserByEmail(email);
			const uid = userRecord.uid;
			const token = await admin.auth().createCustomToken(uid);

			res.json({ success: true, token });
		} catch (error) {
			console.error('Error authenticating user:', error);
			res.status(401).json({ success: false, error: 'Authentication failed' });
		}
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.use(HomeRoutes);

app.listen(PORT, () => {
	console.log(`App IS running on ${PORT}`)
});