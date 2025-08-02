import express from 'express';
import bodyParser from 'body-parser';
import { SignalWire } from '@signalwire/realtime-api';
import axios from 'axios';
import 'dotenv/config';
import ngrok from "ngrok";

const app = express();
const port = 3000;
const client = await SignalWire({
    project: process.env.SIGNALWIRE_PROJECT,
    token: process.env.SIGNALWIRE_TOKEN,
    space: process.env.SIGNALWIRE_SPACE
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.post('/inbound-sms', async (req, res) => {
    const {From, To, Body} = req.body
    console.log(`Incoming SMS from ${From}: ${Body}`);


    try {
        const response = await axios.post(
            `https://${process.env.SIGNALWIRE_SPACE}.signalwire.com/api/laml/2010-04-01/Accounts/${process.env.SIGNALWIRE_PROJECT}/Messages.json`,
            new URLSearchParams({
                From: To,
                To: From,
                Body: `Thanks for your message: "${Body}"`
            }),
            {
                auth: {
                    username: process.env.SIGNALWIRE_PROJECT,
                    password: process.env.SIGNALWIRE_TOKEN
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        console.log("Replied:", response.data);
    } catch (err) {
        console.error("Failed to reply:", err.response?.data || err.message);
    }

    // Respond to SignalWire webhook (required)
    res.status(200).send('');
})

app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);

  // Start Ngrok tunnel here
  const url = await ngrok.connect(port);
  console.log(`Ngrok tunnel open at: ${url}/inbound-sms`);
});
