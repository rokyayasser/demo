const BaseController = require("../BaseController");
const jwt = require("jsonwebtoken");

class DoctorAuthController extends BaseController {
  constructor() {
    super();
    this.login = this.login.bind(this);
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      console.log("=== DOCTOR LOGIN ATTEMPT ===");
      console.log("Email:", email);

      if (!email || !password) {
        return this.badRequest(res, "Email and password are required");
      }

      // Check doctor credentials
      if (
        email === process.env.DOCTOR_EMAIL &&
        password === process.env.DOCTOR_PASSWORD
      ) {
        const token = jwt.sign(
          {
            email,
            isDoctor: true,
            userId: "doctor-" + Date.now(),
            name: "د. الخطيب",
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );

        console.log("✅ Doctor login successful for:", email);

        return this.success(
          res,
          {
            token,
            doctor: {
              name: "د. الخطيب",
              email: email,
              specialty: "الطب العام",
            },
          },
          "Login successful"
        );
      } else {
        console.log("❌ Invalid doctor credentials for:", email);
        return this.unauthorized(res, "Invalid credentials");
      }
    } catch (error) {
      return this.error(res, error.message);
    }
  }
}

module.exports = new DoctorAuthController();
