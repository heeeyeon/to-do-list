import { ERROR_MESSAGES } from './config.js';
import { $, createElement } from './utils.js';

// DOM 요소 참조
const elements = {
  todoList: $('#todoList'),
  createModal: $('#createTodoModal'),
  newTodoTitle: $('#newTodoTitle'),
};

// 모달 관련 함수들
export const modal = {
  openCreate() {
    elements.createModal.style.display = 'block';
    elements.newTodoTitle.value = '';
    elements.newTodoTitle.focus();
  },

  closeCreate() {
    elements.createModal.style.display = 'none';
    elements.newTodoTitle.value = '';
  },
};

/**
 * Creates a DOM list item element for a todo.
 *
 * Generates a list item (li) element that displays the todo title along with an edit icon and action buttons for toggling completion and deleting the todo. Clicking the todo text initiates inline editing via the provided onEdit callback, while toggling and deletion actions invoke their respective callbacks (with deletion requiring user confirmation).
 *
 * @param {Object} todo - A todo object containing 'id', 'title', and 'completed' properties.
 * @param {Object} options - An object with callback functions to handle user actions.
 * @param {Function} options.onEdit - Invoked to enable inline editing when the todo title is clicked.
 * @param {Function} options.onToggle - Invoked to toggle the todo's completion state; receives the todo ID and the new state.
 * @param {Function} options.onDelete - Invoked to delete the todo after user confirmation.
 * @returns {HTMLElement} The constructed list item element representing the todo.
 */
function createTodoItem(todo, { onEdit, onToggle, onDelete }) {
  const todoId = String(todo.id);

  const li = createElement('li', {
    className: `todo-item ${todo.completed ? 'completed' : ''}`,
  });

  const todoContent = createElement('div', {
    className: 'todo-content',
    onClick: () => makeEditable(titleSpan, todoId, onEdit),
  });

  const titleSpan = createElement('span', {
    className: 'title',
    text: todo.title,
  });

  const editIcon = createElement('span', {
    className: 'edit-icon',
    text: '✏️',
  });

  const buttonsDiv = createElement('div', { className: 'todo-buttons' });
  const toggleButton = createElement('button', {
    className: `toggle-btn ${todo.completed ? '' : 'incomplete'}`,
    text: todo.completed ? '✓ 완료됨' : '○ 미완료',
    onClick: () => onToggle(todoId, !todo.completed),
  });

  const deleteButton = createElement('button', {
    className: 'delete-btn',
    text: '삭제',
    onClick: () => {
      if (confirm(`"${todo.title}" 항목을 삭제하시겠습니까?`)) {
        onDelete(todoId);
      }
    },
  });

  todoContent.appendChild(titleSpan);
  todoContent.appendChild(editIcon);
  buttonsDiv.appendChild(toggleButton);
  buttonsDiv.appendChild(deleteButton);

  li.appendChild(todoContent);
  li.appendChild(buttonsDiv);

  return li;
}

/**
 * Clears the current todo list and repopulates it with updated items.
 *
 * Iterates over the provided array of todo objects, creates corresponding DOM elements using createTodoItem,
 * and appends them to the todo list element.
 *
 * @param {Array<Object>} todos - An array of todo objects to display.
 * @param {Object} handlers - Callback functions for todo item actions such as editing, toggling, and deleting.
 */
export function displayTodos(todos, handlers) {
  elements.todoList.innerHTML = '';
  const todoElements = todos.map(todo => createTodoItem(todo, handlers));
  elements.todoList.append(...todoElements);
}

/**
 * Creates an input element for inline editing of a todo item's text.
 *
 * The returned input is initialized with the current text and stores its original value for potential cancellation.
 * It handles key events: pressing "Enter" triggers saving the edit, while "Escape" cancels it. Additionally,
 * losing focus will also attempt to save the changes.
 *
 * @param {string} currentText - The current text of the todo item.
 * @param {number|string} todoId - The unique identifier of the todo item.
 * @param {Function} onEdit - Callback function invoked when the edit is saved or canceled.
 * @returns {HTMLInputElement} The configured input element for inline editing.
 */
function createEditableInput(currentText, todoId, onEdit) {
  const input = createElement('input', {
    className: 'edit-input',
  });

  input.type = 'text';
  input.value = currentText;
  input.dataset.originalValue = currentText;

  input.onkeydown = e => {
    if (e.key === 'Enter') {
      saveEdit(input, todoId, onEdit);
    } else if (e.key === 'Escape') {
      cancelEdit(input, todoId, onEdit);
    }
  };

  input.onblur = () => {
    if (input.parentElement) {
      saveEdit(input, todoId, onEdit);
    }
  };

  return input;
}

/**
 * Replaces a display element with an editable input for inline editing of a todo item.
 *
 * If the provided element is not already an input, this function creates an editable input prepopulated with the element's current text content,
 * replaces the element in its parent with the new input, and focuses and selects the input's content to facilitate editing.
 *
 * @param {HTMLElement} element - The element displaying the todo title to be replaced.
 * @param {string|number} todoId - The unique identifier for the todo item, used for editing context.
 * @param {Function} onEdit - Callback invoked to handle the edit action.
 */
function makeEditable(element, todoId, onEdit) {
  if (element.tagName.toLowerCase() === 'input') return;

  const input = createEditableInput(element.textContent, todoId, onEdit);
  element.parentElement.replaceChild(input, element);
  input.focus();
  input.select();
}

/**
 * Validates and saves an edited todo title.
 *
 * This function trims the value from an editable input element and verifies the change.
 * If the trimmed value is empty or unchanged from its original value (stored in the element's dataset),
 * the edit is canceled by reverting the input. Otherwise, the onEdit callback is invoked to update the todo item.
 *
 * @param {HTMLInputElement} input - The input element containing the updated todo title.
 * @param {string|number} todoId - The identifier of the todo item being edited.
 * @param {Function} onEdit - Callback function to update the todo item when the new title differs from the original; invoked with the todoId, new title, and null.
 */
function saveEdit(input, todoId, onEdit) {
  const newValue = input.value.trim();
  if (newValue === '') {
    cancelEdit(input, todoId, onEdit);
    return;
  }

  if (newValue !== input.dataset.originalValue) {
    onEdit(todoId, newValue, null);
  } else {
    cancelEdit(input, todoId, onEdit);
  }
}

/**
 * Cancels the inline editing mode for a todo item.
 *
 * This function restores the todo item's display by replacing the active editable input with a span element. The span shows the original title (retrieved from the input's dataset) and is configured to re-enable editing when clicked.
 *
 * @param {HTMLElement} input - The input element used for editing the todo's title, which holds the original title in its dataset.
 * @param {string|number} todoId - The identifier of the todo item.
 * @param {Function} onEdit - Callback invoked to re-enable editing when the span is clicked.
 */
function cancelEdit(input, todoId, onEdit) {
  const span = createElement('span', {
    className: 'title',
    text: input.dataset.originalValue,
    onClick: () => makeEditable(span, todoId, onEdit),
  });
  input.parentElement.replaceChild(span, input);
}

/**
 * Validates a title by ensuring it is not empty after trimming whitespace.
 *
 * If the resulting title is an empty string, it alerts the user with a predefined error message
 * and returns false; otherwise, it returns true.
 *
 * @param {string} title - The title string to validate.
 * @returns {boolean} True if the trimmed title is non-empty, false otherwise.
 */
export function validateTitle(title) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    alert(ERROR_MESSAGES.EMPTY_TITLE);
    return false;
  }
  return true;
}

/**
 * Retrieves the trimmed value of the new todo title from its input field.
 *
 * This function accesses the input element associated with the new todo title, removes any leading 
 * or trailing whitespace, and returns the cleaned string.
 *
 * @returns {string} The trimmed todo title.
 */
export function getInputTitle() {
  return elements.newTodoTitle.value.trim();
}

/**
 * Appends a new todo item element to the interface's todo list.
 *
 * This function creates a todo item element from the provided todo data using the 
 * createTodoItem utility and adds it to the application's DOM todo list.
 *
 * @param {Object} todo - The data object representing the todo item.
 * @param {Object} handlers - Callback functions for handling actions such as editing, toggling, and deleting the todo.
 */
export function addTodoToList(todo, handlers) {
  const todoElement = createTodoItem(todo, handlers);
  elements.todoList.appendChild(todoElement);
}
