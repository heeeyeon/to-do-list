import * as api from './api.js';
import { ERROR_MESSAGES } from './config.js';
import * as ui from './ui.js';
import { $, addMultipleEventListeners, handleError } from './utils.js';

/**
 * 할일 객체 배열에서 가장 큰 숫자 ID를 계산합니다.
 *
 * 제공된 할일 목록을 반복하면서 각 할일의 `id`를 숫자로 변환하고 가장 큰 값을 반환합니다.
 * 숫자가 아닌 `id` 값은 무시됩니다. 유효한 숫자 ID가 없으면 함수는 0을 반환합니다.
 *
 * @param {Array <Object>} todos - 각 객체에 `id` 속성이 포함된 할일 아이템 목록입니다.
 * @returns {number} 할일 목록에서 찾은 최대 숫자 ID.
 */

function calculateMaxId(todos) {
  return todos.reduce((max, todo) => {
    const currentId = Number(todo.id);
    return isNaN(currentId) ? max : Math.max(currentId, max);
  }, 0);
}

/**
 * Todo 애플리케이션에서 UI 상호작용을 위한 이벤트 리스너를 등록합니다.
 *
 * 이 함수는 생성 할일 모달을 열고 닫기 위한 다양한 요소에 이벤트 핸들러를 부착하며,
 * 버튼 클릭이나 Enter 키 입력을 통해 새 할일 항목을 제출하고 Ctrl + Alt + N 단축키로 모달을 트리거합니다.
 * 요소 존재를 확인하고 없을 경우 경고를 로그하는 헬퍼 함수를 사용하여 안전하게 리스너를 추가합니다.
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
 * UI에 표시된 할일 목록을 새로 고칩니다.
 *
 * 강제 새로고침이 요청되지 않고 캐시된 할일 목록이 존재하면, API 호출 없이 마지막 캐시된 할일의 ID를 반환합니다.
 * 그렇지 않으면 로딩 표시기를 보여주고, API에서 할일 목록을 가져와서 그 중 최대 ID를 계산한 후 UI를 업데이트합니다.
 * API 호출 중 오류 발생 시, 오류를 처리하고 '0'을 반환합니다.
 *
 * @param {boolean} [forceRefresh=false] - true인 경우, 캐시된 데이터와 관계없이 API 호출을 강제합니다.
 * @returns {number|string} 새로 가져온 할일 목록에서 찾은 최대 ID, 또는 캐시된 마지막 할일의 ID, 오류 발생 시 '0'.
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
 * 새 할일 항목의 제출을 처리합니다.
 *
 * UI에서 제목 입력값을 가져와 유효성을 검사합니다. 유효하면, API 호출을 통해 새 할일을 생성하고,
 * 생성 모달을 닫은 후 편집, 전환, 삭제를 위한 이벤트 핸들러와 함께 새 항목을 목록에 추가합니다.
 * 네트워크, 타임아웃 또는 서버 문제와 같은 오류 발생 시, 모달을 닫고 오류를 로그한 후 적절한 오류 메시지를 표시합니다.
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
 * 기존 할일 항목을 새로운 제목 및/또는 완료 상태로 업데이트합니다.
 *
 * 이 비동기 함수는 null이 아닌 매개변수를 사용하여 업데이트 객체를 구성한 후, 해당 할일 항목을 업데이트하기 위해 API에 전송합니다.
 * 서버로부터 업데이트된 항목을 받으면, 로컬 캐시 내의 해당 항목을 대체하고 UI를 새로 고칩니다.
 * 업데이트에 실패하면, "UPDATE_FAILED" 플래그와 함께 전용 오류 핸들러를 호출하여 오류를 처리합니다.
 *
 * @param {number|string} id - 업데이트할 할일 항목의 고유 식별자.
 * @param {string|null} title - 할일 항목의 새로운 제목; null인 경우 제목은 변경되지 않습니다.
 * @param {boolean|null} completed - 새로운 완료 상태; null인 경우 상태는 변경되지 않습니다.
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
 * 할일 항목의 완료 상태를 전환합니다.
 *
 * 주어진 식별자를 사용하여 할일 항목의 완료 상태를 변경하기 위해 업데이트 함수를 호출하며,
 * 제목은 변경되지 않습니다.
 *
 * @param {number|string} id - 할일 항목의 고유 식별자.
 * @param {boolean} completed - 할일 항목의 새로운 완료 상태.
 */
function handleToggle(id, completed) {
  handleEdit(id, null, completed);
}

/**
 * 할일 항목을 식별자로 삭제하고 화면에 표시된 목록을 업데이트합니다.
 *
 * 이 비동기 함수는 지정된 할일 항목을 삭제하기 위해 API를 호출합니다. 삭제가 성공하면,
 * UI에서 현재 할일 목록을 가져와 삭제된 항목을 필터링하고, 편집, 전환, 삭제를 위한 업데이트된 콜백을 사용하여 화면을 새로 고칩니다.
 * 삭제 과정에서 오류가 발생하면, 'DELETE_FAILED' 코드와 함께 전용 오류 핸들러를 호출하여 오류를 처리합니다.
 *
 * @param {number|string} id - 삭제할 할일 항목의 식별자.
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
 * Todo 애플리케이션을 초기화합니다.
 *
 * 사용자 상호작용을 처리하기 위한 이벤트 리스너를 설정하고 최신 데이터를 가져와 할일 목록을 새로 고칩니다.
 */
export function initTodoApp() {
  setupEventListeners();
  refreshTodos();
}
