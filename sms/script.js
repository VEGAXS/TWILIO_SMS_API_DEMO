const API_BASE = "http://127.0.0.1:3000"; // Your SMS.js Server IP 
// IF Use Cloudflare Worker，PLs Change ：https://Your workers Subdomain.workers.dev

const phoneInput = document.getElementById("phone");
const otpInput = document.getElementById("otp");
const sendBtn = document.getElementById("sendBtn");
const verifyBtn = document.getElementById("verifyBtn");
const message = document.getElementById("message");
const message1 = document.getElementById("message1");
const countdownText = document.getElementById("countdown");
let countdownTimer = null;

// === Check initialization localStorage Is cooling (Verify Code Time)===
window.addEventListener("load", () => 
    {
  const cooldownEnd = localStorage.getItem("otpCooldownEnd");
  if (cooldownEnd) {
    const remaining = Math.ceil((parseInt(cooldownEnd) - Date.now()) / 1000);
    if (remaining > 0) 
        {
      startCooldown(remaining);
    } else 
        {
      localStorage.removeItem("otpCooldownEnd");
    }
  }
});
// === stopCooldown(seconds) === 
function startCooldown(seconds) 
{
  let remaining = seconds;
  sendBtn.disabled = true;
  sendBtn.textContent = `Please wait ${remaining}s`;
  countdownText.textContent = `Please wait ${remaining} Seconds Send again`;

  countdownTimer = setInterval(() => 
    {
    remaining--;
    if (remaining > 0) 
        {
      sendBtn.textContent = `Please wait ${remaining}s`;
      countdownText.textContent = `Please wait ${remaining} Seconds Send again`;
    } else 
        {
      stopCooldown();
    }
  }, 1000);
}

// === stopCooldown ===
function stopCooldown() 
{
  clearInterval(countdownTimer);
  sendBtn.disabled = false;
  sendBtn.textContent = "Send Verify Code";
  countdownText.textContent = "";
}
// === Send Verify Code ===
sendBtn.addEventListener("click", async () => 
    {
  const phone = phoneInput.value.trim();
  if (!phone.startsWith("+")) 
    {
    message.textContent = "Please enter the complete international number.（EG: +8869xxxxxxx）";
    return;
  }

  message.textContent = "Verify Code Is Sending...";
  sendBtn.disabled = true;
  startCooldown(60);
  localStorage.setItem("otpCooldownEnd", Date.now() + 60000);
  try 
  {
    const res = await fetch(`${API_BASE}/send-otp`, 
        {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json();
    if (data.message === "This Number was exist") {
      message.style.color = "red";
      message1.textContent = "This Number was exist，Do Not Register again！";
      sendBtn.disabled = false;
      return;
    }
    if (res.ok) 
        {
      message.textContent = "Verify Code Is Send！Please Check Your Phone Massage";
    } else 
        {
      message.textContent = "Send ERROR：" + (data.error || "Unknown");
      sendBtn.disabled = false;
    }
  } catch (err) 
  {
    console.error(err);
    message.textContent = "ERROR NET,Please wait again";
    sendBtn.disabled = false;
  }
});

// === Check OTP ===
verifyBtn.addEventListener("click", async () => 
  {
  const phone = phoneInput.value.trim();
  const code = otpInput.value.trim();

  if (!code) {
    message.textContent = "Enter Verify Code";
    return;
  }

  message.textContent = "IS Checking...";
  verifyBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/verify-otp`, 
      {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });

    const data = await res.json();
    if (res.ok && data.verified) 
        {
      message.textContent = " Success！...";
      setTimeout(() => 
        {
        window.location.href = "welcome.html";
      }, 1000);
      localStorage.removeItem("otpCooldownEnd");
    } else 
        {
      message.textContent = "Verify Code ERROR，Please Enter COde Correct";
      verifyBtn.disabled = false;
    }
  } catch (err) {
    console.error(err);
    message.textContent = "SERVER ERROR,Plases wait try again";
    verifyBtn.disabled = false;
  }
});
