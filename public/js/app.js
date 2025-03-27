/**
 * 이 모듈은 Todo 애플리케이션의 핵심 기능을 구현합니다.
 *
 * 이 파일은 할일 목록 관리, UI 상호작용, 그리고 API 통신 기능을 포함합니다.
 * 모든 주석은 한국어로 작성되었습니다.
 */

import * as api from './api.js';
import { ERROR_MESSAGES } from './config.js';
import * as ui from './ui.js';
import { $, addMultipleEventListeners, handleError } from './utils.js';

/**
 * UI 상호작용을 위한 이벤트 리스너를 설정합니다.
 *
 * @function setupEventListeners
 * @description 할일 생성 모달의 열기/닫기, 폼 제출, 단축키 입력 등 다양한 UI 이벤트를 안전하게 등록합니다.
 *              내부적으로 요소가 존재하는지 확인한 후, 존재하면 해당 요소에 이벤트 리스너를 부착합니다.
 * @returns {void}
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
 * @async
 * @function refreshTodos
 * @description 캐시된 할일 목록이 존재하면, 강제 새로고침 없이 캐시의 마지막 할일 ID를 반환합니다.
 *              그렇지 않으면 로딩 상태를 표시하고 API를 통해 할일 목록을 가져와 UI를 업데이트합니다.
 *              API 호출 중 오류 발생 시 오류 핸들러를 호출하고 '0'을 반환합니다.
 * @param {boolean} [forceRefresh=false] - true인 경우, 캐시를 무시하고 API 호출을 강제합니다.
 * @returns {Promise <number>} 성공 시 1 또는 캐시된 마지막 할일의 ID, 실패 시 0을 반환합니다.
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
 * 새 할일 항목 제출을 처리합니다.
 *
 * @async
 * @function handleCreateSubmit
 * @description UI에서 입력받은 할일 제목을 검증한 후, 유효할 경우 API 호출로 새 할일 항목을 생성합니다.
 *              생성 성공 시 모달을 닫고, 생성된 항목을 UI 목록에 추가합니다.
 *              오류 발생 시 오류 핸들러를 호출하고 적절한 오류 메시지를 표시합니다.
 * @returns {Promise<void>}
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
 * 기존 할일 항목을 업데이트합니다.
 *
 * @async
 * @function handleEdit
 * @description 할일 항목의 제목과 완료 상태를 업데이트합니다.
 *              업데이트 데이터 구성 후 API를 호출하여 변경 사항을 적용하고,
 *              성공 시 캐시된 할일 목록 및 UI를 갱신합니다.
 *              실패 시 오류 핸들러를 호출합니다.
 * @param {number|string} id - 업데이트할 할일 항목의 고유 식별자입니다.
 * @param {string|null} title - 새로운 제목. 변경하지 않으려면 null을 전달합니다.
 * @param {boolean|null} completed - 새로운 완료 상태. 변경하지 않으려면 null을 전달합니다.
 * @returns {Promise<void>}
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
 * @function handleToggle
 * @description 주어진 할일 항목의 완료 상태 전환을 위해 handleEdit 함수를 호출합니다.
 * @param {number|string} id - 완료 상태를 전환할 할일 항목의 고유 식별자입니다.
 * @param {boolean} completed - 새로 설정할 완료 상태입니다.
 * @returns {void}
 */
function handleToggle(id, completed) {
  handleEdit(id, null, completed);
}

/**
 * 할일 항목을 삭제하고 UI를 업데이트합니다.
 *
 * @async
 * @function handleDelete
 * @description 지정된 할일 항목을 API를 통해 삭제한 후,
 *              캐시에서 해당 항목을 제거하고 UI 목록을 새로 고칩니다.
 *              삭제 도중 오류 발생 시 오류 핸들러를 호출합니다.
 * @param {number|string} id - 삭제할 할일 항목의 고유 식별자입니다.
 * @returns {Promise<void>}
 */
async function handleDelete(id) {
  try {

 *
 * 오류 처리:
 *  - API 업데이트 실패 시, handleError를 호출하여 'UPDATE_FAILED' 메시지와 함께 오류를 처리합니다.
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
 * 할일 항목 완료 상태 전환 함수
 *
 * 이 함수는 특정 할일 항목의 완료 상태를 변경합니다.
 *
 * 역할:
 *  - 내부적으로 handleEdit 함수를 호출하여 할일 항목의 완료 상태를 업데이트합니다.
 *
 * 매개변수:
 *  - id (number|string): 대상 할일 항목의 고유 식별자.
 *  - completed (boolean): 변경할 완료 상태.
 *
 * 반환값: 없음.
 *
 * 오류 처리:
 *  - handleEdit 호출 중 발생한 오류는 해당 함수 내에서 처리합니다.
 */
function handleToggle(id, completed) {
  handleEdit(id, null, completed);
}

/**
 * 할일 항목 삭제 처리 함수
 *
 * 이 비동기 함수는 지정된 할일 항목을 삭제하고 UI를 업데이트합니다.
 *
 * 역할:
 *  - API를 호출하여 할일 항목을 삭제한 후 로컬 캐시에서 해당 항목을 제거합니다.
 *  - 업데이트된 할일 목록을 UI에 반영합니다.
 *
 * 매개변수:
 *  - id (number|string): 삭제할 할일 항목의 고유 식별자.
 *
 * 반환값: 없음.
 *
 * 오류 처리:
 *  - API 호출 중 오류 발생 시, handleError를 호출하여 'DELETE_FAILED' 메시지와 함께 에러를 처리합니다.
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
 * Todo 애플리케이션 초기화 함수
 *
 * 이 함수는 애플리케이션의 초기화 과정을 진행합니다.
 *
 * 역할:
 *  - 이벤트 리스너를 설정하고, 초기 할일 목록을 API 또는 캐시에서 불러와 UI를 준비합니다.
 *  - 초기화 과정에서 캐싱 메커니즘을 활용하여, 불필요한 API 호출을 줄이고 빠른 응답을 제공합니다.
 *
 * 매개변수: 없음.
 * 반환값: 없음.
 *
 * 오류 처리:
 *  - 초기화 과정 중 발생 가능한 오류는 각 함수 내 (예: setupEventListeners, refreshTodos)에서 handleError를 통해 처리됩니다.
 */
export function initTodoApp() {
  setupEventListeners();
  refreshTodos();
}