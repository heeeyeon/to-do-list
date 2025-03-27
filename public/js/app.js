import * as api from './api.js';
import { ERROR_MESSAGES } from './config.js';
import * as ui from './ui.js';
import { $, addMultipleEventListeners, handleError } from './utils.js';

/**
 * Sets up event listeners for the Todo application's UI.
 *
 * Registers click and keydown handlers for elements involved in opening and closing the create-todo modal,
 * submitting new todos, and toggling the modal via keyboard shortcuts. If an expected element is not found,
 * a warning is logged to the console. A global keydown listener is also added to trigger the modal with the
 * Ctrl + Alt + N shortcut.
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
 * Refreshes the UI's displayed list of todo items.
 *
 * If a forced refresh is not requested and cached todos exist, this function returns
 * the ID of the last cached todo without making an API call. Otherwise, it shows a loading
 * indicator, fetches the latest todos from the API, updates the UI with the new data, and
 * returns a status code. A return value of 1 indicates a successful update, while 0 indicates
 * that an error occurred during the API call.
 *
 * @param {boolean} [forceRefresh=false] - When true, forces a refresh by fetching the latest todos from the API regardless of cached data.
 * @returns {number} The ID of the last cached todo if no refresh is needed, 1 on a successful refresh, or 0 if an error occurs.
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

    ui.displayTodos(todos, {
      onEdit: handleEdit,
      onToggle: handleToggle,
      onDelete: handleDelete,
    });

    return 1;
  } catch (error) {
    handleError(error, 'FETCH_FAILED');
    return 0;
  } finally {
    ui.hideLoading();
  }
}

/**
 * Processes the submission of a new todo item.
 *
 * Retrieves the title from the UI input and validates it. If the title is valid, it creates a new todo item via an API call,
 * closes the creation modal, and adds the new todo to the list with callbacks for editing, toggling completion, and deletion.
 * In case of an error (e.g., network issues, timeout, or server error), it closes the modal, logs the error, and displays an appropriate error message.
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
 * Updates an existing todo item with a new title and/or completion status.
 *
 * This asynchronous function builds an update object from the provided parameters and sends it to the API to update the specified todo item. On receiving the updated item from the server, it replaces the corresponding entry in the local cache and refreshes the UI. If the update fails, a dedicated error handler is invoked with the "UPDATE_FAILED" flag.
 *
 * @param {number|string} id - Unique identifier of the todo item to update.
 * @param {string|null} title - New title for the todo item; pass null to leave it unchanged.
 * @param {boolean|null} completed - New completion status; pass null to leave it unchanged.
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
 * Delegates the update to the edit handler while leaving the todo's title unchanged.
 *
 * @param {number|string} id - The unique identifier of the todo item.
 * @param {boolean} completed - The new completion status of the todo item.
 */
function handleToggle(id, completed) {
  handleEdit(id, null, completed);
}

/**
 * Deletes a todo item and updates the UI with the remaining items.
 *
 * This asynchronous function calls the API to remove the specified todo item.
 * Upon successful deletion, it retrieves the current list of todos from the UI,
 * filters out the deleted item, and refreshes the display using the updated callbacks
 * for editing, toggling, and deleting.
 * If an error occurs during deletion, a dedicated error handler is invoked with the 'DELETE_FAILED' code.
 *
 * @param {number|string} id - The identifier of the todo item to delete.
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
 * Configures event listeners for user interactions and refreshes the todo list to display the latest data.
 */
export function initTodoApp() {
  setupEventListeners();
  refreshTodos();
}
