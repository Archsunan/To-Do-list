const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const completedCounter = document.getElementById("completed-counter");
const uncompletedCounter = document.getElementById("uncompleted-counter");

const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
const currentUserEmail = localStorage.getItem("loggedInEmail");
const authButtons = document.getElementById("authButtons");

// Theme management
function setTheme(theme) {
  if (theme === 'mono') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  localStorage.setItem('preferred-theme', theme);
}

// Load saved theme
const savedTheme = localStorage.getItem('preferred-theme') || 'mono';
setTheme(savedTheme);

// Initialize Auth Buttons
function initAuth() {
  if (isLoggedIn && currentUserEmail) {
    authButtons.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <span class="text-muted d-none d-md-inline small fw-bold text-uppercase">${currentUserEmail.split('@')[0]}</span>
        <button class="btn btn-sm btn-outline-dark" onclick="logout()">LOGOUT</button>
      </div>
    `;
  } else {
    authButtons.innerHTML = `
      <a href="login.html" class="btn btn-sm btn-outline-dark">LOGIN</a>
      <a href="sign.html" class="btn btn-sm btn-outline-dark">SIGNUP</a>
    `;
  }
}

function logout() {
  localStorage.setItem("isLoggedIn", "false");
  localStorage.removeItem("loggedInEmail");
  window.location.reload();
}

// User's Task Key in LocalStorage
function getUserTasksKey(email) {
  return email ? `tasks_${email.replace(/[.@]/g, '_')}` : 'tasks_guest';
}

// Save Tasks to Local Storage
function saveTasksToStorage() {
  const tasks = [];
  listContainer.querySelectorAll("li").forEach(li => {
    const checkbox = li.querySelector('input[type="checkbox"]').checked;
    const taskText = li.querySelector(".task-text").textContent;
    const time = li.querySelector(".timestamp")?.textContent || "";
    tasks.push({ text: taskText, completed: checkbox, timestamp: time });
  });

  const key = getUserTasksKey(currentUserEmail);
  localStorage.setItem(key, JSON.stringify(tasks));
  updateCounters();
}

// Load Tasks
function loadTasks() {
  listContainer.innerHTML = "";
  let tasks = [];

  const key = getUserTasksKey(currentUserEmail);
  const saved = localStorage.getItem(key);

  if (saved) {
    tasks = JSON.parse(saved);
  } else if (!isLoggedIn) {
    // Demo task for guests
    tasks = [{ text: "Welcome! Add your first task above.", completed: false, timestamp: new Date().toLocaleDateString() }];
  }

  tasks.forEach(task => createTaskElement(task.text, task.completed, task.timestamp));
  updateCounters();
}

// Create Task Element
function createTaskElement(text, completed = false, timestamp = null) {
  if (!timestamp) {
    const now = new Date();
    timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + now.toLocaleDateString();
  }

  const li = document.createElement("li");
  if (completed) li.classList.add("completed");

  li.innerHTML = `
    <div class="task-content">
      <input type="checkbox" ${completed ? "checked" : ""}>
      <span class="task-text">${text}</span>
    </div>
    <div class="task-actions">
      <span class="timestamp">${timestamp}</span>
      <div class="btn-group">
        <button class="action-btn edit-btn">EDIT</button>
        <button class="action-btn delete-btn">DELETE</button>
      </div>
    </div>
  `;

  listContainer.appendChild(li);
  attachTaskEvents(li);
}

// Attach Events to Task
function attachTaskEvents(li) {
  const checkbox = li.querySelector('input[type="checkbox"]');
  const editBtn = li.querySelector(".edit-btn");
  const deleteBtn = li.querySelector(".delete-btn");
  const taskText = li.querySelector(".task-text");

  checkbox.addEventListener("change", () => {
    li.classList.toggle("completed", checkbox.checked);
    saveTasksToStorage();
  });

  editBtn.addEventListener("click", () => {
    const currentText = taskText.textContent;
    const newText = prompt("Edit your task:", currentText);
    if (newText !== null && newText.trim() !== "") {
      taskText.textContent = newText.trim();
      saveTasksToStorage();
    }
  });

  deleteBtn.addEventListener("click", () => {
    li.style.transform = "translateX(10px)";
    li.style.opacity = "0";
    setTimeout(() => {
      li.remove();
      saveTasksToStorage();
    }, 200);
  });
}

function updateCounters() {
  const total = listContainer.querySelectorAll("li").length;
  const completed = listContainer.querySelectorAll("li.completed").length;
  const pending = total - completed;

  completedCounter.textContent = completed;
  uncompletedCounter.textContent = pending;
}

function addTask() {
  const text = inputBox.value.trim();
  if (!text) {
    inputBox.style.borderColor = "var(--danger)";
    setTimeout(() => inputBox.style.borderColor = "var(--border-color)", 500);
    return;
  }

  createTaskElement(text);
  inputBox.value = "";
  saveTasksToStorage();

  const lastTask = listContainer.lastElementChild;
  if (lastTask) lastTask.scrollIntoView({ behavior: 'smooth' });
}

// Event Listeners
inputBox.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

// Initialize
initAuth();
loadTasks();
