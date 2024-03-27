import express from 'express';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

const mongoURI = dotenv.config().parsed.DB_URL;
const __dirname = path.resolve();
const app = express();
const port = process.env.PORT || 8000;
const saltRounds = 10;
const db = dotenv.config().parsed.DB;
const SECRET_KEY = dotenv.config().parsed.SECRET_KEY;


app.use(express.json());
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '')));

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


app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        console.log(hashedPassword);
        const client = new MongoClient(mongoURI);
        await client.connect();


        const usersCollection = client.db(db).collection('users');

        // Check if the user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            res.redirect('/login');
            return;
        }

        // Insert the new user into the database with hashed password
        await usersCollection.insertOne({ email, password: hashedPassword });

        // Generate a JWT token for the user
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });

        // Set the token as an HTTPOnly cookie
        res.cookie('token', token, { httpOnly: true });

        res.status(201).json({ message: 'User created successfully', token });

        res.redirect('/home');
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




// Handle 404 errors
app.get("*", (req, res) => {
    res.status(404).send("404 Not Found");
});

app.listen(port, () => {
    console.log("Node application listening on port " + port);
});
