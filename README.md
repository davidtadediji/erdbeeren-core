OBTAIN ENVIRONMENT VARIABLES

1. **OPENAI_API_KEY:**
   - Sign up for an account on the OpenAI platform.
   - Navigate to the API section to obtain your API key.
   - Replace the empty value with your actual OpenAI API key.

2. **Database Connection Variables:**
   - **DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME:**
     - Create a PostgreSQL database and replace these variables with your database credentials.

3. **DATABASE_URL:**
   - Combine the database connection variables to form a complete URL in the format specified (replace placeholders with your actual credentials).

4. **JWT_SECRET:**
   - Generate a secure JWT secret key and replace the empty value with your secret.

5. **PORT:**
   - Set the desired port number for your application (default is 3000).

6. **Twilio Variables:**
   - **TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, TWILIO_CHAT_SERVICE_SID, NGROK_SUBDOMAIN, TWILIO_API_SECRET, TWILIO_API_KEY:**
     - Create an account on the Twilio platform and set up a project with the required services.
     - Replace the empty values with the credentials obtained from your Twilio project.

7. **Email Variables:**
   - **EMAIL_USER, EMAIL_PASSWORD:**
     - Use your email provider (in this case, Gmail) to obtain the SMTP username and password.
     - Replace the empty values with your actual email credentials.



Speech to Text Setup
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

Functional Requirement-Mandatory:
• The system should be able to identify service requests and unresolved complaints and
route them to a service agent.
• The system’s AI agent should be able to respond to most complaints and enquiries
including Frequently Asked Questions (FAQs) and inquiries about the company.
• The system should be able to respond to queries in several languages.
• The system should be able to track metrics such as customer satisfaction, conversation 
duration, response time, high-frequency customers, sentiment, ticket volume over time, 
issue category, profile, and ticketing interaction frequency, providing reports to service 
staff.
• The system should provide an audit trail to service staff.
• The software should have a ticketing system for handling escalated queries.
• The system should handleinappropriate messages.
• The system should authenticate service staff before granting access to the system.
• The system should be able to provide an interface for managing the corporate knowledge 
base
• The system should inform customers about the agent attending to them.
• The system should provide multiple communication channels for customers to access the 
system.

Functional Requirement-Desirable:
Given the additional insights garnered from research, coupled with a consideration of the
development pace and the remaining time, it seems prudent to maintain the following
requirements as optional, as the system can continue to operate effectively without them.
• The system may feature voice interaction employing a turn mechanism and TTS 
technology.
• The system may include extra features to augment the agent routine for resolving tickets.
• The system may be able to track the cost of conversations in real-time: the cost of APIs and 
tokens for each interaction with customers.
• The system may be able to integrate with the Zoho Customer Relationship Management 
System.

Non-Functional Requirements:
• The system should requirefewer resources to train a model using corporate data.
• The system should present androgynously.
• The system should be easy for enterprises to set up.
• The system should be a quality software product
• The system should be deployed on a cloud platform.
• The system should be a single-tenant software.
