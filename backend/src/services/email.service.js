// services/email.service.js
const nodemailer = require("nodemailer");

// ─── Transporter ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || process.env.EMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS,
  },
});

// Verify transporter on startup — logs clearly if Gmail credentials are wrong
transporter.verify((error) => {
  if (error) {
    console.error("❌ Email transporter verification failed:", error.message);
    console.error("   Check GMAIL_USER and GMAIL_APP_PASSWORD in .env");
  } else {
    console.log(
      "✅ Email transporter ready —",
      process.env.GMAIL_USER || process.env.EMAIL_USER,
    );
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const baseStyle = `
  font-family: 'Segoe UI', Arial, sans-serif;
  direction: rtl;
  text-align: right;
  color: #1a1a2e;
  background: #f8f9ff;
  padding: 0;
  margin: 0;
`;

const wrap = (body) => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="${baseStyle}">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1D014B,#3A1F66);padding:32px 40px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">فارمكولوجي</h1>
      <p style="color:#c4b5fd;margin:8px 0 0;font-size:14px;">د. أحمد الخطيب</p>
    </div>
    <!-- Body -->
    <div style="padding:40px;">
      ${body}
    </div>
    <!-- Footer -->
    <div style="background:#f1f5ff;padding:20px 40px;text-align:center;border-top:1px solid #e8eaf6;">
      <p style="color:#6b7280;font-size:12px;margin:0;">
        © 2026 فارمكولوجي — جميع الحقوق محفوظة<br/>
        للتواصل: <a href="mailto:${process.env.EMAIL_USER}" style="color:#7c3aed;">${process.env.EMAIL_USER}</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

// ─── 1. Course access email (sent after successful payment) ───────────────────
/**
 * @param {object} params
 * @param {string} params.toEmail
 * @param {string} params.userName
 * @param {string} params.courseTitle
 * @param {string} params.courseUrl      - URL of the in-app player page e.g. /learn/COURSE_ID
 * @param {string} params.playlistUrl    - The unlisted YouTube playlist URL (stored in DB, never public)
 */
const sendCourseAccessEmail = async ({
  toEmail,
  userName,
  courseTitle,
  courseUrl,
  playlistUrl,
}) => {
  const body = `
    <h2 style="color:#1D014B;margin-top:0;">مبروك! تم اشتراكك بنجاح 🎉</h2>
    <p style="color:#374151;line-height:1.8;font-size:15px;">
      أهلاً <strong>${userName}</strong>،<br/>
      تم تأكيد اشتراكك في كورس <strong>${courseTitle}</strong> بنجاح.
    </p>

    <div style="background:#f5f3ff;border-right:4px solid #7c3aed;border-radius:8px;padding:20px;margin:24px 0;">
      <p style="margin:0 0 8px;font-weight:700;color:#1D014B;">كيف تبدأ الكورس:</p>
      <ol style="margin:0;padding-right:20px;color:#374151;line-height:2;font-size:14px;">
        <li>افتح صفحة الكورس عبر الزر أدناه</li>
        <li>شاهد الفيديوهات بالترتيب</li>
        <li>وضّح تقدمك بعد إنهاء كل درس</li>
        <li>احصل على شهادتك بعد إتمام 100%</li>
      </ol>
    </div>

    <div style="text-align:center;margin:32px 0;">
      <a href="${courseUrl}"
         style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#9b61db);color:#fff;
                text-decoration:none;padding:14px 36px;border-radius:12px;font-size:16px;font-weight:700;">
        ابدأ الكورس الآن
      </a>
    </div>

    ${
      playlistUrl
        ? `
    <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:12px;padding:20px;margin:24px 0;text-align:center;">
      <p style="font-weight:700;color:#92400e;margin:0 0 12px;font-size:15px;">🎥 رابط قائمة تشغيل الكورس على YouTube</p>
      <a href="${playlistUrl}"
         style="display:inline-block;background:#f59e0b;color:#fff;text-decoration:none;
                padding:10px 28px;border-radius:10px;font-size:14px;font-weight:700;word-break:break-all;">
        مشاهدة الكورس على YouTube
      </a>
      <p style="color:#92400e;font-size:12px;margin:12px 0 0;">
        🔒 هذا الرابط خاص بك — يُرجى عدم مشاركته مع أي شخص آخر
      </p>
    </div>
    `
        : ""
    }

    <p style="color:#6b7280;font-size:13px;margin-top:16px;">
      هذا البريد خاص بك — يُرجى عدم مشاركته مع أي شخص آخر.
    </p>
  `;

  await transporter.sendMail({
    from: `"فارمكولوجي — د. أحمد الخطيب" <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `✅ تم تأكيد اشتراكك في كورس: ${courseTitle}`,
    html: wrap(body),
  });

  console.log(`Course access email sent to ${toEmail}`);
};

// ─── 2. Certificate email (sent after 100% completion) ───────────────────────
/**
 * @param {object} params
 * @param {string} params.toEmail
 * @param {string} params.userName
 * @param {string} params.courseTitle
 * @param {string} params.completionDate  - formatted string e.g. "10 أبريل 2026"
 * @param {Buffer} params.certificatePdf  - PDF buffer from certificate generator
 */
const sendCertificateEmail = async ({
  toEmail,
  userName,
  courseTitle,
  completionDate,
  certificatePdf,
}) => {
  const body = `
    <h2 style="color:#1D014B;margin-top:0;">مبروك على إتمام الكورس! 🏆</h2>
    <p style="color:#374151;line-height:1.8;font-size:15px;">
      أهلاً <strong>${userName}</strong>،<br/>
      أنت أتممت كورس <strong>${courseTitle}</strong> بنجاح بتاريخ ${completionDate}.
      شهادتك مرفقة مع هذا البريد — يمكنك طباعتها أو مشاركتها مباشرةً.
    </p>

    <div style="background:#f0fdf4;border-right:4px solid #16a34a;border-radius:8px;padding:20px;margin:24px 0;">
      <p style="margin:0;color:#166534;font-weight:700;font-size:15px;">
        شهادة إتمام كورس "${courseTitle}" مرفقة بهذا البريد كملف PDF.
      </p>
    </div>

    <p style="color:#6b7280;font-size:13px;">
      شكراً لثقتك بنا — نتمنى لك رحلة صحية ناجحة!
    </p>
  `;

  await transporter.sendMail({
    from: `"فارمكولوجي — د. أحمد الخطيب" <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `🏆 شهادة إتمام كورس: ${courseTitle}`,
    html: wrap(body),
    attachments: [
      {
        filename: `certificate-${courseTitle.replace(/\s+/g, "-")}.pdf`,
        content: certificatePdf,
        contentType: "application/pdf",
      },
    ],
  });

  console.log(`Certificate email sent to ${toEmail}`);
};

// ─── Appointment status change email ─────────────────────────────────────────
const STATUS_COLORS = {
  confirmed: { bg: "#d1fae5", text: "#065f46", label: "مؤكد ✓" },
  completed: { bg: "#dbeafe", text: "#1e40af", label: "مكتمل ✓" },
  cancelled: { bg: "#fee2e2", text: "#991b1b", label: "ملغي" },
  no_show: { bg: "#f3f4f6", text: "#374151", label: "لم يحضر" },
  pending: { bg: "#fef9c3", text: "#92400e", label: "قيد الانتظار" },
};

const sendAppointmentStatusEmail = async ({
  toEmail,
  userName,
  status,
  statusAr,
  serviceName,
  date,
  time,
  doctorNotes,
  appointmentUrl,
}) => {
  const style = STATUS_COLORS[status] || STATUS_COLORS.pending;

  const body = `
    <div style="padding:32px;">
      <h2 style="font-size:22px;font-weight:700;margin-bottom:8px;">مرحباً ${userName} 👋</h2>
      <p style="color:#555;margin-bottom:24px;">تم تحديث حالة موعدك</p>

      <!-- Status badge -->
      <div style="background:${style.bg};color:${style.text};border-radius:12px;padding:16px 24px;
        text-align:center;font-size:20px;font-weight:700;margin-bottom:24px;">
        ${style.label}
      </div>

      <!-- Appointment details -->
      <div style="background:#f8f9ff;border-radius:12px;padding:20px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#666;width:40%;">الخدمة</td>
            <td style="padding:8px 0;font-weight:600;">${serviceName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#666;">التاريخ</td>
            <td style="padding:8px 0;font-weight:600;">${date || "—"}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#666;">الوقت</td>
            <td style="padding:8px 0;font-weight:600;">${time || "—"}</td>
          </tr>
        </table>
      </div>

      ${
        doctorNotes
          ? `
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-bottom:20px;">
        <p style="font-weight:600;color:#92400e;margin:0 0 6px;">ملاحظات الطبيب:</p>
        <p style="color:#555;margin:0;">${doctorNotes}</p>
      </div>`
          : ""
      }

      <a href="${appointmentUrl}"
        style="display:block;text-align:center;background:linear-gradient(135deg,#1e4b8f,#9b61db);
        color:#fff;text-decoration:none;padding:14px 24px;border-radius:12px;
        font-weight:700;font-size:16px;margin-top:8px;">
        عرض المواعيد
      </a>
    </div>
  `;

  await transporter.sendMail({
    from: `"فارمكولوجي — د. أحمد الخطيب" <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `تحديث موعدك — ${statusAr || status}`,
    html: wrap(body),
  });

  console.log(`Status email sent to ${toEmail} — ${status}`);
};

// ─── Order confirmation email ─────────────────────────────────────────────────
const sendOrderConfirmationEmail = async ({
  toEmail,
  userName,
  orderId,
  amount,
  items = [],
}) => {
  const itemRows = items
    .map(
      (i) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">${i.name || i.title || "منتج"}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:center;">${i.quantity || 1}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:left;">${((i.amount_cents || 0) / 100).toLocaleString()} جنيه</td>
    </tr>`,
    )
    .join("");

  const body = `
    <div style="padding:32px;">
      <h2 style="font-size:22px;font-weight:700;margin-bottom:8px;">شكراً ${userName}! 🎉</h2>
      <p style="color:#555;margin-bottom:24px;">تم تأكيد طلبك بنجاح ومعالجة الدفع.</p>

      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:16px;
        text-align:center;margin-bottom:24px;">
        <p style="font-size:18px;font-weight:700;color:#15803d;margin:0;">
          ✅ تم الدفع بنجاح — ${Number(amount).toLocaleString()} جنيه
        </p>
      </div>

      <div style="background:#f8f9ff;border-radius:12px;padding:20px;margin-bottom:20px;">
        <p style="font-weight:600;margin-bottom:12px;">تفاصيل الطلب — رقم: ${orderId}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="color:#666;">
              <th style="text-align:right;padding-bottom:8px;border-bottom:2px solid #e2e8f0;">المنتج</th>
              <th style="text-align:center;padding-bottom:8px;border-bottom:2px solid #e2e8f0;">الكمية</th>
              <th style="text-align:left;padding-bottom:8px;border-bottom:2px solid #e2e8f0;">السعر</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding-top:12px;font-weight:700;">الإجمالي</td>
              <td style="padding-top:12px;font-weight:700;text-align:left;">${Number(amount).toLocaleString()} جنيه</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p style="color:#666;font-size:14px;line-height:1.7;">
        سيتم التواصل معك قريباً لتأكيد تفاصيل الشحن.
        إذا كان لديك أي استفسار، لا تتردد في التواصل معنا.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"فارمكولوجي — د. أحمد الخطيب" <${process.env.GMAIL_USER || process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `✅ تأكيد طلبك رقم ${orderId}`,
    html: wrap(body),
  });

  console.log(`Order confirmation email sent to ${toEmail}`);
};

module.exports = {
  transporter,
  sendCourseAccessEmail,
  sendCertificateEmail,
  sendAppointmentStatusEmail,
  sendOrderConfirmationEmail,
};
