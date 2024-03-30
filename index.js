import express from 'express';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';

const mongoURI = dotenv.config().parsed.DB_URL;
const __dirname = path.resolve();
const app = express();
const port = process.env.PORT || 8000;
const saltRounds = 10;
const db = dotenv.config().parsed.DB;
const SECRET_KEY = dotenv.config().parsed.SECRET_KEY;
const SESSION_KEY = dotenv.config().parsed.SESSION_KEY;

app.use(session({
    secret: SESSION_KEY,
    resave: false,
    saveUninitialized: true
}));
app.use(cookieParser());
app.use(express.json());
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '')));

// Function to connect to MongoDB
async function connectToDatabase() {
    const client = new MongoClient(mongoURI);
    await client.connect();
    return client.db(db).collection('users');
}

// Index page, gatekeeps if user is logged in
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'signup.html'));
});

app.get('/home', (req, res) => {
    // Check if the user is authenticated
    const token = req.cookies.token;
    if (!token) {
        res.redirect('/');
        return;
    } else {
        jwt.verify(token, SECRET_KEY, async (error, decoded) => {
            if (error) {
                res.redirect('/');
                return;
            }
            res.sendFile(path.join(__dirname, 'html', 'home.html'));
        });
    }
});

app.get('/usagecount', async (req, res) => {
    try {
        const email = req.session.email;

        console.log('Email:', email);

        // Connect to the database
        const usersCollection = await connectToDatabase();

        // Find the user by email
        const user = await usersCollection.findOne({ email });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Retrieve the API_calls count for the user
        const apiCalls = user.API_calls || 0;

        res.json({ apiCalls }); // Send the API_calls count as JSON response
    } catch (error) {
        console.error('Error fetching API calls count:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Connect to the database
        const usersCollection = await connectToDatabase();

        // Check if the user exists
        const existingUser = await usersCollection.findOne({ email });
        if (!existingUser) {
            res.redirect('/signup');
            return;
        }

        // Check if the password is correct
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            res.redirect('/login');
            return;
        }

        // Store email in session
        req.session.email = email;

        // Generate a JWT token for the user
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });

        // Set the token as an HTTPOnly cookie
        res.cookie('token', token, { httpOnly: true });

        res.redirect('/home');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Signup Route
app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Connect to the database
        const usersCollection = await connectToDatabase();

        // Check if the user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            res.redirect('/login');
            return;
        }

        // Insert the new user into the database with hashed password
        await usersCollection.insertOne({ email, password: hashedPassword, API_calls: 0, role: 'user'});

        // Store email in session
        req.session.email = email;

        // Generate a JWT token for the user
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });

        // Set the token as an HTTPOnly cookie
        res.cookie('token', token, { httpOnly: true });

        res.redirect('/home');
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

// Handle 404 errors
app.get("*", (req, res) => {
    res.status(404).send("404 Not Found");
});

app.listen(port, () => {
    console.log("Node application listening on port " + port);
});
