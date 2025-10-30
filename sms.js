//DEMO is run system in "Windwos Server 2019"
const express = require("express");      // Node.js of Express SERVER FRAME
const bodyParser = require("body-parser"); //  JSON DATA OF HTTP POST 
const twilio = require("twilio");          // Call Twilio API
require("dotenv").config({ path: "sms.env" }); // Load sms.env 
const sqlite3 = require("sqlite3").verbose();

// Creat / Connect SQL DATABASE(Sqlite)
const db = new sqlite3.Database("./PhoneNumber.db", (err) => 
  {
  if (err) console.error(" DB Connect ERROR :", err);
  else console.log(" Connect SQLite DATABASE!: users.db");
});

// Creat SQL DATABASE
db.run
(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Creat Express server
const SMSAPP = express();
SMSAPP.use(express.static("sms"));

// SET SERVER Auto Parse JSON（eg: {"phone":"+8869..."}）EG:(TW_NUMBER(+886),HK_NUMBER(+852),CH_NUMBER(+86))
SMSAPP.use(bodyParser.json());
//app.use(cors({ origin: "*" }));

// Creat Twilio Client,USE.env AC_KEY LOGIN Twilio API
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ----------------------
//   API rout 1：Send Verify Code
// ----------------------
SMSAPP.post("/send-otp", async (req, res) => 
    {
  // GET Phone Fome JSON
  const { phone } = req.body;

  if (!phone) return res.status(400).json({ error: "Phone number required" });
  
  try 
  {
    db.get("SELECT * FROM users WHERE phone = ?", [phone], async (err, row) => {
      if (err) 
        {
        console.error(" SELECT ERROR：", err);
        return res.status(500).json({ error: "SERVER ERROR" });
      }

      if (row) 
        {
        // IF DATA WAS EXIST
        console.log("This Number was exist：", phone);
        return res.status(200).json({ message: "Save Number" });
      }
      // IF NOT,Send SMS to Twilio
      client.verify.v2
        .services(process.env.TWILIO_VERIFY_SID)
        .verifications.create({ to: phone, channel: "sms" })
        .then((verification) => {
          console.log("Send OTP to：", phone);
          res.json({ status: verification.status });
        })
        .catch((error) => {
          console.error(" Twilio Send ERROR：", error);
          res.status(500).json({ error: error.message });
        });
    });
  } 
  catch (err) 
  {
    //Twilio ERROR
    console.error(err);
    //HTTP 500（SERVER ERROR）
    res.status(500).json({ error: err.message });
  }
});

//   API rout 2：Verify Code
SMSAPP.post("/verify-otp", async (req, res) => 
  {
  // Phone & CODE Fomre Client
  const { phone, code } = req.body;

  // Reject, if DATA lack
  if (!phone || !code) return res.status(400).json({ error: "Phone and code required" });

  try 
  {
    // CALL Twilio Verify API Check Verify Code True or False
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({ to: phone, code });

    // IF Check State = approved,Is Correct
    if (verificationCheck.status === "approved") 
      {
      res.json({ verified: true, message: "Phone verified successfully!" });
      //  Save DATA to SQL DATABASE , IF Succes
      db.run(
        "INSERT OR IGNORE INTO users (phone) VALUES (?)",
        [phone],
        (err) => 
          {
          if (err) console.error("INSERT ERROR:", err.message);
          else console.log("SAVE USER NUMBER:", phone);
        }
      );
    } else 
      {
      // Verify Code ERROR / Expired
      res.status(400).json({ verified: false, message: "Invalid or expired code" });
    }
  } catch (err) {s
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


//   SERVER OPEN
// process.env.PORT load of "sms.env" 
SMSAPP.listen(process.env.PORT, () => 
    {
  console.log(`Twilio Verify server running at http://127.0.0.1:${process.env.PORT}`);//Your Server IP
});
