// services/certificate.service.js
"use strict";

const puppeteer = require("puppeteer");

// Format date in Arabic
const formatArabicDate = (dateInput) => {
  const arabicDigits = {
    0: "٠",
    1: "١",
    2: "٢",
    3: "٣",
    4: "٤",
    5: "٥",
    6: "٦",
    7: "٧",
    8: "٨",
    9: "٩",
  };

  const months = {
    January: "يناير",
    February: "فبراير",
    March: "مارس",
    April: "أبريل",
    May: "مايو",
    June: "يونيو",
    July: "يوليو",
    August: "أغسطس",
    September: "سبتمبر",
    October: "أكتوبر",
    November: "نوفمبر",
    December: "ديسمبر",
  };

  let d;
  if (!dateInput) {
    d = new Date();
  } else if (dateInput instanceof Date) {
    d = dateInput;
  } else if (typeof dateInput === "string") {
    d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      const parts = dateInput.split(/[-/\s]/);
      if (parts.length >= 3) {
        d = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        d = new Date();
      }
    }
  } else if (typeof dateInput === "number") {
    d = new Date(dateInput);
  } else {
    d = new Date();
  }

  if (isNaN(d.getTime())) {
    d = new Date();
  }

  const day = d.getDate();
  const month = months[d.toLocaleString("en", { month: "long" })];
  const year = d.getFullYear();

  const arabicDay = day
    .toString()
    .split("")
    .map((c) => arabicDigits[c] || c)
    .join("");
  const arabicYear = year
    .toString()
    .split("")
    .map((c) => arabicDigits[c] || c)
    .join("");

  return `${arabicDay} ${month} ${arabicYear}`;
};

const generateCertificateHTML = ({
  userName,
  courseTitle,
  completionDate,
  instructorName,
}) => {
  const safeCourseTitle = courseTitle ? String(courseTitle) : "Course";
  const safeUserName = userName ? String(userName) : "Student";
  const safeInstructor = instructorName
    ? String(instructorName)
    : "Dr. Ahmed Elkhateeb";
  const formattedDate = formatArabicDate(completionDate);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate of Completion</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    /* Force single page */
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Arial', 'Segoe UI', sans-serif;
      background: #1D014B;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    
    .certificate {
      width: 1000px;
      height: 707px; /* A4 landscape exact size: 1000 / 707 = 1.414 (A4 ratio) */
      background: linear-gradient(135deg, #1D014B 0%, #2D1060 100%);
      border: 3px solid #D4AF37;
      border-radius: 16px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    
    .certificate::before {
      content: '';
      position: absolute;
      top: 15px;
      left: 15px;
      right: 15px;
      bottom: 15px;
      border: 1px solid #D4AF37;
      border-radius: 10px;
      pointer-events: none;
    }
    
    .header {
      background: #2D1060;
      padding: 20px;
      text-align: center;
      border-bottom: 2px solid #D4AF37;
    }
    
    .header h1 {
      color: #FFFFFF;
      font-size: 28px;
      letter-spacing: 3px;
      margin-bottom: 5px;
    }
    
    .header p {
      color: #C4B5FD;
      font-size: 12px;
    }
    
    .content {
      padding: 30px 50px;
      text-align: center;
      height: calc(100% - 80px - 50px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .top-section {
      flex: 1;
    }
    
    .cert-title {
      color: #D4AF37;
      font-size: 16px;
      letter-spacing: 2px;
      margin-bottom: 15px;
      font-weight: bold;
    }
    
    .divider {
      width: 250px;
      height: 1px;
      background: #D4AF37;
      margin: 15px auto;
      opacity: 0.5;
    }
    
    .certify-text {
      color: #C4B5FD;
      font-size: 14px;
      margin: 20px 0 15px;
    }
    
    .student-name {
      color: #FFFFFF;
      font-size: 40px;
      font-weight: bold;
      margin: 15px 0;
      text-transform: uppercase;
      letter-spacing: 2px;
      word-break: break-word;
    }
    
    .completion-text {
      color: #C4B5FD;
      font-size: 14px;
      margin: 15px 0;
    }
    
    .course-name {
      color: #D4AF37;
      font-size: 20px;
      font-weight: bold;
      margin: 15px 0;
      word-break: break-word;
    }
    
    .divider-bottom {
      width: 350px;
      height: 1px;
      background: #D4AF37;
      margin: 20px auto;
      opacity: 0.5;
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 40px;
      margin-top: 20px;
    }
    
    .footer-item {
      text-align: center;
      flex: 1;
    }
    
    .footer-label {
      color: #C4B5FD;
      font-size: 10px;
      margin-bottom: 8px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .footer-value {
      color: #FFFFFF;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 8px;
      word-break: break-word;
    }
    
    .footer-line {
      width: 120px;
      height: 1px;
      background: #D4AF37;
      margin: 8px auto;
      opacity: 0.5;
    }
    
    .seal {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .seal-circle {
      width: 70px;
      height: 70px;
      border: 2px solid #D4AF37;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: rgba(212, 175, 55, 0.1);
    }
    
    .seal-circle p {
      color: #D4AF37;
      font-size: 7px;
      font-weight: bold;
      margin: 2px 0;
    }
    
    .seal-dot {
      width: 5px;
      height: 5px;
      background: #D4AF37;
      border-radius: 50%;
      margin-top: 4px;
    }
    
    /* Print styles - ensure single page */
    @media print {
      body {
        padding: 0;
        margin: 0;
        background: white;
      }
      .certificate {
        box-shadow: none;
        page-break-after: avoid;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      html, body {
        height: auto;
      }
    }
    
    /* Ensure content doesn't overflow */
    @media (max-height: 750px) {
      .student-name { font-size: 32px; margin: 10px 0; }
      .course-name { font-size: 18px; margin: 10px 0; }
      .content { padding: 20px 40px; }
      .footer { gap: 20px; }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <h1>PHARMACOLOGY</h1>
      <p>Dr. Ahmed Elkhateeb</p>
    </div>
    
    <div class="content">
      <div class="top-section">
        <div class="cert-title">CERTIFICATE OF COMPLETION</div>
        <div class="divider"></div>
        
        <div class="certify-text">This is to certify that</div>
        
        <div class="student-name">${safeUserName}</div>
        
        <div class="completion-text">has successfully completed the course</div>
        
        <div class="course-name">${safeCourseTitle}</div>
        
        <div class="divider-bottom"></div>
      </div>
      
      <div class="footer">
        <div class="footer-item">
          <div class="footer-label">Date of Completion</div>
          <div class="footer-value">${formattedDate}</div>
          <div class="footer-line"></div>
        </div>
        
        <div class="seal">
          <div class="seal-circle">
            <p>PHARMACOLOGY</p>
            <p>CERTIFIED</p>
            <div class="seal-dot"></div>
          </div>
        </div>
        
        <div class="footer-item">
          <div class="footer-label">Instructor</div>
          <div class="footer-value">${safeInstructor}</div>
          <div class="footer-line"></div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

const generateCertificate = async ({
  userName,
  courseTitle,
  completionDate,
  instructorName,
}) => {
  let browser = null;

  try {
    console.log("Generating certificate for:", { userName, courseTitle });

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Set viewport to A4 landscape dimensions
    await page.setViewport({
      width: 1000,
      height: 707,
      deviceScaleFactor: 2,
    });

    const html = generateCertificateHTML({
      userName,
      courseTitle,
      completionDate,
      instructorName,
    });

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    // Generate PDF with exact dimensions
    const pdfBuffer = await page.pdf({
      width: "1000px",
      height: "707px",
      printBackground: true,
      margin: {
        top: "0",
        bottom: "0",
        left: "0",
        right: "0",
      },
      pageRanges: "1", // Force single page
    });

    console.log("PDF generated, size:", pdfBuffer.length);
    return pdfBuffer;
  } catch (error) {
    console.error("Certificate generation error:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = { generateCertificate };
