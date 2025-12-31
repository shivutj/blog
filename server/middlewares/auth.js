import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "bCOEhnvpx3v29Wml6ETCzMW4FeL1rlZkR51Iu7eJk+c=";

// Decode client-generated fake tokens (base64 encoded)
const decodeClientToken = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
};

// Middleware to verify JWT token
export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.json({ success: false, message: "No token provided" });
    }

    let decoded;

    // Try real JWT verification first
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      // If real JWT fails, try decoding client-generated fake token
      decoded = decodeClientToken(token);
    }

    if (!decoded) {
      return res.json({ success: false, message: "Invalid token" });
    }

    req.userId = decoded.userId;
    req.plan = decoded.plan || "free";
    req.free_usage = decoded.free_usage || 0;

    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      plan: user.plan || "free",
      free_usage: user.free_usage || 0,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};
