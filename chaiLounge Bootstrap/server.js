const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const upload = multer();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use(cors());

app.post('/send-email', upload.single('resume'), (req, res) => {
    const { name, email, phone, message } = req.body;
    const resume = req.file;

    if (!resume) {
        return res.status(400).json({ message: 'Resume file is required.' });
    }

    const applicantEmailContent = `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                }
                .email-container {
                    padding: 20px;
                    background-color: #f7f7f7;
                    border: 1px solid #dddddd;
                    border-radius: 5px;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    background-color: #bb883e;
                    color: #ffffff;
                    padding: 10px;
                    border-radius: 5px 5px 0 0;
                }
                .content {
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 0 0 5px 5px;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 0.9em;
                    color: #777777;
                }
                .footer a {
                    color: #bb883e;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>Chai Lounge</h1>
                </div>
                <div class="content">
                    <p>Dear ${name},</p>
                    <p>Thank you for your interest in joining the team at Chai Lounge. We have successfully received your application and will begin reviewing your qualifications shortly.</p>
                    <p>Our hiring team is committed to finding the best fit for our organization, and we appreciate the time and effort you put into applying for this position. Should your application meet our initial requirements, we will contact you to discuss the next steps in the selection process.</p>
                    <p>If you have any questions or need further assistance, please do not hesitate to reach out to us at <a href="mailto:info@chailounge.com">info@chailounge.com</a>.</p>
                    <p>Thank you once again for considering Chai Lounge as your potential employer.</p>
                    <p>Best regards,</p>
                    <p>The Chai Lounge Hiring Team</p>
                </div>
                <div class="footer">
                    <p>Chai Lounge | 10119 Rice Howard Wy, Edmonton, AB T5J 0R5 | <a href="mailto:info@chailounge.com">info@chailounge.com</a></p>
                </div>
            </div>
        </body>
        </html>
    `;

    const chaiLoungeEmailContent = `
        New application received:

        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Message: ${message}
        Resume: ${resume.originalname}
    `;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const mailOptions1 = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Application Received - Chai Lounge',
        html: applicantEmailContent,
    };

    const mailOptions2 = {
        from: process.env.GMAIL_USER,
        to: process.env.CHAI_LOUNGE_EMAIL,
        subject: 'New Application Received',
        text: chaiLoungeEmailContent,
        attachments: [
            {
                filename: resume.originalname,
                content: resume.buffer,
            },
        ],
    };

    transporter.sendMail(mailOptions1, (error, info) => {
        if (error) {
            console.error('Error sending applicant email:', error);
            return res.status(500).json({ message: 'Error sending applicant email' });
        }
        console.log('Applicant Email sent: ' + info.response);

        transporter.sendMail(mailOptions2, (error, info) => {
            if (error) {
                console.error('Error sending Chai Lounge email:', error);
                return res.status(500).json({ message: 'Error sending Chai Lounge email' });
            }
            console.log('Chai Lounge Email sent: ' + info.response);
            res.json({ message: 'Emails sent successfully!' });
        });
    });
});

app.post('/send-contact-email', upload.none(), (req, res) => {
    const { name, email, phone, message } = req.body;

    const contactEmailContent = `
        New contact form submission:

        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Message: ${message}
    `;

    const confirmationEmailContent = `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                }
                .email-container {
                    padding: 20px;
                    background-color: #f7f7f7;
                    border: 1px solid #dddddd;
                    border-radius: 5px;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    background-color: #bb883e;
                    color: #ffffff;
                    padding: 10px;
                    border-radius: 5px 5px 0 0;
                }
                .content {
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 0 0 5px 5px;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 0.9em;
                    color: #777777;
                }
                .footer a {
                    color: #bb883e;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>Chai Lounge</h1>
                </div>
                <div class="content">
                    <p>Dear ${name},</p>
                    <p>Thank you for reaching out to Chai Lounge. We have received your message and will get back to you shortly.</p>
                    <p>If you have any urgent queries, please feel free to contact us directly at <a href="mailto:info@chailounge.com">info@chailounge.com</a>.</p>
                    <p>Best regards,</p>
                    <p>The Chai Lounge Team</p>
                </div>
                <div class="footer">
                    <p>Chai Lounge | 10119 Rice Howard Wy, Edmonton, AB T5J 0R5 | <a href="mailto:info@chailounge.com">info@chailounge.com</a></p>
                </div>
            </div>
        </body>
        </html>
    `;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const mailOptions1 = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Contact Form Submission - Chai Lounge',
        html: confirmationEmailContent,
    };

    const mailOptions2 = {
        from: process.env.GMAIL_USER,
        to: process.env.CONTACT_EMAIL,
        subject: 'New Contact Form Submission',
        text: contactEmailContent,
    };

    transporter.sendMail(mailOptions1, (error, info) => {
        if (error) {
            console.error('Error sending confirmation email:', error);
            return res.status(500).json({ message: 'Error sending confirmation email' });
        }
        console.log('Confirmation Email sent: ' + info.response);

        transporter.sendMail(mailOptions2, (error, info) => {
            if (error) {
                console.error('Error sending contact form email:', error);
                return res.status(500).json({ message: 'Error sending contact form email' });
            }
            console.log('Contact Form Email sent: ' + info.response);
            res.json({ message: 'Emails sent successfully!' });
        });
    });
});

app.post('/send-reservation-email', upload.none(), (req, res) => {
    const { name, email, phone, date, time, numberOfGuests, specialRequests } = req.body;

    const reservationEmailContent = `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                }
                .email-container {
                    padding: 20px;
                    background-color: #f7f7f7;
                    border: 1px solid #dddddd;
                    border-radius: 5px;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    background-color: #bb883e;
                    color: #ffffff;
                    padding: 10px;
                    border-radius: 5px 5px 0 0;
                }
                .content {
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 0 0 5px 5px;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 0.9em;
                    color: #777777;
                }
                .footer a {
                    color: #bb883e;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>Chai Lounge</h1>
                </div>
                <div class="content">
                    <p>Dear ${name},</p>
                    <p>Thank you for making a reservation at Chai Lounge. Here are your reservation details:</p>
                    <ul>
                        <li>Date: ${date}</li>
                        <li>Time: ${time}</li>
                        <li>Number of Guests: ${numberOfGuests}</li>
                        <li>Special Requests: ${specialRequests}</li>
                    </ul>
                    <p>We look forward to serving you. If you need to make any changes to your reservation, please contact us at <a href="mailto:info@chailounge.com">info@chailounge.com</a>.</p>
                    <p>Best regards,</p>
                    <p>The Chai Lounge Team</p>
                </div>
                <div class="footer">
                    <p>Chai Lounge | 10119 Rice Howard Wy, Edmonton, AB T5J 0R5 | <a href="mailto:info@chailounge.com">info@chailounge.com</a></p>
                </div>
            </div>
        </body>
        </html>
    `;

    const chaiLoungeReservationContent = `
        New reservation received:

        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Date: ${date}
        Time: ${time}
        Number of Guests: ${numberOfGuests}
        Special Requests: ${specialRequests}
    `;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const mailOptions1 = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Reservation Confirmation - Chai Lounge',
        html: reservationEmailContent,
    };

    const mailOptions2 = {
        from: process.env.GMAIL_USER,
        to: process.env.CHAI_LOUNGE_EMAIL,
        subject: 'New Reservation Received',
        text: chaiLoungeReservationContent,
    };

    transporter.sendMail(mailOptions1, (error, info) => {
        if (error) {
            console.error('Error sending reservation confirmation email:', error);
            return res.status(500).json({ message: 'Error sending reservation confirmation email' });
        }
        console.log('Reservation Confirmation Email sent: ' + info.response);

        transporter.sendMail(mailOptions2, (error, info) => {
            if (error) {
                console.error('Error sending reservation email:', error);
                return res.status(500).json({ message: 'Error sending reservation email' });
            }
            console.log('Reservation Email sent: ' + info.response);
            res.json({ message: 'Reservation emails sent successfully!' });
        });
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});