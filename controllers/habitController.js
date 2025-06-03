const Habit = require("../models/Habit");

// Get all habits
const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find();
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new habit
const createHabit = async (req, res) => {
  try {
    const { name, description, schedule } = req.body;
    const habit = new Habit({
      name,
      description,
      schedule,
    });

    const newHabit = await habit.save();
    res.status(201).json(newHabit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update habit completion
const updateHabitCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    const habit = await Habit.findById(id);
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const completionDate = new Date(date);
    habit.completedDates.push(completionDate);

    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a habit
const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const habit = await Habit.findById(id);

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    await habit.remove();
    res.json({ message: "Habit deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHabits,
  createHabit,
  updateHabitCompletion,
  deleteHabit,
};
