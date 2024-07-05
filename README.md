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


# This was inserted by `prisma init`:
# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings


Add these to the environment variables

OPENAI_API_KEY
LANGCHAIN_TRACING_V2
LANGCHAIN_ENDPOINT
LANGCHAIN_API_KEY
LANGCHAIN_PROJECT
DB_USERNAME
PASSWORD
DB_HOST
DB_PORT
DB_NAME
DATABASE_URL
JWT_SECRET
PORT
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
NGROK_SUBDOMAIN
TWILIO_CHAT_SERVICE_SID
TWILIO_API_SECRET
TWILIO_API_KEY
EMAIL_USER
EMAIL_APP_PASSWORD
APP_URL
AMQP_URL