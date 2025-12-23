import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
   
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["Customer", "Staff", "Admin"],
      default: "Customer",
    },
    organization: {
  type: String,
  enum: [
    "Hospital",
    "Bank",
    "Government Office",
    "Restaurant",
    "Airport",
    "DMV",
    "Post Office",
    "Telecom Office",
  ],
  required: function () {
    return this.role === "Staff" || this.role === "Admin";
  },
},

organizationUnit: {
  type: String,
  required: function () {
    return this.role === "Staff" || this.role === "Admin";
  },
},

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^[0-9]{10}$/.test(v);
        },
        message: "Phone number must be 10 digits",
      },
    },
    fcmToken: {
  type: String,
  default: null,
},
notificationPreferences: {
  emailEnabled: {
    type: Boolean,
    default: true,
  },
  pushEnabled: {
    type: Boolean,
    default: true,
  },
  turnAlertThreshold: {
    type: Number,
    default: 3,
    min: 1,
    max: 10,
  },
},



    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", userSchema);
