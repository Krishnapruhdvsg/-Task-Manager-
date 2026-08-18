const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const taskList = document.getElementById("taskList");
const message = document.getElementById("message");
const dayName = document.getElementById("dayName");
const taskCount = document.getElementById("taskCount");
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateDate() {
  const today = new Date();
  dayName.textContent = today.toLocaleDateString("en-US", { weekday: "long" });
}

function updateStats() {
  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;
  const progress = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  totalTasks.textContent = tasks.length;
  completedTasks.textContent = completed;
  pendingTasks.textContent = pending;
  taskCount.textContent = tasks.length === 1 ? "1 Task" : `${tasks.length} Tasks`;
  progressText.textContent = `${progress}%`;
  progressFill.style.width = `${progress}%`;
}

function getVisibleTasks() {
  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  if (currentFilter === "pending") {
    return tasks.filter((task) => !task.completed);
  }

  return tasks;
}

function formatPriority(priority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function renderTasks() {
  taskList.innerHTML = "";
  const visibleTasks = getVisibleTasks();

  if (visibleTasks.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = tasks.length === 0
      ? "No tasks yet. Add something you want to finish today."
      : "No tasks match this filter.";
    taskList.appendChild(emptyItem);
    updateStats();
    return;
  }

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = task.completed ? "task-item completed" : "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const content = document.createElement("div");
    content.className = "task-content";

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const priority = document.createElement("span");
    priority.className = `priority ${task.priority}`;
    priority.textContent = `${formatPriority(task.priority)} priority`;

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-btn";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editTask(task.id));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    content.appendChild(text);
    content.appendChild(priority);
    item.appendChild(checkbox);
    item.appendChild(content);
    item.appendChild(editButton);
    item.appendChild(deleteButton);
    taskList.appendChild(item);
  });

  updateStats();
}

function addTask(text, priority) {
  const newTask = {
    id: Date.now(),
    text,
    priority,
    completed: false
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();
  showMessage("Task added successfully.", "success");
}

function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }

    return task;
  });

  saveTasks();
  renderTasks();
  showMessage("Task status updated.", "success");
}

function editTask(id) {
  const task = tasks.find((item) => item.id === id);
  const updatedText = prompt("Edit your task:", task.text);

  if (updatedText === null) {
    return;
  }

  const cleanText = updatedText.trim();

  if (cleanText === "") {
    showMessage("Task cannot be empty.", "error");
    return;
  }

  task.text = cleanText;
  saveTasks();
  renderTasks();
  showMessage("Task edited successfully.", "success");
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
  showMessage("Task deleted.", "success");
}

function clearCompletedTasks() {
  const completedCount = tasks.filter((task) => task.completed).length;

  if (completedCount === 0) {
    showMessage("No completed tasks to clear.", "error");
    return;
  }

  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
  showMessage("Completed tasks cleared.", "success");
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const taskText = taskInput.value.trim();

  if (taskText === "") {
    showMessage("Please enter a task before adding.", "error");
    return;
  }

  addTask(taskText, priorityInput.value);
  taskInput.value = "";
  priorityInput.value = "medium";
  taskInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

clearCompletedBtn.addEventListener("click", clearCompletedTasks);

updateDate();
renderTasks();
