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

// Todo 아이템 생성 함수
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

// 할일 목록 표시 함수
export function displayTodos(todos, handlers) {
  elements.todoList.innerHTML = '';
  const todoElements = todos.map(todo => createTodoItem(todo, handlers));
  elements.todoList.append(...todoElements);
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
    onEdit(todoId, newValue, null);
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
}
