function toggleMenu() {
  const menu = document.getElementById("mobileMenu");
  menu.classList.toggle("show");
  document.body.classList.toggle("no-scroll", menu.classList.contains("show"));
}
document.getElementById('admissionForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = document.getElementById('submitBtn');
  const loading = document.getElementById('loading');
  const statusMessage = document.getElementById('statusMessage');
  const mobileInput = document.getElementById('mobile');

  if (!/^[6-9]\d{9}$/.test(mobileInput.value)) {
    showStatus('❌ Please enter a valid 10-digit mobile number starting with 6-9', 'error');
    return;
  }

  const formData = new FormData(form);
  const data = {
    name: formData.get("name"),
    mobile: formData.get("mobile"),
    email: formData.get("email"),
    preferred_course: formData.get("preferred_course"),
    jee_rank: formData.get("jee_rank"),
    message: formData.get("message")
  };

  // ✅ Immediately show success message
  showStatus('✅ Your application is being processed...\n📲 We’ll contact you in 24 hrs on WhatsApp.', 'success');
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitted!";
  loading.style.display = 'none';
  form.reset();

  // ✅ Send data in background (no need to wait)
  setTimeout(() => {
    sendToGoogleSheets(formData);
    sendTelegramMessage(data);
  }, 100);
});

function sendToGoogleSheets(formData) {
  fetch("https://script.google.com/macros/s/AKfycbxpigYbdwldu_XOkqPmbxhNExBrAIob6XsqhT6yty6wKUD7bLw3fg2x1jVxmZYLFEywIQ/exec", {
    method: "POST",
    body: formData
  })
  .then(res => res.text())
  .then(text => console.log("Sheets Response:", text))
  .catch(err => console.error("Google Sheets Error:", err));
}


function sendTelegramMessage(data) {
  const TELEGRAM_TOKEN = "7919528187:AAFnPUWidgAj9UFs7KPXaOHK1iOV90KYUEM";
  const CHAT_ID = "-4929874649";

  const message = `
📝 *New Admission Form Submitted!*

👤 Name: ${data.name}
📱 Mobile: ${data.mobile}
📧 Email: ${data.email || 'N/A'}
🎯 Course: ${data.preferred_course}
📊 Rank/Score: ${data.jee_rank || 'N/A'}
📌 Message: ${data.message || 'None'}
`;

  fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: "Markdown"
    })
  })
    .then(res => res.json())
    .then(res => console.log("Telegram Response:", res))
    .catch(err => console.error("Telegram Error:", err));
}

function showStatus(message, type) {
  const statusMessage = document.getElementById('statusMessage');
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.style.display = 'block';

  setTimeout(() => {
    statusMessage.style.display = 'none';
  }, 8000);
}

// Auto-scroll to form if ?autoapply=true in URL
window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("autoapply") === "true") {
    const applyBtn = document.querySelector('.apply-now-btn a[href="#admission-form"]');
    if (applyBtn) {
      applyBtn.click();
    }

    const formSection = document.getElementById("admission-form");
    if (formSection) {
      setTimeout(() => {
        formSection.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  }
};// Show popup based on query or timer
window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("lead") === "true") {
    openPopup();
  } else {
    setTimeout(openPopup, -2500); // auto-show after 6s
  }
};

function openPopup() {
  document.getElementById('leadPopup').style.display = 'flex';
}

function closePopup() {
  document.getElementById('leadPopup').style.display = 'none';
}

// Handle popup form submission
document.getElementById('leadPopupForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const name = document.getElementById("popupName").value.trim();
  const mobile = document.getElementById("popupMobile").value.trim();
  const course = document.getElementById("popupCourse").value;

  if (!name || !/^\d{10}$/.test(mobile)) {
    alert("Please enter a valid name and 10-digit mobile number.");
    return;
  }
   gtag('event', 'popup_form_submit', {
      event_category: 'Lead',
      event_label: 'Popup Admission Form',
      value: 1
    });

  const TELEGRAM_TOKEN = "7919528187:AAFnPUWidgAj9UFs7KPXaOHK1iOV90KYUEM";
  const CHAT_ID = "-4929874649";
  const message = `New lead through popup
📥 *New Lead Submitted (Popup)*

👤 Name: ${name}
📱 Mobile: ${mobile}
🎓 Course: ${course}
`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "Markdown"
      })
    });

    document.getElementById('leadPopupForm').reset();
    document.getElementById('leadPopup').style.display = 'none';
    alert("✅ Thanks! We'll reach out to you shortly.");
  } catch (error) {
    alert("❌ Failed to send. Try again.");
  }
});




