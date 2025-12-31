import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Simple JWT-like token generation using base64
const generateToken = (user) => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan || "free",
      free_usage: user.free_usage || 0,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })
  );
  const signature = btoa("local-signature");
  return `${header}.${payload}.${signature}`;
};

// Decode token to get user data
const decodeToken = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
};

// Get users from localStorage
const getUsers = () => {
  try {
    const users = localStorage.getItem("quickai_users");
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
};

// Save users to localStorage
const saveUsers = (users) => {
  localStorage.setItem("quickai_users", JSON.stringify(users));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("quickai_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUser({
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          plan: decoded.plan,
          free_usage: decoded.free_usage,
        });
      } else {
        // Token expired, logout
        console.log("AuthContext: Token expired, logging out");
        localStorage.removeItem("quickai_token");
        localStorage.removeItem("quickai_current_user");
        setToken(null);
        setUser(null);
      }
    } else {
      console.log("AuthContext: No token found");
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const users = getUsers();
      const userFound = users.find(
        (u) => u.email === email && u.password === password
      );

      if (userFound) {
        // Create token
        const newToken = generateToken(userFound);
        localStorage.setItem("quickai_token", newToken);
        localStorage.setItem("quickai_current_user", JSON.stringify(userFound));
        setToken(newToken);
        setUser(userFound);
        console.log("AuthContext: Login successful for", email);
        return { success: true };
      } else {
        console.log("AuthContext: Login failed - user not found");
        return { success: false, message: "Invalid email or password" };
      }
    } catch (error) {
      console.error("AuthContext: Login error:", error);
      return { success: false, message: "Login failed" };
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log("AuthContext: Attempting registration for:", email);
      const users = getUsers();

      // Check if user already exists
      const existingUser = users.find((u) => u.email === email);
      if (existingUser) {
        console.log("AuthContext: User already exists");
        return {
          success: false,
          message: "User already exists with this email",
        };
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // Note: In production, password should be hashed
        plan: "free",
        free_usage: 0,
        created_at: new Date().toISOString(),
      };

      // Save to localStorage
      users.push(newUser);
      saveUsers(users);
      console.log("AuthContext: User saved successfully");

      // Create token and login
      const newToken = generateToken(newUser);
      localStorage.setItem("quickai_token", newToken);
      localStorage.setItem("quickai_current_user", JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      console.log("AuthContext: Registration successful");

      return { success: true };
    } catch (error) {
      console.error("AuthContext: Registration error:", error);
      return {
        success: false,
        message: "Registration failed. Please try again.",
      };
    }
  };

  const logout = () => {
    console.log("AuthContext: Logging out");
    localStorage.removeItem("quickai_token");
    localStorage.removeItem("quickai_current_user");
    setToken(null);
    setUser(null);
    // Redirect to login page using window.location
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token && !!user;
  };

  // Get valid token (refresh if needed)
  const getValidToken = () => {
    if (!token) {
      return null;
    }
    const decoded = decodeToken(token);
    if (!decoded || decoded.exp < Date.now()) {
      return null;
    }
    return token;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        loading,
        isAuthenticated,
        getValidToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
