const BaseController = require("../BaseController");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  userValidation,
} = require("../../middlewares/validation/user.validation");

class UserAuthController extends BaseController {
  constructor() {
    super();
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
  }

  async register(req, res) {
    try {
      // Validate input
      const { error, value } = userValidation.register.validate(req.body);
      if (error) return this.validationError(res, error.details);

      const { name, email, password, phone } = value;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return this.conflict(res, "User already exists");
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
      });

      await user.save();

      // Generate token
      const token = jwt.sign(
        { id: user._id, email: user.email, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Remove password from response
      user.password = undefined;

      return this.success(res, { user, token }, "User registered successfully");
    } catch (error) {
      return this.error(res, error.message);
    }
  }

  async login(req, res) {
    try {
      // Validate input
      const { error, value } = userValidation.login.validate(req.body);
      if (error) return this.validationError(res, error.details);

      const { email, password } = value;

      // Find user
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return this.unauthorized(res, "Invalid email or password");
      }

      // Check if account is locked
      if (user.isLocked()) {
        return this.tooManyRequests(
          res,
          "Account is locked. Please try again later."
        );
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        // Increment login attempts
        await user.incLoginAttempts();
        return this.unauthorized(res, "Invalid email or password");
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts(); // ✅ Use instance method, not static method

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = jwt.sign(
        { id: user._id, email: user.email, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Remove password from response
      user.password = undefined;

      return this.success(res, { user, token }, "Login successful");
    } catch (error) {
      return this.error(res, error.message);
    }
  }
}

module.exports = new UserAuthController();
