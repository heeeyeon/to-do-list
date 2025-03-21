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

/**
 * todo 항목에 대한 DOM 리스트 아이템을 생성하며, 인라인 편집 및 동작 버튼을 포함합니다.
 *
 * 반환되는 리스트 아이템은 todo의 제목을 표시하고, 편집, 완료 상태 전환 및 확인 후 삭제를 위한 인터랙티브 컨트롤을 제공합니다.
 * 제목을 클릭하면 제공된 편집 핸들러를 통해 인라인 편집이 시작됩니다. 요소 생성 중 오류가 발생하면,
 * 오류를 로그에 기록한 후 실패를 나타내는 대체 리스트 아이템을 반환합니다.
 *
 * @param {Object} todo - 최소한 `id`, `title`, 그리고 불린형 `completed` 플래그를 포함하는 todo 항목 객체.
 * @param {Function} onEdit - todo 제목 편집을 시작하기 위한 콜백 함수.
 * @param {Function} onToggle - todo의 완료 상태 전환을 위한 콜백 함수.
 * @param {Function} onDelete - 확인 후 todo 항목 삭제를 위한 콜백 함수.
 * @returns {HTMLElement} todo 항목을 나타내는 리스트 아이템 요소, 또는 오류 발생 시 대체 요소를 반환합니다.
 */
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

/**
 * todo 리스트에 로딩 메시지 요소를 추가합니다.
 *
 * 이 함수는 미리 정의된 로딩 메시지 요소를 todo 리스트 컨테이너에 추가하여 로딩 인디케이터를 표시합니다.
 */
export function showLoading() {
  elements.todoList.appendChild(elements.loadingMessage);
}

/**
 * DOM에서 로딩 메시지 요소를 제거하여 숨깁니다.
 */
export function hideLoading() {
  elements.loadingMessage.remove();
}

/**
 * 사용자 인터페이스에 todo 항목들의 리스트를 렌더링합니다.
 *
 * 현재 리스트를 비우고, createTodoItem 함수를 통해 새로운 todo 요소들을 생성한 후 화면에 추가합니다.
 * 내부 캐시는 현재의 todo 상태를 반영하도록 업데이트됩니다.
 *
 * @param {Array} todos - 표시할 todo 객체들의 배열입니다.
 * @param {Object} handlers - 편집, 상태 전환, 삭제 등의 작업을 위한 콜백 함수들을 포함하는 객체입니다.
 */
export function displayTodos(todos, handlers) {
  elements.todoList.innerHTML = '';
  const todoElements = todos.map(todo => createTodoItem(todo, handlers));
  elements.todoList.append(...todoElements);
  // 캐시 업데이트
  todosCache = todos;
}

/**
 * 현재 캐시된 todo 항목들의 리스트를 반환합니다.
 *
 * @returns {Array} todo 항목들의 배열입니다.
 */
export function getTodos() {
  return todosCache;
}

/**
 * todo 항목의 제목을 인라인 편집할 수 있도록 편집 가능한 입력 필드를 생성합니다.
 *
 * 제공된 현재 텍스트로 입력 필드를 설정하고, Enter 키 입력 시 편집을 저장, Escape 키 입력 시 편집을 취소하거나
 * 키보드 이벤트가 아닌 경우 blur 시 편집을 저장하도록 이벤트 핸들러를 구성합니다.
 *
 * @param {string} currentText - 입력 필드에 표시할 기존의 제목 텍스트입니다.
 * @param {number|string} todoId - 편집 중인 todo 항목의 고유 식별자입니다.
 * @param {Function} onEdit - 편집 저장 또는 취소 처리를 위한 콜백 함수입니다.
 * @returns {HTMLInputElement} 인라인 편집을 위한 설정된 입력 요소를 반환합니다.
 */
function createEditableInput(currentText, todoId, onEdit) {
  const input = createElement('input', {
    className: 'edit-input',
  });

  input.type = 'text';
  input.value = currentText;
  input.dataset.originalValue = currentText;

  input.onkeydown = e => {
    if (e.key === 'Enter') {
      input.dataset.keyboardAction = 'enter';
      saveEdit(input, todoId, onEdit);
      e.preventDefault();
    } else if (e.key === 'Escape') {
      input.dataset.keyboardAction = 'escape';
      cancelEdit(input, todoId, onEdit);
      e.preventDefault();
    }
  };

  input.onblur = () => {
    // 키보드 액션에 의한 blur 이벤트 처리 방지
    if (input.dataset.keyboardAction) {
      delete input.dataset.keyboardAction;
      return;
    }
    if (input.parentElement) {
      saveEdit(input, todoId, onEdit);
    }
  };

  return input;
}

/**
 * 편집 불가능한 요소를 편집 가능한 입력 필드로 변환합니다.
 *
 * 주어진 요소가 입력 필드가 아니면 원본 텍스트로 채워진 입력 요소로 교체됩니다.
 * 입력 필드는 자동으로 포커싱되고 텍스트가 선택되어 즉시 편집할 수 있게 합니다.
 *
 * @param {HTMLElement} element - 주로 span 요소인, todo 항목의 제목을 나타내는 DOM 요소입니다.
 * @param {string} todoId - todo 항목의 고유 식별자입니다.
 * @param {function} onEdit - 편집 동작을 처리하기 위한 콜백 함수입니다.
 */
function makeEditable(element, todoId, onEdit) {
  if (element.tagName.toLowerCase() === 'input') return;

  const input = createEditableInput(element.textContent, todoId, onEdit);
  element.parentElement.replaceChild(input, element);
  input.focus();
  input.select();
}

/**
 /**
 * todo 항목의 편집된 제목을 저장합니다.
 *
 * 입력 값을 trim 처리한 후, 새 값이 유효하며 원래 값과 다른지 확인합니다.
 * 만약 trim된 값이 비어있거나 변경되지 않았다면 편집을 취소하고, 그렇지 않으면
 * todo의 식별자와 새 제목을 인자로 제공된 콜백 함수를 호출합니다.
 *
 * @param {HTMLInputElement} input - 편집된 todo 제목을 포함하는 입력 요소입니다.
 * @param {string|number} todoId - 편집 중인 todo 항목의 식별자입니다.
 * @param {function} onEdit - 유효한 변경이 감지되었을 때 todo를 업데이트하는 콜백 함수입니다.
 */
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

/**
 /**  
 * 편집 모드의 입력 요소를 원래의 편집 불가능한 상태로 되돌려 todo 제목의 인라인 편집을 취소합니다.  
 *  
 * 이 함수는 입력 요소의 dataset에 저장된 원래 제목을 사용해 클릭 가능한 새 span 요소를 생성합니다.  
 * 해당 span을 클릭하면 제공된 콜백 함수가 호출되어 편집이 다시 활성화됩니다.  
 *  
 * @param {HTMLInputElement} input - 원래 제목이 dataset에 저장된, 편집 모드의 입력 요소입니다.  
 * @param {string|number} todoId - todo 항목의 식별자입니다.  
 * @param {Function} onEdit - 제목 클릭 시 편집을 재활성화하기 위한 콜백 함수입니다.  
 */
function cancelEdit(input, todoId, onEdit) {
  const span = createElement('span', {
    className: 'title',
    text: input.dataset.originalValue,
    onClick: () => makeEditable(span, todoId, onEdit),
  });
  input.parentElement.replaceChild(span, input);
}

/**
 * todo 제목에서 공백을 제거한 후, 제목이 비어있지 않은지 검증합니다.
 *
 * 이 함수는 제공된 제목에서 모든 공백을 제거합니다.
 * 결과 문자열이 비어있다면 사용자에게 오류 메시지를 표시하고 false를 반환하며,
 * 그렇지 않으면 true를 반환합니다.
 *
 * @param {string} title - 검증할 todo 제목입니다.
 * @returns {boolean} 제목이 비어있지 않으면 true, 그렇지 않으면 false를 반환합니다.
 */
export function validateTitle(title) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    alert(ERROR_MESSAGES.EMPTY_TITLE);
    return false;
  }
  return true;
}

/**
 * 새 todo 제목 입력 필드에서 공백을 제거한 텍스트를 가져옵니다.
 *
 * @returns {string} 사용자가 입력한 공백 제거된 제목 텍스트를 반환합니다.
 */
export function getInputTitle() {
  return elements.newTodoTitle.value.trim();
}

/**
 * UI 리스트에 새로운 todo 항목을 추가하고 내부 캐시를 업데이트합니다.
 *
 * 이 함수는 제공된 todo 항목에 대해 지정된 핸들러를 사용하여 DOM 요소를 생성한 후,
 * 이를 todo 리스트에 추가하고 내부 캐시에 저장합니다.
 *
 * @param {object} todo - 추가할 todo 항목 객체입니다.
 * @param {object} handlers - 편집, 상태 전환, 삭제 등의 작업을 위한 콜백 함수들을 포함하는 객체입니다.
 */
export function addTodoToList(todo, handlers) {
  const todoElement = createTodoItem(todo, handlers);
  elements.todoList.appendChild(todoElement);
  // 캐시 업데이트
  todosCache.push(todo);
}

/**
 * 애니메이션 전환 효과와 함께 사용자에게 메시지를 표시합니다.
 *
 * 이 함수는 메시지 컨테이너 요소의 텍스트 내용을 제공된 메시지로 업데이트하고,
 * 'show' 애니메이션을 적용한 후 3초 후에 'hide' 애니메이션을 시작하여 메시지를 자동으로 숨깁니다.
 *
 * @param {string} message - 표시할 메시지 텍스트입니다.
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
