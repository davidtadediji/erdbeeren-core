OBTAIN ENVIRONMENT VARIABLES


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



OPENAI_API_KEY
Obtain: Sign up for an account at OpenAI. Once registered, navigate to the API keys section under your account settings to generate a new API key.
Add to your environment variables


LANGCHAIN_TRACING_V2
Obtain: Specific to your application setup and requirements. Check the Langchain documentation or setup guides for the appropriate value.
Add to your environment variables


LANGCHAIN_ENDPOINT
Obtain: The endpoint URL for the Langchain service you're using. Refer to your service provider or setup documentation.
Add to your environment variables


LANGCHAIN_API_KEY
Obtain: Similar to the OpenAI API key, generate this from your Langchain account or service provider's dashboard.
Add to your environment variables


LANGCHAIN_PROJECT
Obtain: This would be the project identifier/name from your Langchain account or setup.
Add to your environment variables


DB_USERNAME and PASSWORD
Obtain: This would be the username and password for your database. These are typically set during the initial database setup.
Add to your environment variables



DB_HOST, DB_PORT, and DB_NAME
Obtain: These details are provided when you set up your database. The host is the server address, the port is the connection port, and the database name is the specific database you're connecting to.
Add to your environment variables


DATABASE_URL
Obtain: Construct this URL based on the database credentials. Format typically is: protocol://username:password@host:port/database.
Add to your environment variables

JWT_SECRET
Obtain: Generate a secret key for JSON Web Token (JWT) signing. You can use an online generator or create one manually.
Add to your environment variables

PORT
Obtain: This is the port number your application will run on. Common defaults are 3000 or 8000, but it can be any open port.
Add to your environment variables

TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER
Obtain: Sign up for an account at Twilio, navigate to the Console Dashboard to get your Account SID, Auth Token, and phone number.
Add to your environment variables

NGROK_SUBDOMAIN
Obtain: Sign up for an account at ngrok, create a subdomain from your account dashboard.
Add to your environment variables


TWILIO_CHAT_SERVICE_SID, TWILIO_API_SECRET, and TWILIO_API_KEY
Obtain: Generate these from your Twilio Console, specifically under the Chat Services and API Keys sections.
Add to your environment variables


EMAIL_USER and EMAIL_APP_PASSWORD
Obtain: These are your email service credentials. For services like Gmail, create an App Password under your account settings.
Add to your environment variables

APP_URL
Obtain: This is the base URL where your application is hosted.
Add to your environment variables

AMQP_URL
Obtain: The URL for your AMQP (Advanced Message Queuing Protocol) server. Usually in the format amqp://username:password@host:port/vhost.
Add to your environment variables



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
