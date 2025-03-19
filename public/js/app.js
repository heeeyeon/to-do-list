import * as api from './api.js';
import * as ui from './ui.js';
import { $, addMultipleEventListeners, handleError } from './utils.js';

// 최대 ID 계산 함수
function calculateMaxId(todos) {
  return todos.reduce((max, todo) => {
    const currentId = String(todo.id);
    return currentId > max ? currentId : max;
  }, '0');
}

// 이벤트 리스너 등록
function setupEventListeners() {
  // 새 할일 추가 버튼
  addMultipleEventListeners($('#addButton'), 'click', () => {
    ui.modal.openCreate();
  });

  // 모달 닫기 버튼
  addMultipleEventListeners($('#closeModalButton'), 'click', () => {
    ui.modal.closeCreate();
  });

  // 모달 취소 버튼
  addMultipleEventListeners($('#closeCreateModalButton'), 'click', () => {
    ui.modal.closeCreate();
  });

  // 새 할일 생성 폼 제출
  addMultipleEventListeners($('#submitCreateButton'), 'click', async () => {
    await handleCreateSubmit();
  });

  // 새 할일 입력 필드 엔터키 이벤트
  addMultipleEventListeners($('#newTodoTitle'), 'keydown', async e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleCreateSubmit();
    }
  });

  // 단축키 이벤트 리스너
  document.addEventListener('keydown', e => {
    // Ctrl + Alt + N: 새 할일 추가
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      ui.modal.openCreate();
    }
  });
}

// 할일 목록 새로고침
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

// 할일 상태 토글
function handleToggle(id, completed) {
  handleEdit(id, null, completed);
}

// 할일 삭제
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

// 앱 초기화
export function initTodoApp() {
  setupEventListeners();
  refreshTodos();
}
