Setup
Setup Google Project and retrieve service account key

a. Install and initialize the Cloud SDK

b. Setup a new GCP Project

c. Enable the Google Speech-To-Text API for that project

d. Create a service account.

e. Download a private key as JSON.

Modify the .env.sample file to include the path to your JSON service account key and save it as a .env file

Run the following commands:

Buy a Phone Number (I have used the GB country code to buy a mobile number, but feel free to change this for a number local to you.)

$ twilio phone-numbers:buy:mobile --country-code GB

Start ngrok:

$ ngrok http 8080

While this is running in a new window copy the forwarding HTTPS URL (https://xxxxx.ngrok.io) and set your Twilio number to this URL:

$ twilio phone-numbers:update YOUR_TWILIO_NUMBER_HERE --voice-url https://xxxxxxxx.ngrok.io

Install dependencies and start your server:

$ npm install

$ npm start