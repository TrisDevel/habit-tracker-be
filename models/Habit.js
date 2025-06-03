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
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          const validDays = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ];
          return v.every((day) => validDays.includes(day));
        },
        message: (props) => `${props.value} contains invalid day(s)!`,
      },
    },
    completedDates: {
      type: [Date],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Habit", habitSchema);
