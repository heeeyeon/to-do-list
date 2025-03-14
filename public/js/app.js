import * as api from './api.js';
import { SHORTCUTS } from './config.js';
import * as ui from './ui.js';
import { $, $$, addMultipleEventListeners, handleError } from './utils.js';

// 최대 ID 계산 함수
function calculateMaxId(todos) {
  return todos.reduce((max, todo) => {
    const currentId = String(todo.id);
    return currentId > max ? currentId : max;
  }, '0');
}

// 이벤트 리스너 등록
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

// 할일 목록 새로고침
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

// 새 할일 생성 처리
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

// 할일 수정 처리
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

// 할일 상태 토글
function handleToggle(id, completed) {
  handleEdit(id, null, completed);
}

// 할일 삭제
async function handleDelete(id) {
  try {
    await api.deleteTodoItem(id);
    await refreshTodos();
  } catch (error) {
    handleError(error, 'DELETE_FAILED');
  }
}

// 앱 초기화
export function initTodoApp() {
  setupEventListeners();
  refreshTodos();
}
