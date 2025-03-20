import { ERROR_MESSAGES } from './config.js';
import { $, $$, createElement } from './utils.js';

// DOM 요소 참조
const elements = {
  todoList: $('#todoList'),
  createModal: $('#createTodoModal'),
  newTodoTitle: $('#newTodoTitle'),
  loadingMessage: createElement('div', {
    className: 'loading-message',
    text: '로딩 중...',
  }),
};

// 캐시된 todos 데이터
let todosCache = [];

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

// Todo 아이템 생성 함수
function createTodoItem(todo, { onEdit, onToggle, onDelete }) {
  try {
    const todoId = String(todo.id);

    const li = createElement('li', {
      className: `todo-item ${todo.completed ? 'completed' : ''}`,
      id: `todo-${todoId}`,
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
  } catch (error) {
    console.error('createTodoItem 오류:', error);
    return createElement('li', {
      className: 'todo-item error',
      text: '오류가 발생했습니다. 다시 시도해주세요.',
    });
  }
}

// 로딩 상태 표시 함수
export function showLoading() {
  elements.todoList.appendChild(elements.loadingMessage);
}

// 로딩 상태 숨김 함수
export function hideLoading() {
  elements.loadingMessage.remove();
}

// 할일 목록 표시 함수
export function displayTodos(todos, handlers) {
  elements.todoList.innerHTML = '';
  const todoElements = todos.map(todo => createTodoItem(todo, handlers));
  elements.todoList.append(...todoElements);
  // 캐시 업데이트
  todosCache = todos;
}

// 캐시된 todos 반환
export function getTodos() {
  return todosCache;
}

// 인라인 편집 관련 함수들
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

function makeEditable(element, todoId, onEdit) {
  if (element.tagName.toLowerCase() === 'input') return;

  const input = createEditableInput(element.textContent, todoId, onEdit);
  element.parentElement.replaceChild(input, element);
  input.focus();
  input.select();
}

function saveEdit(input, todoId, onEdit) {
  const newValue = input.value.trim();
  if (newValue === '') {
    cancelEdit(input, todoId, onEdit);
    return;
  }

  if (newValue !== input.dataset.originalValue) {
    onEdit(todoId, newValue);
  } else {
    cancelEdit(input, todoId, onEdit);
  }
}

function cancelEdit(input, todoId, onEdit) {
  const span = createElement('span', {
    className: 'title',
    text: input.dataset.originalValue,
    onClick: () => makeEditable(span, todoId, onEdit),
  });
  input.parentElement.replaceChild(span, input);
}

// 입력값 검증
export function validateTitle(title) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    alert(ERROR_MESSAGES.EMPTY_TITLE);
    return false;
  }
  return true;
}

// 현재 입력된 제목 가져오기
export function getInputTitle() {
  return elements.newTodoTitle.value.trim();
}

// 새로운 할일을 목록에 추가
export function addTodoToList(todo, handlers) {
  const todoElement = createTodoItem(todo, handlers);
  elements.todoList.appendChild(todoElement);
  // 캐시 업데이트
  todosCache.push(todo);
}

/**
 * 사용자에게 메시지를 표시하는 함수
 * @param {string} message - 표시할 메시지
 */
export function showMessage(message) {
  const messageContainer = $$('.message-container')[0];
  messageContainer.innerText = message;
  messageContainer.classList.add('show'); // 애니메이션 적용

  // 메시지를 일정 시간 후에 자동으로 제거
  setTimeout(() => {
    messageContainer.classList.add('hide'); // 서서히 사라지는 애니메이션 적용

    setTimeout(() => {
      messageContainer.classList.remove('show', 'hide'); // 애니메이션이 끝난 후 완전히 숨김
    }, 500); // transition 시간과 동일하게 설정 (0.5s)
  }, 3000);
}
