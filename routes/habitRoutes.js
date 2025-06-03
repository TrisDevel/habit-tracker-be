const express = require("express");
const router = express.Router();
const {
  getHabits,
  createHabit,
  updateHabitCompletion,
  deleteHabit,
} = require("../controllers/habitController");

// Get all habits
router.get("/", getHabits);

// Create a new habit
router.post("/", createHabit);

// Update habit completion
router.put("/:id", updateHabitCompletion);

// Delete a habit
router.delete("/:id", deleteHabit);

module.exports = router;
