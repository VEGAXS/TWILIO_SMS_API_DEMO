# TWILIO_SMS_API_DEMO
This DEMO is a simple SMS verification code API example.
Users can directly modify the contents of this DEMO to build an SMS verification system for their own websites.

The DEMO uses the Twilio SMS API to send and verify authentication codes.
(The testing environment for this DEMO is Windows Server 2019.)

Therefore, a hosting service such as Cloudflare is required.
Please modify the code and the .env configuration file as needed to make it run properly.

These are the items you need to prepare to configure this DEMO (for Windows systems):

Install Node.js

Run the following command in CMD or PowerShell:
  npm install express dotenv sqlite3 cors twilio
Edit the sms.env file in the demo:
  TWILIO_ACCOUNT_SID="Your TWILIO Account SID"
  TWILIO_AUTH_TOKEN="Your TWILIO Auth Token"
  TWILIO_VERIFY_SID="Your TWILIO Service SID"
  PORT=3000 (default)  

DEMO WEB
<img width="1920" height="868" alt="image" src="https://github.com/user-attachments/assets/bb91730d-1a6d-4881-9537-4c1780eecda0" />
