const BaseController = require("../BaseController");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

class DoctorAuthController extends BaseController {
  constructor() {
    super();
    this.login = this.login.bind(this);
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return this.badRequest(res, "Email and password are required");
      }

      if (email !== process.env.DOCTOR_EMAIL) {
        return this.unauthorized(res, "Invalid credentials");
      }

      // Supports bcrypt hash OR plaintext (temporary fallback)
      const storedPassword = process.env.DOCTOR_PASSWORD || "";
      let passwordMatch = false;

      if (
        storedPassword.startsWith("$2b$") ||
        storedPassword.startsWith("$2a$")
      ) {
        passwordMatch = await bcrypt.compare(password, storedPassword);
      } else {
        console.warn(
          "DOCTOR_PASSWORD is not hashed. Run scripts/hash-passwords.js",
        );
        passwordMatch = password === storedPassword;
      }

      if (!passwordMatch) {
        return this.unauthorized(res, "Invalid credentials");
      }

      const token = jwt.sign(
        {
          email,
          role: "doctor",
          isDoctor: true,
          userId: "doctor",
          name: "د. الخطيب",
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      return this.success(
        res,
        {
          token,
          doctor: { name: "د. الخطيب", email, specialty: "الطب العام" },
        },
        "Login successful",
      );
    } catch (error) {
      return this.error(res, error.message);
    }
  }
}

module.exports = new DoctorAuthController();
