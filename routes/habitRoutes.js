const express = require("express");
const router = express.Router();
const {
  getHabits,
  createHabit,
  updateHabitCompletion,
  deleteHabit,
  getOneHabit,
  getHabitStats,
  updateHabit,
} = require("../controllers/habitController");
router.get("/:id", getOneHabit);
// Get all habits
router.get("/", getHabits);

// Create a new habit
router.post("/", createHabit);

// Update habit completion
router.put("/:id/completion", updateHabitCompletion);

// Update an existing habit
router.put("/:id", updateHabit);

// Delete a habit
router.delete("/:id", deleteHabit);

// Get habit statistics
router.get("/:id/stats", getHabitStats);

module.exports = router;
