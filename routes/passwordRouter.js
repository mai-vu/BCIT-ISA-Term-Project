import path from 'path';
import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import fs from 'fs';
import bcrypt from 'bcrypt';

dotenv.config();
const mongoURI = process.env.DB_URL;
const db = process.env.DB;
const __dirname = path.resolve();
const router = express.Router();
const expireTime = 1000 * 60 * 10; // 10 minutes
const saltRounds = 10;

// const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

function sendEmail(email, resetLink) {
    fs.readFile('./html/resetPasswordTemplate.html', 'utf8', (err, htmlTemplate) => {
        if (err) {
            console.error('Error reading email template:', err);
            return;
        }

        // Replace placeholders in the HTML template with actual data
        const emailContent = htmlTemplate.replace('{{resetLink}}', resetLink);

        // Construct the email message
        const msg = {
            to: email,
            from: 'chatbot.amat@gmail.com',
            subject: 'No Reply - ChatAMAT Password Reset Link',
            html: emailContent,
        };

        // Send the email using sgMail or your email service provider
        sgMail.send(msg)
            .then(() => {
                console.log('Email sent');
            })
            .catch((error) => {
                console.error('Error sending email:', error);
            });
    });
}

// Generate a random token
function generateToken() {
    return Math.random().toString(36).substring(2, 12); 
}


// Function to connect to MongoDB
async function connectToDatabase() {
    const client = new MongoClient(mongoURI);
    await client.connect();
    return client.db(db).collection('users');
}

// Connect to the database
const usersCollection = await connectToDatabase();

// Route to handle forgot password request
router.get('/forgot-password', async (req, res) => {
    res.sendFile(path.join(__dirname, './html/forgotPassword.html'));
});


// Route to handle reset password request
router.post('/forgot-password', async (req, res) => {
    const email = req.body.email;

    // Check if the user exists
    const existingUser = await usersCollection.findOne({ email });

    if (!existingUser) {
        res.status(404).json({ error: 'User not found' });
        return;
    } else {
        res.json({ exists: true });

        // Generate unique token and store it in the database along with user email and expiration time
        const resetToken = generateToken();
        const expirationTime = Date.now() + expireTime;
        const result = await usersCollection.updateOne({
            email: email
        }, {
            $set: {
                resetToken: resetToken,
                expirationTime: expirationTime
            }
        });
        const resetLink = `https://seal-app-7cvbm.ondigitalocean.app/password/reset-password?token=${resetToken}`;
        sendEmail(email, resetLink);

    }
});

router.get('/reset-password', async (req, res) => {
    const { token } = req.query;

    try {
        // Check if token exists and hasn't expired
        const user = await usersCollection.findOne({
            resetToken: token,
            expirationTime: { $gt: Date.now() }
        });
        

        if (!user) {
            console.log(user.resetToken, user.expirationTime, Date.now());
            console.log({ $gt: Date.now() })
            return res.status(404).send('Invalid or expired token');
        }

        fs.readFile(path.join(__dirname, './html/resetPassword.html'), 'utf8', (err, htmlContent) => {
            if (err) {
                console.error('Error reading HTML file:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
    
            // Replace the {{token}} placeholder with the actual token value
            const modifiedHtmlContent = htmlContent.replace('{{token}}', token);
    
            // Send the modified HTML content to the client
            res.send(modifiedHtmlContent);
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).send('Internal server error');
        res.redirect('/login');
    }
});

router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    try {
        // Check if token exists and hasn't expired
        const user = await usersCollection.findOne({
            resetToken: token,
            expirationTime: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(404).send('Invalid or expired token');
        }

        // Hash new password and update in the database
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await usersCollection.updateOne(
            { email: user.email },
            { $set: { password: hashedPassword } }
        );

        //redirect to login page
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

export default router;
