/**
 * 이 모듈은 핵심 Todo 애플리케이션 기능을 포함하고 있습니다.
 * 사용자 상호작용, API 호출 및 UI 업데이트와 관련된 기능을 담당합니다.
 * 모든 주석은 한국어로 작성되었습니다.
 */

import * as api from './api.js';
import { ERROR_MESSAGES } from './config.js';
import * as ui from './ui.js';
import { $, addMultipleEventListeners, handleError } from './utils.js';

/**
 * Todo 애플리케이션의 이벤트 리스너들을 설정하는 함수입니다.
 *
 * 이 함수는 새 할일 추가 모달 열기/닫기, 폼 제출, 엔터키 및 단축키 이벤트 등
 * 사용자와의 상호작용을 위한 다양한 이벤트 리스너를 안전하게 등록합니다.
 *
 * @function setupEventListeners
 * @returns {void} 반환값 없음.
 */
function setupEventListeners() {
  // 안전하게 이벤트 리스너 추가하는 헬퍼 함수
  const safeAddListener = (selector, eventType, handler) = > {
    const element = $(selector); // '#' 제거하고 전체 선택자를 받음
    if (!element) {
      console.warn(`요소를 찾을 수 없습니다: ${selector}`);
      return;
    }
    addMultipleEventListeners(element, eventType, handler);
  };

  // 새 할일 추가 버튼 클릭 시 모달 열기
  safeAddListener('#addButton', 'click', () => {
    ui.modal.openCreate();
  });

  // 모달 닫기 버튼 클릭 시 모달 닫기
  safeAddListener('#closeModalButton', 'click', () => {
    ui.modal.closeCreate();
  });

  // 새 할일 모달 취소 버튼 클릭 시 모달 닫기
  safeAddListener('#closeCreateModalButton', 'click', () => {
    ui.modal.closeCreate();
  });

  // 다른 선택자에 대해 모달 닫기 이벤트 등록
  safeAddListener('.close-button', 'click', () => {
    ui.modal.closeCreate();
  });

  // 새 할일 생성 폼 제출 시 처리
  safeAddListener('#submitCreateButton', 'click', async () => {
    await handleCreateSubmit();
  });

  // 새 할일 입력 필드 엔터키 이벤트 처리
  safeAddListener('#newTodoTitle', 'keydown', async e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleCreateSubmit();
    }
  });

  // 단축키 이벤트 리스너 등록 (Ctrl + Alt + N: 새 할일 추가)
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      ui.modal.openCreate();
    }
  });
}

/**
 * UI에 표시된 할일 목록을 새로 고치는 함수입니다.
 *
 * 이 함수는 forceRefresh 옵션에 따라 API 호출을 통해 최신 할일 목록을 가져오거나,
 * 캐시된 데이터가 있으면 마지막 할일 ID를 반환합니다. 또한, API 호출 중 오류가 발생하면
 * 오류를 처리하고 0을 반환합니다.
 *
 * @async
 * @param {boolean} [forceRefresh=false] - true인 경우 강제로 API 호출하여 데이터를 새로 고칩니다.
 * @returns {Promise <number>} 목록 업데이트 성공 시 1 또는 캐시된 마지막 할일의 ID, 오류 발생 시 0을 반환합니다.
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
 * 새 할일 항목 생성을 위한 제출 처리를 수행하는 함수입니다.
 *
 * 이 비동기 함수는 사용자의 입력 값을 검증하고, 유효하면 API를 호출하여 새 할일 항목을 생성합니다.
 * 생성 성공 시 모달을 닫고 UI에 새 항목을 추가하며, 실패 시 오류 처리를 수행합니다.
 *
 * @async
 * @returns {Promise<void>} 실행 완료 시 반환값 없음.
 */
async function handleCreateSubmit() {
  const title = ui.getInputTitle();

  if (!ui.validateTitle(title)) {
    return;
  }

  try {
    const newTodo = await api.createTodoItem(title);
    ui.modal.closeCreate();
    // 전체 목록을 다시 불러오지 않고 생성된 할일 항목만 추가
    ui.addTodoToList(newTodo, {
      onEdit: handleEdit,
      onToggle: handleToggle,
      onDelete: handleDelete,
    });
  } catch (error) {
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
 * 할일 항목을 수정하는 함수입니다.
 *
 * 이 비동기 함수는 아이디에 해당하는 할일 항목을 업데이트하기 위해, 전달받은 title과 completed
 * 값이 null이 아니면 해당 값들을 업데이트 객체(updateData)에 포함하여 API 호출을 진행합니다.
 * 업데이트 성공 시 캐시된 할일 목록을 최신 데이터로 갱신하며, 실패 시 오류 핸들러를 호출합니다.
 *
 * @async
 * @param {number|string} id - 수정할 할일 항목의 고유 식별자.
 * @param {string|null} title - 새로운 제목, 변경하지 않으려면 null.
 * @param {boolean|null} completed - 새로운 완료 상태, 변경하지 않으려면 null.
 * @returns {Promise<void>} 실행 완료 시 반환값 없음.
 */
async function handleEdit(id, title, completed) {
  try {
    const updateData = {};
    if (title !== null) updateData.title = title;
    if (completed !== null) updateData.completed = completed;

    const updatedTodo = await api.updateTodoItem(id, updateData);

    // 캐시 업데이트 - 서버 응답 데이터를 사용하여 갱신
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
 * 할일 항목의 완료 상태를 토글(전환)하는 함수입니다.
 *
 * 이 함수는 지정된 아이디의 할일 항목에 대해 새로운 완료 상태(completed)를 적용하기 위해
 * handleEdit 함수를 호출합니다.
 *
 * @param {number|string} id - 완료 상태를 변경할 할일 항목의 고유 식별자.
 * @param {boolean} completed - 업데이트할 완료 상태.
 * @returns {void} 반환값 없음.
 */
function handleToggle(id, completed) {
  handleEdit(id, null, completed);
}

/**
 * 할일 항목을 삭제하고 UI 목록을 업데이트하는 함수입니다.
 *
 * 이 비동기 함수는 지정된 id를 가진 할일 항목을 API 호출을 통해 삭제합니다.
 * 삭제가 성공하면, 캐시된 할일 목록에서 해당 항목을 제거하고 UI를 새로 고칩니다.
 * 삭제 실패 시, 에러 핸들러를 호출하여 오류를 처리합니다.
 *
 * @async
 * @param {number|string} id - 삭제할 할일 항목의 고유 식별자.
 * @returns {Promise<void>} 실행 완료 시 반환값 없음.
 */
async function handleDelete(id) {
  try {

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
 * [역할] 할일 항목의 완료 상태를 전환하여, UI와 서버 데이터를 업데이트합니다.
 * 
 * [세부 설명]
 * - 전달된 id와 완료 상태를 사용하여 handleEdit 함수를 호출하며, 제목은 변경되지 않습니다.
 *
 * [매개변수]
 * - {number|string} id: 대상 할일 항목의 고유 식별자.
 * - {boolean} completed: 할일 항목의 새로운 완료 상태.
 *
 * [반환값] 없음.
 *
 * [오류 처리]
 * - 내부적으로 handleEdit 함수의 오류 처리를 따릅니다.
 */
function handleToggle(id, completed) {
  handleEdit(id, null, completed);
}

/**
 * [역할] 할일 항목을 삭제하고, UI와 캐시 데이터를 업데이트하는 기능을 수행합니다.
 * 
 * [세부 설명]
 * - API 호출을 통해 지정된 id의 할일 항목을 삭제합니다.
 * - 삭제 후, 현재 캐시에서 해당 항목을 제거하고, 업데이트된 콜백을 사용하여 UI를 재렌더링합니다.
 *
 * [매개변수]
 * - {number|string} id: 삭제할 할일 항목의 고유 식별자.
 *
 * [반환값] 없음 (비동기 함수).
 *
 * [오류 처리]
 * - API 호출 중 오류 발생 시, handleError 함수를 통해 'DELETE_FAILED' 코드를 사용하여 오류를 처리합니다.
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
 * [역할] Todo 애플리케이션 초기화 함수로, 이벤트 리스너 설정과 데이터 초기 로딩(할일 목록 캐싱 포함)을 수행합니다.
 * 
 * [세부 설명]
 * - setupEventListeners 함수를 호출하여 사용자 인터랙션에 필요한 이벤트 핸들러를 등록합니다.
 * - refreshTodos 함수를 호출하여, CACHE_DURATION 상수에 따른 캐싱 메커니즘과 fallback 로직을 기반으로 초기 할일 목록을 불러와 UI를 업데이트합니다.
 *
 * [매개변수] 없음.
 *
 * [반환값] 없음.
 *
 * [오류 처리]
 * - 내부적으로 각 이벤트 핸들러 및 데이터 로딩 함수에서 발생하는 오류를 개별적으로 처리합니다.
 */
export function initTodoApp() {
  setupEventListeners();
  refreshTodos();
}