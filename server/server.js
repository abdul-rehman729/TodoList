const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies

mongoose.connect("mongodb+srv://ar289559:Icandoit729@todolist.dp0bf.mongodb.net/todolist", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  

// Task Schema
const taskSchema = new mongoose.Schema({
  title: String,
  desc: String,
  status: String
});

const Task = mongoose.model("Task", taskSchema);

// API to get all tasks
app.get("/api/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// API to create a new task
app.post("/api/tasks", async (req, res) => {
  const newTask = new Task(req.body);
  await newTask.save();
  res.json(newTask);
});

// API to update a task
app.put("/api/tasks/:id", async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(task);
});

// API to delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
