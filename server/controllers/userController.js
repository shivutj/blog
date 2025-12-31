import sql from "../configs/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../middlewares/auth.js";

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// User Registration
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("Registration attempt for:", email);

    // Validate input fields
    if (!name || !email || !password) {
      console.log("Validation failed: Missing fields");
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      console.log("Validation failed: Invalid email format");
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Validate password length
    if (password.length < 6) {
      console.log("Validation failed: Password too short");
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    console.log("Checking for existing user...");
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      console.log("User already exists with email:", email);
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Hash password
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Creating new user...");

    // Insert new user
    const [newUser] = await sql`
            INSERT INTO users (name, email, password, plan, free_usage, created_at, updated_at)
            VALUES (${name}, ${email}, ${hashedPassword}, 'free', 0, NOW(), NOW())
            RETURNING id, name, email, plan, free_usage
        `;

    console.log("User created successfully with ID:", newUser.id);

    // Generate JWT token
    const token = generateToken(newUser);

    console.log("Registration successful for:", email);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        plan: newUser.plan,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred during registration. Please try again.",
    });
  }
};

// User Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req;

    const [user] = await sql`
            SELECT id, name, email, plan, free_usage, created_at 
            FROM users 
            WHERE id = ${userId}
        `;

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Profile error:", error);
    res.json({ success: false, message: error.message });
  }
};

export const getUserCreations = async (req, res) => {
  try {
    const { userId } = req;

    const creations =
      await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;

    res.json({ success: true, creations });
  } catch (error) {
    console.error("Creations error:", error);
    res.json({ success: false, message: error.message });
  }
};

export const getPublishedCreations = async (req, res) => {
  try {
    const creations = await sql`
       SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;

    res.json({ success: true, creations });
  } catch (error) {
    console.error("Published creations error:", error);
    res.json({ success: false, message: error.message });
  }
};

export const toggleLikeCreation = async (req, res) => {
  try {
    const { userId } = req;
    const { id } = req.body;

    const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`;

    if (!creation) {
      return res.json({ success: false, message: "Creation not found" });
    }

    const currentLikes = creation.likes;
    const userIdStr = userId.toString();
    let updatedLikes;
    let message;

    if (currentLikes.includes(userIdStr)) {
      updatedLikes = currentLikes.filter((user) => user !== userIdStr);
      message = "Creation Unliked";
    } else {
      updatedLikes = [...currentLikes, userIdStr];
      message = "Creation Liked";
    }

    const formattedArray = `{${updatedLikes.join(",")}}`;

    await sql`UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}`;

    res.json({ success: true, message });
  } catch (error) {
    console.error("Like error:", error);
    res.json({ success: false, message: error.message });
  }
};
