import * as api from './api.js';
import { ERROR_MESSAGES } from './config.js';
import * as ui from './ui.js';
import { $, addMultipleEventListeners, handleError } from './utils.js';

/**
 * Calculates the highest numeric ID from an array of todo objects.
 *
 * Iterates over the provided todos, converting each todo's `id` to a number and returning the highest value.
 * Non-numeric `id` values are ignored. If no valid numeric IDs are present, the function returns 0.
 *
 * @param {Array<Object>} todos - The list of todo items, each with an `id` property.
 * @returns {number} The maximum numeric ID found among the todos.
 */
function calculateMaxId(todos) {
  return todos.reduce((max, todo) => {
    const currentId = Number(todo.id);
    return isNaN(currentId) ? max : Math.max(currentId, max);
  }, 0);
}

/**
 * Registers event listeners for UI interactions in the Todo application.
 *
 * This function attaches event handlers to various elements to open and close the create-todo modal,
 * submit new todo items (via button click and Enter key press), and trigger the modal using the Ctrl + Alt + N
 * keyboard shortcut. A helper function is used to safely add listeners by verifying element existence and logging
 * a warning if an element is not found.
 */
function setupEventListeners() {
  // 안전하게 이벤트 리스너 추가하는 헬퍼 함수
  const safeAddListener = (selector, eventType, handler) => {
    const element = $(selector); // '#' 제거하고 전체 선택자를 받음
    if (!element) {
      console.warn(`요소를 찾을 수 없습니다: ${selector}`);
      return;
    }
    addMultipleEventListeners(element, eventType, handler);
  };

  // 새 할일 추가 버튼
  safeAddListener('#addButton', 'click', () => {
    ui.modal.openCreate();
  });

  // 모달 닫기 버튼
  safeAddListener('#closeModalButton', 'click', () => {
    ui.modal.closeCreate();
  });

  // 새 할일 모달 취소 버튼
  safeAddListener('#closeCreateModalButton', 'click', () => {
    ui.modal.closeCreate();
  });

  // 다른 선택자도 사용 가능
  safeAddListener('.close-button', 'click', () => {
    ui.modal.closeCreate();
  });

  // 새 할일 생성 폼 제출
  safeAddListener('#submitCreateButton', 'click', async () => {
    await handleCreateSubmit();
  });

  // 새 할일 입력 필드 엔터키 이벤트
  safeAddListener('#newTodoTitle', 'keydown', async e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleCreateSubmit();
    }
  });

  // 단축키 이벤트 리스너는 document에 등록하므로 별도 처리
  document.addEventListener('keydown', e => {
    // Ctrl + Alt + N: 새 할일 추가
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      ui.modal.openCreate();
    }
  });
}

/**
 * Refreshes the list of todos displayed on the UI.
 *
 * If a forced refresh is not requested and cached todos exist, returns the ID of the last cached todo without refetching.
 * Otherwise, it shows a loading indicator, fetches the todos from the API, calculates the maximum ID among them, and updates the UI.
 * In case of a fetch error, it handles the error and returns '0'.
 *
 * @param {boolean} [forceRefresh=false] - If true, forces an API fetch regardless of cached data.
 * @returns {number|string} The maximum todo ID from the fetched list, the ID of the last cached todo if not refreshing, or '0' on failure.
 */
async function refreshTodos(forceRefresh = false) {
  // 강제 새로고침이 필요하지 않고 이미 데이터가 있는 경우 캐시된 데이터를 반환
  const cachedTodos = ui.getTodos();
  if (!forceRefresh && cachedTodos.length > 0) {
    return cachedTodos[cachedTodos.length - 1].id;
  }

  try {
    ui.showLoading();
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
  } finally {
    ui.hideLoading();
  }
}

/**
 * Handles the submission of a new todo item.
 *
 * Retrieves the title input from the UI and validates it. If valid, the function creates a new todo via an API call,
 * closes the creation modal, and adds the new item to the list with associated event handlers for editing, toggling, and deleting.
 * In case of errors such as network, timeout, or server issues, it closes the modal, logs the error, and displays an appropriate error message.
 *
 * @async
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
    // 에러 타입에 따른 메시지 설정
    let errorMessage = ERROR_MESSAGES.GENERIC_ERROR;
    if (error.name === 'NetworkError') {
      errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
    } else if (error.name === 'TimeoutError') {
      errorMessage = ERROR_MESSAGES.TIMEOUT_ERROR;
    } else if (error.name === 'ServerError') {
      errorMessage = ERROR_MESSAGES.SERVER_ERROR;
    }

    ui.modal.closeCreate();
    handleError(error, 'CREATE_FAILED');
    ui.showMessage(errorMessage);
  }
}

/**
 * Updates an existing todo item with new title and/or completion status.
 *
 * This asynchronous function constructs an update object using non-null parameters and sends it to the API to update the specified todo item. Upon receiving the updated item from the server, it replaces the corresponding entry in the local cache and refreshes the UI. If the update fails, the error is handled by invoking a dedicated error handler with the "UPDATE_FAILED" flag.
 *
 * @param {number|string} id - The unique identifier of the todo item to update.
 * @param {string|null} title - The new title for the todo item; if null, the title remains unchanged.
 * @param {boolean|null} completed - The new completion status; if null, the status remains unchanged.
 */
async function handleEdit(id, title, completed) {
  try {
    const updateData = {};
    if (title !== null) updateData.title = title;
    if (completed !== null) updateData.completed = completed;

    const updatedTodo = await api.updateTodoItem(id, updateData);

    // 캐시 업데이트 - 서버에서 반환된 데이터 사용
    const cachedTodos = ui.getTodos();
    const updatedTodos = cachedTodos.map(todo => (todo.id === id ? updatedTodo : todo));
    ui.displayTodos(updatedTodos, {
      onEdit: handleEdit,
      onToggle: handleToggle,
      onDelete: handleDelete,
    });
  } catch (error) {
    handleError(error, 'UPDATE_FAILED');
  }
}

/**
 * Toggles the completion status of a todo item.
 *
 * Calls the update function to change a todo's completed state by passing the given identifier,
 * leaving the title unchanged.
 *
 * @param {number|string} id - The unique identifier of the todo item.
 * @param {boolean} completed - The new completion status for the todo item.
 */
function handleToggle(id, completed) {
  handleEdit(id, null, completed);
}

/**
 * Deletes a todo item by its identifier and updates the displayed list.
 *
 * This asynchronous function calls the API to remove the specified todo item. Upon successful deletion,
 * it retrieves the current list of todos from the UI, filters out the removed item, and refreshes the display
 * using updated callbacks for editing, toggling, and deletion. If an error occurs during the deletion process,
 * it delegates error handling to a dedicated error handler with the 'DELETE_FAILED' code.
 *
 * @param {number|string} id - The identifier of the todo item to be deleted.
 */
async function handleDelete(id) {
  try {
    await api.deleteTodoItem(id);
    // 캐시에서 삭제된 항목 제거
    const cachedTodos = ui.getTodos();
    const updatedTodos = cachedTodos.filter(todo => todo.id !== id);
    ui.displayTodos(updatedTodos, {
      onEdit: handleEdit,
      onToggle: handleToggle,
      onDelete: handleDelete,
    });
  } catch (error) {
    handleError(error, 'DELETE_FAILED');
  }
}

/**
 * Initializes the Todo application.
 *
 * Sets up event listeners to handle user interactions and refreshes the list of todos by fetching the latest data.
 */
export function initTodoApp() {
  setupEventListeners();
  refreshTodos();
}
