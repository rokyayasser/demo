const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.configure();
  }

  configure() {
    try {
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.warn(
          "⚠️ Gmail credentials missing. Email service will not work."
        );
        return;
      }

      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER.trim(),
          pass: process.env.GMAIL_APP_PASSWORD.trim(),
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      this.isConfigured = true;
      console.log("✅ Email service configured successfully");
    } catch (error) {
      console.error("❌ Failed to configure email service:", error);
      this.isConfigured = false;
    }
  }

  async verifyConnection() {
    if (!this.isConfigured) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log("✅ Email connection verified");
      return true;
    } catch (error) {
      console.error("❌ Email connection failed:", error);
      return false;
    }
  }

  async sendAppointmentConfirmation(
    appointment,
    user,
    service,
    isAdmin = false,
    adminName = ""
  ) {
    if (!this.isConfigured) {
      console.warn("⚠️ Email service not configured");
      return { success: false, error: "Email service not configured" };
    }

    try {
      const subject = isAdmin
        ? "تأكيد موعدك من إدارة العيادة - الخطيب فارما"
        : "تأكيد حجز موعد - الخطيب فارما";

      const htmlContent = this.generateAppointmentEmail(
        appointment,
        user,
        service,
        isAdmin,
        adminName
      );

      const mailOptions = {
        from: `"الخطيب فارما" <${process.env.GMAIL_USER}>`,
        to: user.email,
        subject: subject,
        html: htmlContent,
        headers: {
          "X-Priority": "1",
          "X-MSMail-Priority": "High",
          Importance: "high",
        },
      };

      console.log(`📧 Sending appointment confirmation to: ${user.email}`);
      const info = await this.transporter.sendMail(mailOptions);

      console.log(`✅ Email sent successfully: ${info.messageId}`);

      if (process.env.NODE_ENV !== "production") {
        console.log("🔗 Preview URL:", nodemailer.getTestMessageUrl(info));
      }

      return {
        success: true,
        messageId: info.messageId,
        recipient: user.email,
      };
    } catch (error) {
      console.error("❌ Error sending email:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  generateAppointmentEmail(
    appointment,
    user,
    service,
    isAdmin = false,
    adminName = ""
  ) {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تأكيد الحجز</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
          .header { background: linear-gradient(135deg, #6D28D9 0%, #A78BFA 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .details-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #6D28D9; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
          h1, h2, h3 { color: #2D1B3D; }
          .highlight { color: #6D28D9; font-weight: bold; }
          .admin-note { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${isAdmin ? "✅ تم تأكيد موعدك من الإدارة" : "✅ تم تأكيد حجز موعدك"}</h1>
          <p>مرحباً ${user.name}،</p>
        </div>
        
        <div class="content">
          <p>${isAdmin ? "يسعدنا إعلامك بأن موعدك قد تم تأكيده من قبل إدارة مركز الخطيب فارما." : "نشكرك على حجز موعد مع مركز الخطيب فارما. تم تأكيد حجزك بنجاح."}</p>
          
          ${
            isAdmin
              ? `
          <div class="admin-note">
            <h3>📝 ملاحظة من الإدارة:</h3>
            <p>تم تأكيد موعدك بواسطة <strong>${adminName}</strong></p>
          </div>
          `
              : ""
          }
          
          <div class="details-box">
            <h2>📋 تفاصيل الحجز</h2>
            <p><strong>رقم الحجز:</strong> <span class="highlight">${appointment._id}</span></p>
            <p><strong>الخدمة:</strong> ${service?.title_ar || appointment.category || "غير محدد"}</p>
            <p><strong>التاريخ:</strong> ${appointment.date}</p>
            ${appointment.time ? `<p><strong>الوقت:</strong> ${appointment.time}</p>` : ""}
            <p><strong>المبلغ:</strong> ${appointment.amount} جنيه مصري</p>
            <p><strong>حالة الدفع:</strong> ${appointment.paid ? "مدفوع ✓" : "غير مدفوع"}</p>
            <p><strong>حالة الحجز:</strong> ${this.getStatusTextAr(appointment.status)}</p>
          </div>
          
          <div class="details-box">
            <h2>👤 معلومات المريض</h2>
            <p><strong>الاسم:</strong> ${user.name}</p>
            <p><strong>البريد الإلكتروني:</strong> ${user.email}</p>
            ${user.phone ? `<p><strong>رقم الهاتف:</strong> ${user.phone}</p>` : ""}
          </div>
          
          <h3>📝 تعليمات مهمة:</h3>
          <ul>
            <li>يرجى الحضور قبل الموعد بـ 15 دقيقة على الأقل.</li>
            <li>احضر معك بطاقة الهوية وأي تقارير طبية سابقة.</li>
            <li>في حالة الرغبة في إلغاء الموعد، يرجى التواصل قبل 24 ساعة على الأقل.</li>
          </ul>
          
          <p>لأي استفسارات، يمكنك التواصل معنا:</p>
          <p><strong>📞 الهاتف:</strong> +20 100 000 0000</p>
          <p><strong>📧 البريد الإلكتروني:</strong> info@khateebpharma.com</p>
          <p><strong>📍 العنوان:</strong> القاهرة، مصر</p>
        </div>
        
        <div class="footer">
          <p>شكراً لاختياركم مركز الخطيب فارما</p>
          <p>نتمنى لكم الصحة والعافية</p>
          <p>© ${new Date().getFullYear()} مركز الخطيب فارما. جميع الحقوق محفوظة.</p>
        </div>
      </body>
      </html>
    `;
  }

  getStatusTextAr(status) {
    const statusMap = {
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      completed: "مكتمل",
      cancelled: "ملغي",
      no_show: "لم يحضر",
      blocked: "محظور",
    };
    return statusMap[status] || status;
  }

  async sendPasswordResetEmail(email, resetToken) {
    if (!this.isConfigured) {
      return { success: false, error: "Email service not configured" };
    }

    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>إعادة تعيين كلمة المرور</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #6D28D9; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1>إعادة تعيين كلمة المرور</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <p>مرحباً،</p>
              <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك.</p>
              <p>اضغط على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #6D28D9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  إعادة تعيين كلمة المرور
                </a>
              </div>
              <p>إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.</p>
              <p>هذا الرابط ساري لمدة ساعة واحدة فقط.</p>
              <hr style="margin: 20px 0;">
              <p>مع تحيات،<br>فريق مركز الخطيب فارما</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"الخطيب فارما" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "إعادة تعيين كلمة المرور - الخطيب فارما",
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(user) {
    if (!this.isConfigured) {
      return { success: false, error: "Email service not configured" };
    }

    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>مرحباً بك في الخطيب فارما</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #6D28D9; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1>مرحباً بك في الخطيب فارما</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <p>مرحباً ${user.name}،</p>
              <p>نشكرك على انضمامك إلى مركز الخطيب فارما.</p>
              <p>يمكنك الآن الاستفادة من خدماتنا الطبية المتكاملة:</p>
              <ul>
                <li>حجز المواعيد الطبية بسهولة</li>
                <li>الاستشارات الطبية المتخصصة</li>
                <li>متابعة حالتك الصحية</li>
                <li>استلام التقارير الطبية</li>
              </ul>
              <p>لبدء استخدام خدماتنا، يمكنك تسجيل الدخول إلى حسابك.</p>
              <hr style="margin: 20px 0;">
              <p>مع تحيات،<br>فريق مركز الخطيب فارما</p>
              <p><strong>للتواصل:</strong></p>
              <p>📞 الهاتف: +20 100 000 0000</p>
              <p>📧 البريد: info@khateebpharma.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"الخطيب فارما" <${process.env.GMAIL_USER}>`,
        to: user.email,
        subject: "مرحباً بك في الخطيب فارما",
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
