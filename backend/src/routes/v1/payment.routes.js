const express = require("express");
const router = express.Router();

// Controllers
const sharedPaymentController = require("../../controllers/shared/payment.controller");

// Middlewares
const authUser = require("../../middlewares/auth/user.auth");

router.get("/page/:paymentKey", (req, res) => {
  const { paymentKey } = req.params;
  const iframeId = process.env.PAYMOB_IFRAME_ID;

  res.send(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>الدفع - الخطيب فارما</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .header {
          background: white;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          text-align: center;
        }
        .header h1 {
          color: #667eea;
          font-size: 1.5rem;
        }
        .container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .payment-frame {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          width: 100%;
          max-width: 800px;
          height: 700px;
          overflow: hidden;
          position: relative;
        }
        iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        .loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          z-index: 10;
          background: white;
          padding: 2rem;
          border-radius: 10px;
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .close-btn {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(255,255,255,0.9);
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          color: #667eea;
          z-index: 20;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏥 عيادة الخطيب فارما - بوابة الدفع الآمنة</h1>
      </div>
      <div class="container">
        <div class="payment-frame">
          <button class="close-btn" onclick="window.close()">✕ إغلاق</button>
          <div class="loading" id="loading">
            <div class="spinner"></div>
            <p style="margin-top: 1rem; color: #666;">جاري تحميل بوابة الدفع...</p>
          </div>
          <iframe 
            id="payment-iframe"
            src="https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}"
            frameborder="0"
            allow="payment"
            onload="document.getElementById('loading').style.display='none'"
          ></iframe>
        </div>
      </div>
      <script>
        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'payment_success') {
            setTimeout(() => window.close(), 2000);
          }
        });
        setTimeout(() => {
          alert('انتهت مهلة الدفع. سيتم إغلاق النافذة.');
          window.close();
        }, 600000);
      </script>
    </body>
    </html>
  `);
});
// Initiate payment (requires user authentication)
router.post("/initiate", authUser, sharedPaymentController.initiatePayment);

// Paymob callback (no auth needed - called by Paymob)
router.post("/callback", sharedPaymentController.handleCallback);

// Test callback endpoint (for debugging)
router.post("/test-callback", (req, res) => {
  console.log("=== TEST CALLBACK RECEIVED ===");
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  res.json({
    success: true,
    message: "Test callback received",
    receivedData: req.body,
  });
});

// Check payment status (requires user authentication)
router.get(
  "/status/:appointmentId",
  authUser,
  sharedPaymentController.checkPaymentStatus,
);

// Verify payment with Paymob API (requires user authentication)
router.get(
  "/verify/:appointmentId",
  authUser,
  sharedPaymentController.verifyPayment,
);

module.exports = router;
