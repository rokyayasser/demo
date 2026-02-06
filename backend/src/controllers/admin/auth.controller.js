const BaseController = require("../BaseController");
const jwt = require("jsonwebtoken");

class AdminAuthController extends BaseController {
  constructor() {
    super();
    this.login = this.login.bind(this);
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      console.log("=== ADMIN LOGIN ATTEMPT ===");
      console.log("Email:", email);

      if (!email || !password) {
        return this.badRequest(res, "Email and password are required");
      }

      // Check admin credentials
      if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
      ) {
        const token = jwt.sign(
          {
            email,
            isAdmin: true,
            userId: "admin-" + Date.now(),
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );

        console.log("✅ Admin login successful for:", email);

        return this.success(
          res,
          {
            token,
            admin: {
              email,
              name: "Administrator",
            },
          },
          "Login successful"
        );
      } else {
        console.log("❌ Invalid admin credentials for:", email);
        return this.unauthorized(res, "Invalid credentials");
      }
    } catch (error) {
      return this.error(res, error.message);
    }
  }
}

module.exports = new AdminAuthController();
