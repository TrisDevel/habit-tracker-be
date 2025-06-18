const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    schedule: {
      type: [Boolean],
      default: Array(7).fill(false),
      validate: {
        validator: function (v) {
          return v.length === 7 && v.every((item) => typeof item === "boolean");
        },
        message: "Schedule must be an array of 7 boolean values",
      },
    },
    completedDates: {
      type: [String],
      default: [],
      set: (v) => (Array.isArray(v) ? [...new Set(v)] : []), // Remove duplicates
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: Object,
      default: {},
    },
    photos: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  }
);

// Add pre-save middleware to ensure dates are in correct format
habitSchema.pre("save", function (next) {
  if (this.completedDates) {
    // Ensure all dates are in YYYY-MM-DD format
    this.completedDates = this.completedDates.map((date) => {
      if (typeof date === "string" && date.includes("T")) {
        return date.split("T")[0];
      }
      return date;
    });

    // Remove duplicates
    this.completedDates = [...new Set(this.completedDates)];
  }
  next();
});

module.exports = mongoose.model("Habit", habitSchema);
