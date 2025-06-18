const Habit = require("../models/Habit");

const getOneHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const habit = await Habit.findById(id);
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    return res.json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get all habits
const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find();
    res.json(habits);
    console.log("Fetched habits:", habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new habit
const createHabit = async (req, res) => {
  try {
    const { name, description, schedule } = req.body;

    // Ensure schedule is an array of booleans
    const validSchedule = Array.isArray(schedule)
      ? schedule.map((day) => Boolean(day))
      : Array(7).fill(false);

    const habit = new Habit({
      name,
      description,
      schedule: validSchedule,
    });

    const newHabit = await habit.save();
    res.status(201).json(newHabit);
  } catch (error) {
    console.error("Create habit error:", error);
    res.status(400).json({ message: error.message });
  }
};

// Update habit completion
const updateHabitCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    console.log("Processing completion update:", { id, date });

    const habit = await Habit.findById(id);
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // Initialize if undefined
    if (!habit.completedDates) {
      habit.completedDates = [];
    }

    const dateExists = habit.completedDates.includes(date);
    if (dateExists) {
      // Remove date if already exists
      habit.completedDates = habit.completedDates.filter((d) => d !== date);
    } else {
      // Add date if doesn't exist
      habit.completedDates.push(date);
    }

    console.log("Updated completedDates:", habit.completedDates);

    const savedHabit = await habit.save();
    res.json(savedHabit);
  } catch (error) {
    console.error("Completion update error:", error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a habit
const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedHabit = await Habit.findByIdAndDelete(id);

    if (!deletedHabit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.json({ message: "Habit deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: error.message });
  }
};

const calculateCurrentStreak = (completedDates, schedule) => {
  if (!completedDates || !schedule || completedDates.length === 0) return 0;

  // Sắp xếp ngày theo thứ tự giảm dần
  const sortedDates = [...completedDates].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  let currentStreak = 0;
  const today = new Date();
  let checkDate = new Date(today);

  // Kiểm tra streak ngược về quá khứ
  while (true) {
    const dayOfWeek = checkDate.getDay(); // 0 = Sunday, 1 = Monday,...

    // Nếu ngày này được lên lịch
    if (schedule[dayOfWeek]) {
      const dateString = checkDate.toISOString().split("T")[0];
      const wasCompleted = sortedDates.includes(dateString);

      if (wasCompleted) {
        currentStreak++;
      } else {
        // Nếu bỏ lỡ ngày đã lên lịch, dừng đếm streak
        break;
      }
    }

    // Chuyển sang ngày trước đó
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return currentStreak;
};

const calculateBestStreak = (completedDates, schedule) => {
  if (!completedDates || !schedule || completedDates.length === 0) return 0;

  // Sắp xếp ngày tăng dần
  const sortedDates = [...completedDates].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  let bestStreak = 0;
  let currentStreak = 0;
  let checkDate = new Date(sortedDates[0]);
  const lastDate = new Date(sortedDates[sortedDates.length - 1]);

  while (checkDate <= lastDate) {
    const dayOfWeek = checkDate.getDay();

    if (schedule[dayOfWeek]) {
      const dateString = checkDate.toISOString().split("T")[0];
      if (sortedDates.includes(dateString)) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    checkDate.setDate(checkDate.getDate() + 1);
  }

  return bestStreak;
};

const calculateCompletionRate = (completedDates) => {
  if (!completedDates || completedDates.length === 0) return 0;

  // Get dates for last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Filter completed dates within last 30 days
  const recentCompletions = completedDates.filter((date) => {
    const completionDate = new Date(date);
    return completionDate >= thirtyDaysAgo && completionDate <= today;
  });

  // Calculate completion rate as percentage
  return Math.round((recentCompletions.length / 30) * 100);
};

const calculateWeeklyStats = (completedDates) => {
  const weekData = Array(7).fill(0); // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]

  if (!completedDates || completedDates.length === 0) return weekData;

  // Get dates for last 7 days
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  completedDates.forEach((date) => {
    const completionDate = new Date(date);
    if (completionDate >= sevenDaysAgo && completionDate <= today) {
      const dayOfWeek = completionDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      weekData[dayOfWeek]++;
    }
  });

  return weekData;
};

const getHabitStats = async (req, res) => {
  try {
    const { id } = req.params;
    const habit = await Habit.findById(id);

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const stats = {
      currentStreak: calculateCurrentStreak(
        habit.completedDates,
        habit.schedule
      ),
      bestStreak: calculateBestStreak(habit.completedDates, habit.schedule),
      completionRate: calculateCompletionRate(
        habit.completedDates,
        habit.schedule
      ),
      totalDays: habit.completedDates.length,
      lastWeekCompletion: calculateWeeklyStats(habit.completedDates),
    };

    res.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log("Updating habit:", { id, updates });

    const habit = await Habit.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.json(habit);
  } catch (error) {
    console.error("Update error:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getOneHabit,
  getHabits,
  createHabit,
  updateHabitCompletion,
  deleteHabit,
  getHabitStats,
  updateHabit,
};
module.exports = {
  getOneHabit,
  getHabits,
  createHabit,
  updateHabitCompletion,
  deleteHabit,
  getHabitStats,
  updateHabit,
};
