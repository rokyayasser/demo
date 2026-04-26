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

      if (!email || !password) {
        return this.badRequest(res, "Email and password are required");
      }

      if (
        email === process.env.DOCTOR_EMAIL &&
        password === process.env.DOCTOR_PASSWORD
      ) {
        // FIX: added role: "doctor" so authDoctor middleware passes the check
        const token = jwt.sign(
          {
            email,
            role: "doctor", // ← was missing, caused 403 on every protected route
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
            doctor: {
              name: "د. الخطيب",
              email,
              specialty: "الطب العام",
            },
          },
          "Login successful",
        );
      } else {
        return this.unauthorized(res, "Invalid credentials");
      }
    } catch (error) {
      return this.error(res, error.message);
    }
  }
}

module.exports = new DoctorAuthController();
