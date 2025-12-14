// Todo App - Complete functionality with localStorage persistence

// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const clearBtn = document.getElementById('clear-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalCount = document.getElementById('total-count');
const activeCount = document.getElementById('active-count');
const completedCount = document.getElementById('completed-count');

// State
let todos = [];
let currentFilter = 'all';

// Initialize app
function init() {
  // Load todos from localStorage
  const savedTodos = localStorage.getItem('todos');
  if (savedTodos) {
    todos = JSON.parse(savedTodos);
  }
  
  // Event listeners
  todoForm.addEventListener('submit', handleAddTodo);
  clearBtn.addEventListener('click', clearCompleted);
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setFilter(btn.dataset.filter);
    });
  });
  
  // Initial render
  render();
}

// Handle adding a new todo
function handleAddTodo(e) {
  e.preventDefault();
  
  const text = todoInput.value.trim();
  if (!text) return;
  
  const todo = {
    id: Date.now(),
    text: text,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  todos.unshift(todo);
  saveTodos();
  render();
  
  todoInput.value = '';
  todoInput.focus();
}

// Toggle todo completion
function toggleTodo(id) {
  todos = todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });
  
  saveTodos();
  render();
}

// Delete a todo
function deleteTodo(id) {
  const todoEl = document.querySelector(`[data-id="${id}"]`);
  if (todoEl) {
    todoEl.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => {
      todos = todos.filter(todo => todo.id !== id);
      saveTodos();
      render();
    }, 300);
  }
}

// Clear completed todos
function clearCompleted() {
  todos = todos.filter(todo => !todo.completed);
  saveTodos();
  render();
}

// Set filter
function setFilter(filter) {
  currentFilter = filter;
  
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  
  render();
}

// Get filtered todos
function getFilteredTodos() {
  switch (currentFilter) {
    case 'active':
      return todos.filter(todo => !todo.completed);
    case 'completed':
      return todos.filter(todo => todo.completed);
    default:
      return todos;
  }
}

// Save todos to localStorage
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Update stats
function updateStats() {
  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;
  const active = total - completed;
  
  totalCount.textContent = total;
  activeCount.textContent = active;
  completedCount.textContent = completed;
  
  // Show/hide clear button
  clearBtn.classList.toggle('visible', completed > 0);
}

// Render the todo list
function render() {
  const filteredTodos = getFilteredTodos();
  
  // Update stats
  updateStats();
  
  // Show empty state if no todos
  if (filteredTodos.length === 0) {
    todoList.innerHTML = '';
    emptyState.classList.add('visible');
    
    // Update empty state message based on filter
    const emptyMessage = emptyState.querySelector('p');
    if (currentFilter === 'active') {
      emptyMessage.textContent = 'No active todos. Great job! 🎉';
    } else if (currentFilter === 'completed') {
      emptyMessage.textContent = 'No completed todos yet.';
    } else {
      emptyMessage.textContent = 'No todos yet. Add one above!';
    }
    return;
  }
  
  emptyState.classList.remove('visible');
  
  // Render todos
  todoList.innerHTML = filteredTodos.map(todo => `
    <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
      <label class="todo-checkbox">
        <input 
          type="checkbox" 
          ${todo.completed ? 'checked' : ''} 
          onchange="toggleTodo(${todo.id})"
        >
        <span class="checkmark"></span>
      </label>
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button class="delete-btn" onclick="deleteTodo(${todo.id})" title="Delete">
        🗑️
      </button>
    </li>
  `).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add CSS for slide out animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
`;
document.head.appendChild(style);

// Initialize the app
init();

console.log('✅ Todo App loaded successfully!');