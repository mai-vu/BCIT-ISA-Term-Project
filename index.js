import express from 'express';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passwordRouter from './routes/passwordRouter.js'; 

dotenv.config();
const mongoURI = process.env.DB_URL;
const __dirname = path.resolve();
const app = express();
const port = process.env.PORT || 8000;
const saltRounds = 10;
const db = process.env.DB;
const SECRET_KEY = process.env.SECRET_KEY;
const SESSION_KEY = process.env.SESSION_KEY;

app.use(session({
    secret: SESSION_KEY,
    resave: true,
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

// Function to connect to MongoDB for API usage data
async function connectToDatabaseForUsage() {
    const client = new MongoClient(mongoURI);
    await client.connect();
    return client.db(db).collection('usage');
}

// Function to connect to MongoDB for endpoint stats
async function connectToDatabaseForStats() {
    const client = new MongoClient(mongoURI);
    await client.connect();
    return client.db(db).collection('stats');

}

async function createAPIKey() {
    try {
        const response = await fetch('https://www.alexkong.xyz/proj/api-key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to get API key');
        }
        const data = await response.json();
        const apiKey = data['api-key'];
        return apiKey; // Return the API key
    } catch (error) {
        console.error('Error:', error);
        throw error; // Re-throw the error for handling elsewhere if needed
    }
}

// Use the Password-related Route Handler
app.use('/password', passwordRouter);

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

app.get('/admin', (req, res) => {
    // Check if the user is authenticated
    const token = req.cookies.token;
    if (!token) {
        res.redirect('/');
        return;
    }

    //check if user is admin
    const role = req.session.role;
    if (role !== 'admin') {
        //if not admin, display alert and redirect to home
        res.send('<script>alert("You are not authorized to access this page."); window.location.href = "/home";</script>');
        return;
    }

    jwt.verify(token, SECRET_KEY, async (error, decoded) => {
        if (error) {
            res.redirect('/');
            return;
        }
        res.sendFile(path.join(__dirname, 'html', 'admin.html'));
    });
});

// Add a new route to fetch users and their usage count
app.get('/admin/users', async (req, res) => {
    try {
        // Connect to the database
        const usersCollection = await connectToDatabase();

        // Find all users
        const users = await usersCollection.find().toArray();

        // Send the users data as JSON response
        res.json(users);
    } catch (error) {
        console.error('Error fetching users data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch usage data for the API keys
app.get('/admin/api-usage', async (req, res) => {
    try {
        // Connect to the database
        const usageCollection = await connectToDatabaseForUsage();

        // Fetch API usage data
        const apiUsageData = await usageCollection.find().toArray();

        // Send the API usage data as JSON response
        res.json(apiUsageData);
    } catch (error) {
        console.error('Error fetching API usage data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch usage data for each endpoint
app.get('/admin/endpoint-usage', async (req, res) => {
    try {
        // Connect to the database
        const statsCollection = await connectToDatabaseForStats();

        // Fetch endpoint usage data
        const endpointUsageData = await statsCollection.find().toArray();

        // Send the endpoint usage data as JSON response
        res.json(endpointUsageData);
    } catch (error) {
        console.error('Error fetching endpoint usage data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/users/role', async (req, res) => {
    try {
        const email = req.session.email;

        // Connect to the database
        const usersCollection = await connectToDatabase();

        // Find the user by email
        const user = await usersCollection.findOne({ email });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const role = user.role;

        res.json({ role }); // Send the user's role as JSON response
    } catch (error) {
        console.error('Error fetching API calls count:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/users/apikey', async (req, res) => {
    try {
        const email = req.session.email;

        // Connect to the database
        const usersCollection = await connectToDatabase();

        // Find the user by email
        const user = await usersCollection.findOne({ email });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const apiKey = user['api-key'];

        res.json({ apiKey }); // Send the user's role as JSON response
    } catch (error) {
        console.error('Error fetching API calls count:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/users/convoExisted', async (req, res) => {
    try {
        const email = req.session.email;

        // Connect to the database
        const usersCollection = await connectToDatabase();

        // Find the user by email
        const user = await usersCollection.findOne({ email });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const convoExisted = user.convoExisted;

        res.json({ convoExisted }); // Send the user's convoExisted boolean as JSON response
    } catch (error) {
        console.error('Error fetching API calls count:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/users/convoExisted', async (req, res) => {
    try {
        const email = req.session.email;

        // Connect to the database
        const usersCollection = await connectToDatabase();

        // Find the user by email
        const user = await usersCollection.findOne({ email });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const convoExisted = req.body.convoExisted;

        // Update the user's convoExisted boolean
        await usersCollection.updateOne({ email }, { $set: { convoExisted: req.body.convoExisted } });

        res.json({ convoExisted }); // Send success response
    } catch (error) {
        console.error('Error updating conversation existence:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
);

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

        //get user uid and assign to session
        req.session.uid = existingUser._id.toString();

        //get user's role and assign to session
        req.session.role = existingUser.role;

        // Generate a JWT token for the user
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });

        // Set the token as an HTTPOnly cookie
        res.cookie('token', token, { httpOnly: true });

        // Redirect based on user's role
        if (existingUser.role === 'admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/home');
        }
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

        const apiKey = await createAPIKey();

        // Insert the new user into the database with hashed password
        await usersCollection.insertOne({ email: email, password: hashedPassword, role: 'user', 'api-key': apiKey, convoExisted: false});

        // Store email in session
        req.session.email = email;

        //get user uid and assign to session
        const newUser = await usersCollection.findOne({ email });
        req.session.uid = newUser._id.toString();

        // Generate a JWT token for the user
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });

        // Set the token as an HTTPOnly cookie
        res.cookie('token', token, { httpOnly: true });

        // Redirect based on user's role
        if (newUser.role === 'admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/home');
        }
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
