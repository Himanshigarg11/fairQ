import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { ORGANIZATION_UNITS } from "../constants/organizationUnits.js";

// Register user
// Register user
export const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      role,
      organization,
      organizationUnit,
    } = req.body;

    /* =======================
       BASIC VALIDATION
    ======================= */
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    /* =======================
       STAFF VALIDATION
    ======================= */
    if (role === "Staff") {
      if (!organization || !organizationUnit) {
        return res.status(400).json({
          success: false,
          message: "Organization and organization unit are required for staff",
        });
      }

      // Validate against constants
      if (
        !ORGANIZATION_UNITS[organization] ||
        !ORGANIZATION_UNITS[organization].includes(organizationUnit)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid organization unit selected",
        });
      }
    }

    /* =======================
       CHECK EXISTING USER
    ======================= */
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    /* =======================
       CREATE USER
    ======================= */
    const user = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber?.trim() || "",
      role: role || "Customer",
      organization: role === "Staff" ? organization : undefined,
      organizationUnit: role === "Staff"
  ? organizationUnit.trim().toLowerCase()
  : undefined,

    });

    /* =======================
       GENERATE TOKEN
    ======================= */
    const token = generateToken({
      userId: user._id,
      role: user.role,
      organization: user.organization,
      organizationUnit: user.organizationUnit,
    });

    /* =======================
       RESPONSE
    ======================= */
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organization: user.organization,
          organizationUnit: user.organizationUnit,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};


// Login user
// Login user
export const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    /* =======================
       BASIC VALIDATION
    ======================= */
    if (!login || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide login credentials",
      });
    }

    /* =======================
       FIND USER
    ======================= */
    const user = await User.findOne({
      $or: [{ email: login.toLowerCase() }, { username: login }],
      isActive: true,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    /* =======================
       PASSWORD CHECK
    ======================= */
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    /* =======================
       GENERATE TOKEN (FIXED)
    ======================= */
    const token = generateToken({
      userId: user._id,
      role: user.role,
      organization: user.organization,
      organizationUnit: user.organizationUnit,
    });

    /* =======================
       RESPONSE (FIXED)
    ======================= */
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organization: user.organization,
          organizationUnit: user.organizationUnit,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};


// Get profile
// Get profile
export const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organization: user.organization,
          organizationUnit: user.organizationUnit,
          notificationPreferences: user.notificationPreferences,
        },
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get profile",
    });
  }
};

// Save FCM token (for push notifications)
// Save FCM token (for push notifications)
export const saveFcmToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "FCM token is required",
      });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      { fcmToken: token },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "FCM token saved successfully",
    });
  } catch (error) {
    console.error("Save FCM token error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save FCM token",
    });
  }
};


