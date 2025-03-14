import * as api from './api.js';
import { SHORTCUTS } from './config.js';
import * as ui from './ui.js';
import { $, $$, addMultipleEventListeners, handleError } from './utils.js';

/**
 * Calculates the maximum todo ID from an array of todo objects.
 *
 * Iterates over the todos by converting each todo's `id` to a string and returns the highest value using lexicographical comparison.
 * If the list is empty, returns "0".
 *
 * @param {Object[]} todos - Array of todo objects, each with an `id` property.
 * @returns {string} The maximum todo id as a string, or "0" if no todos are provided.
 */
function calculateMaxId(todos) {
  return todos.reduce((max, todo) => {
    const currentId = String(todo.id);
    return currentId > max ? currentId : max;
  }, '0');
}

/**
 * Sets up event listeners to support user interactions in the Todo application.
 *
 * This function registers keyboard and mouse events to manage the create-todo modal:
 * - Opens the create modal via a configured keyboard shortcut or the add button.
 * - Handles submission of a new todo through the submit button or by pressing Enter in the input field.
 * - Closes the modal when the cancel or close buttons are clicked.
 */
function setupEventListeners() {
  // 단축키 이벤트 리스너
  addMultipleEventListeners(document, 'keydown', e => {
    if (
      e.ctrlKey === SHORTCUTS.CREATE_TODO.ctrl &&
      e.altKey === SHORTCUTS.CREATE_TODO.alt &&
      e.key.toLowerCase() === SHORTCUTS.CREATE_TODO.key
    ) {
      e.preventDefault();
      ui.modal.openCreate();
    }
  });

  // 버튼 클릭 이벤트 리스너
  addMultipleEventListeners($('#addButton'), 'click', ui.modal.openCreate);
  addMultipleEventListeners($('#submitCreateButton'), 'click', handleCreateSubmit);
  addMultipleEventListeners($('#cancelCreateButton'), 'click', ui.modal.closeCreate);

  // 모달 닫기 버튼 이벤트 리스너
  addMultipleEventListeners($$('.close'), 'click', e => {
    if (e.target.closest('#createTodoModal')) {
      ui.modal.closeCreate();
    }
  });

  // 새 할일 입력 필드 엔터키 이벤트
  addMultipleEventListeners($('#newTodoTitle'), 'keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateSubmit();
    }
  });
}

/**
 * Refreshes the todo list.
 *
 * Retrieves todos from the API, updates the UI with the new list, and returns the maximum todo ID.
 * If fetching fails, logs the error and returns '0'.
 *
 * @returns {Promise<string>} A promise that resolves to the maximum todo ID, or '0' if an error occurs.
 */
async function refreshTodos() {
  try {
    const todos = await api.fetchTodos();
    const maxId = calculateMaxId(todos);

    ui.displayTodos(todos, {
      onEdit: handleEdit,
      onToggle: handleToggle,
      onDelete: handleDelete,
    });

    return maxId;
  } catch (error) {
    handleError(error, 'FETCH_FAILED');
    return '0';
  }
}

/**
 * Handles the creation of a new todo item.
 *
 * This asynchronous function retrieves the todo title from the UI and validates the input.
 * If the title is valid, it calls the API to create the todo item, closes the creation modal,
 * and adds the new todo to the list with handlers for editing, toggling, and deleting.
 * On failure, it delegates error handling with a 'CREATE_FAILED' code.
 */
async function handleCreateSubmit() {
  const title = ui.getInputTitle();

  if (!ui.validateTitle(title)) {
    return;
  }

  try {
    const newTodo = await api.createTodoItem(title);
    ui.modal.closeCreate();
    // 전체 목록을 다시 불러오는 대신 생성된 할일만 추가
    ui.addTodoToList(newTodo, {
      onEdit: handleEdit,
      onToggle: handleToggle,
      onDelete: handleDelete,
    });
  } catch (error) {
    handleError(error, 'CREATE_FAILED');
  }
}

/**
 * Updates a todo item with new data.
 *
 * Constructs an update object from the provided title and completion status—only updating
 * properties that are not null—then sends the update to the API. After a successful update,
 * the todo list is refreshed.
 *
 * @param {string|number} id - The identifier of the todo item to update.
 * @param {string|null} title - The new title for the todo item; if null, the title remains unchanged.
 * @param {boolean|null} completed - The new completion status; if null, the current status is retained.
 */
async function handleEdit(id, title, completed) {
  try {
    const updateData = {};
    if (title !== null) updateData.title = title;
    if (completed !== null) updateData.completed = completed;

    await api.updateTodoItem(id, updateData);
    await refreshTodos();
  } catch (error) {
    handleError(error, 'UPDATE_FAILED');
  }
}

/**
 * Toggles the completion status of a todo item.
 *
 * This function updates only the completed state of the specified todo by invoking handleEdit()
 * with a null title, leaving the existing title unchanged.
 *
 * @param {number|string} id - The unique identifier of the todo item.
 * @param {boolean} completed - The new completion status of the todo item.
 */
function handleToggle(id, completed) {
  handleEdit(id, null, completed);
}

/**
 * Deletes a todo item by its identifier and refreshes the todo list.
 *
 * This asynchronous function sends a delete request for the specified todo item
 * and updates the displayed todos. If an error occurs during deletion, it is handled
 * by invoking the error handler with a 'DELETE_FAILED' code.
 *
 * @param {string|number} id - The unique identifier of the todo item to delete.
 */
async function handleDelete(id) {
  try {
    await api.deleteTodoItem(id);
    await refreshTodos();
  } catch (error) {
    handleError(error, 'DELETE_FAILED');
  }
}

/**
 * Initializes the Todo application.
 *
 * This function sets up event listeners for user interactions and refreshes the list of todos
 * by fetching the current data from the API.
 */
export function initTodoApp() {
  setupEventListeners();
  refreshTodos();
}
