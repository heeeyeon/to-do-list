/**
 * Todo 애플리케이션의 UI 동작을 담당하는 모듈입니다.
 * 이 모듈은 사용자 인터페이스 업데이트, 사용자 입력 이벤트 처리 및
 * todo 항목의 생성, 편집, 삭제, 상태 전환 등의 작업을 수행합니다.
 * 각 함수 및 메서드는 상세한 JSDoc 주석으로 문서화되어 있습니다.
 */
import { ERROR_MESSAGES, ERROR_TYPES } from './config.js';
import { $, $$, createElement } from './utils.js';

// DOM 요소 참조
const elements = {
  todoList: $('#todoList'),
  createModal: $('#createTodoModal'),
  newTodoTitle: $('#newTodoTitle'),
  loadingMessage: createElement('div', {
    className: 'loading-message',
    text: '로딩 중...',
    attributes: {
      role: 'status',
      'aria-live': 'polite',
    },
  }),
};

// 캐시된 todos 데이터
let todosCache = [];

// 모달 관련 함수들
/**
 * 모듈 내 todo 생성 모달 제어와 관련된 함수들을 포함하는 객체입니다.
 */
export const modal = {
  /**
   * todo 생성 모달을 열고 초기화합니다.
   *
   * 모달을 보이도록 설정하고, 입력 필드를 초기화한 후 포커스를 설정합니다.
   * 또한, ESC 키 이벤트 감지를 통해 모달을 닫을 수 있도록 리스너를 등록합니다.
   *
   * @function
   */
  openCreate() {
    elements.createModal.style.display = 'block';
    elements.newTodoTitle.value = '';
    elements.newTodoTitle.focus();

    // ESC 키로 모달 닫기
    const handleEscape = e => {
      if (e.key === 'Escape') {
        this.closeCreate();
        document.removeEventListener('keydown', handleEscape);
      }
    };

    document.addEventListener('keydown', handleEscape);
  },

  /**
   * todo 생성 모달을 닫고 입력 필드를 초기화합니다.
   *
   * 모달의 표시를 숨기고, 입력 필드의 내용을 비워 다음 입력을 준비합니다.
   *
   * @function
   */
  closeCreate() {
    elements.createModal.style.display = 'none';
    elements.newTodoTitle.value = '';
  },
};

/**
 * todo 항목에 대한 DOM 리스트 아이템을 생성하여 반환합니다.
 *
 * 주어진 todo 객체를 기반으로 리스트 아이템을 생성하며, todo 제목, 인라인 편집 기능,
 * 완료 상태 전환, 삭제 기능 등 다양한 인터랙티브 요소들을 포함합니다.
 * DOM 요소 생성 과정에서 오류가 발생하면, 오류 메시지를 콘솔에 기록하고
 * 오류를 나타내는 리스트 아이템을 반환합니다.
 *
 * @param {Object} todo - 생성할 todo 항목 객체. `id`, `title`, `completed` 속성을 포함해야 합니다.
 * @param {Object} handlers - todo 관련 이벤트 핸들러를 담은 객체.
 *   @property {Function} onEdit - todo 제목 편집을 위한 콜백 함수.
 *   @property {Function} onToggle - todo 완료 상태 전환을 위한 콜백 함수.
 *   @property {Function} onDelete - todo 삭제를 위한 콜백 함수.
 * @returns {HTMLElement} 생성된 todo 아이템 DOM 요소를 반환합니다.
 */
function createTodoItem(todo, { onEdit, onToggle, onDelete }) {
  const todoId = String(todo.id);
  const titleSpan = createElement('span', {
    className: 'title',
    text: todo.title,
  });

  const todoItem = createElement('li', {
    className: `todo-item ${todo.completed ? 'completed' : ''}`,
    id: `todo-${todoId}`,
    attributes: {
      'data-todo-id': todoId,
    },
    children: [
      // Todo 콘텐츠 영역
      {
        tag: 'div',
        className: 'todo-content',
        onClick: () => makeEditable(titleSpan, todoId, onEdit),
        attributes: {
          role: 'button',
          tabindex: '0',
          'aria-label': `${todo.title} 편집하기`,
        },
        children: [
          titleSpan,
          {
            tag: 'span',
            className: 'edit-icon',
            html: ` <svg
                width="16" height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                role="img"
                aria-label="편집 아이콘"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg> `,
            attributes: {
              'aria-hidden': 'true',
            },
          },
        ],
        onKeyDown: e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            makeEditable(titleSpan, todoId, onEdit);
          }
        },
      },
      // buttons 영역
      {
        tag: 'div',
        className: 'todo-buttons',
        children: [
          // toggleButton
          {
            tag: 'button',
            className: `toggle-btn ${todo.completed ? '' : 'incomplete'}`,
            html: ` <span class="toggle-icon" aria-hidden="true">${todo.completed ? '✅' : '🟨'}</span> <span class="toggle-text">${todo.completed ? '완료됨' : '미완료'}</span> `,
            attributes: {
              'aria-pressed': todo.completed ? 'true' : 'false',
              'aria-label': todo.completed
                ? '완료됨, 클릭하여 미완료로 표시'
                : '미완료, 클릭하여 완료로 표시',
            },
            onClick: () => onToggle(todoId, !todo.completed),
          },
          // deleteButton
          {
            tag: 'button',
            className: 'delete-btn',
            text: '삭제',
            attributes: {
              'aria-label': `${todo.title} 삭제`,
            },
            onClick: () => {
              if (confirm(`"${todo.title}" 항목을 삭제하시겠습니까?`)) {
                onDelete(todoId);
              }
            },
          },
        ],
      },
    ],
  });

  return todoItem;
}

// TODO : 로딩 인디케이터 상태관리 추적 구현
/**
 * Todo 리스트에 로딩 메시지 요소를 추가하여 로딩 상태를 사용자에게 표시합니다.
 *
 * - 미리 정의된 로딩 메시지 DOM 요소를 이용하여, 데이터 로딩 중임을 사용자에게 알립니다.
 * - 만약 todo 리스트 컨테이너 요소를 찾지 못할 경우, 추가적인 오류 처리가 필요할 수 있습니다.
 *
 * @returns {void}
 */
export function showLoading() {
  elements.todoList.appendChild(elements.loadingMessage);
}

/**
 * UI에서 로딩 메시지 요소를 제거하여 로딩 상태 표시를 종료합니다.
 *
 * - 로딩이 완료된 후, 사용자가 정상적으로 인터페이스를 사용할 수 있도록 로딩 인디케이터를 제거합니다.
 * - 로딩 메시지 DOM 요소가 없을 경우, 별도의 동작 없이 종료됩니다.
 *
 * @returns {void}
 */
export function hideLoading() {
  elements.loadingMessage.remove();
}

/**
 * Todo 항목 배열을 받아 UI에 리스트를 렌더링하고, 내부 캐시를 업데이트합니다.
 *
 * - 기존 todo 리스트를 초기화하고, 각 항목에 대해 createTodoItem 함수를 호출하여 DOM 요소를 생성합니다.
 * - 인라인 편집, 완료 상태 토글 및 삭제와 같은 인터랙티브 이벤트 핸들러가 포함됩니다.
 * - DOM 렌더링 중 발생할 수 있는 예외나 참조 오류에 대해, 내부적으로 에러 핸들링이 구현되어 있습니다.
 *
 * @param {Array <Object>} todos - 렌더링할 todo 객체들의 배열.
 * @param {Object} handlers - 이벤트 핸들러 객체. 포함된 이벤트:
 *    - onEdit: (todoId: string, newTitle: string) => Promise 또는 void.
 *    - onToggle: (todoId: string, newState: boolean) => void.
 *    - onDelete: (todoId: string) => void.
 * @returns {void}
 */
export function displayTodos(todos, handlers) {
  elements.todoList.innerHTML = '';
  const todoElements = todos.map(todo => createTodoItem(todo, handlers));
  elements.todoList.append(...todoElements);
  // 캐시 업데이트
  todosCache = todos;
}

/**
 * 현재 메모리에 캐시된 todo 항목들의 배열을 반환합니다.
 *
 * - 내부 캐시에 저장된 최신 todo 정보가 반영됩니다.
 *
 * @returns {Array<Object>} 캐시된 todo 객체 배열.
 */
export function getTodos() {
  return todosCache;
}

/**
 * 주어진 텍스트를 기반으로 인라인 편집 기능을 위한 입력 필드를 생성합니다.
 *
 * - 생성된 입력 필드는 사용자가 todo 제목을 수정할 수 있도록 구성되며,
 * - Enter 키 입력 시 편집 내용을 저장하고, Escape 키 입력 시 편집을 취소합니다.
 * - 또한, blur 이벤트 발생 시에도 변경 사항을 확인하여 자동 저장 또는 취소 처리가 이루어집니다.
 *
 * @param {string} currentText - 입력 필드에 표시될 기존 todo 제목.
 * @param {number|string} todoId - 편집 대상 todo 항목의 고유 식별자.
 * @param {Function} onEdit - 편집 완료 후 호출되는 콜백 (todoId, newValue)를 인자로 전달.
 * @returns {HTMLInputElement} 구성된 인라인 편집용 입력 필드.
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
 * 주어진 DOM 요소(보통 span)를 인라인 편집 가능한 입력 필드로 변경합니다.
 *
 * - 요소가 이미 입력 필드일 경우, 변환을 수행하지 않습니다.
 * - 편집 모드에서는 입력 필드에 자동으로 포커스를 주고, 텍스트 선택 상태로 전환하여 즉시 수정이 가능합니다.
 * - Enter 및 Escape 키 이벤트에 따라 편집 저장 또는 취소 처리가 수행됩니다.
 *
 * @param {HTMLElement} element - 인라인 편집 전의 텍스트를 보여주는 DOM 요소.
 * @param {string} todoId - 편집 대상 todo 항목의 고유 식별자.
 * @param {Function} onEdit - 편집 완료 후 호출될 콜백 함수.
 * @returns {void}
 */
function makeEditable(element, todoId, onEdit) {
  if (element.tagName.toLowerCase() === 'input') return;

  const input = createEditableInput(element.textContent, todoId, onEdit);
  element.parentElement.replaceChild(input, element);
  input.focus();
  input.select();
}

/**
 * 인라인 편집 상태의 입력 필드에서 변경된 todo 제목을 저장합니다.
 *
 * - 입력 값은 trim 처리 후, 원래 값과 비교하여 유효한 변경이 있는지 확인합니다.
 * - 만약 입력 값이 비어있거나 변경되지 않았다면, 편집 취소를 자동으로 수행합니다.
 * - 유효한 변경사항이 있을 경우, 제공된 onEdit 콜백을 호출하여 업데이트를 시도하며,
 *   업데이트 실패 시 오류 메시지를 표시하고 편집 모드로 복귀하도록 합니다.
 *
 * @param {HTMLInputElement} input - 인라인 편집 중인 입력 필드.
 * @param {string|number} todoId - 편집 대상 todo 항목의 식별자.
 * @param {Function} onEdit - 변경 사항 저장 후 호출될 콜백 함수.
 * @returns {void}
 */
function saveEdit(input, todoId, onEdit) {
  const newValue = input.value.trim();
  if (newValue === '') {
    cancelEdit(input, todoId, onEdit);
    return;
  }

  if (newValue !== input.dataset.originalValue) {
    try {
      onEdit(todoId, newValue).catch(error => {
        // 오류 발생 시 사용자에게 알림
        showMessage(ERROR_MESSAGES[ERROR_TYPES.UPDATE_FAILED]);
        console.error('할일 업데이트 오류:', error);

        // 편집 상태 유지 (오류 발생 시 원래 편집 모드로 돌아감)
        const parent = input.parentElement;
        const currentSpan = parent.querySelector('.title');
        if (currentSpan) {
          makeEditable(currentSpan, todoId, onEdit);
        }
      });
    } catch (error) {
      // 동기적 오류 처리
      showMessage(ERROR_MESSAGES[ERROR_TYPES.UPDATE_FAILED]);
      console.error('할일 업데이트 오류:', error);
    }
  } else {
    cancelEdit(input, todoId, onEdit);
  }
}

/**
 * 인라인 편집을 취소하고, 원래의 텍스트 표시 요소(span)로 복구합니다.
 *
 * - 입력 필드의 dataset에 저장된 원래 값을 기반으로 새로운 span 요소를 생성합니다.
 * - 생성된 span 요소는 클릭 시 다시 인라인 편집 모드로 전환될 수 있도록 콜백이 설정됩니다.
 *
 * @param {HTMLInputElement} input - 현재 편집 중인 입력 필드.
 * @param {string|number} todoId - 편집 대상 todo 항목의 식별자.
 * @param {Function} onEdit - 편집 모드 재진입을 위한 콜백 함수.
 * @returns {void}
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
 * 입력된 todo 제목의 공백을 제거한 후, 제목이 비어있지 않은지 검증합니다.
 *
 * - 제목이 비어있을 경우 미리 정의된 오류 메시지를 표시하고, 입력 필드에 포커스를 유지합니다.
 * - 유효한 제목인 경우 true를 반환하여 추가 처리가 가능하도록 합니다.
 *
 * @param {string} title - 검증할 todo 제목 텍스트.
 * @returns {boolean} 제목이 유효하면 true, 그렇지 않으면 false.
 */
export function validateTitle(title) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    showMessage(ERROR_MESSAGES[ERROR_TYPES.EMPTY_TITLE]);
    // 입력 필드에 포커스 유지
    elements.newTodoTitle.focus();
    return false;
  }
  return true;
}

/**
 * 새 todo 항목 생성 시, 입력 필드의 텍스트를 가져와 좌우 공백을 제거합니다.
 *
 * @returns {string} 사용자가 입력한, 공백이 제거된 todo 제목.
 */
export function getInputTitle() {
  return elements.newTodoTitle.value.trim();
}

/**
 * 새 todo 항목 객체를 UI 리스트에 추가하고, 내부 캐시를 갱신합니다.
 *
 * - 주어진 todo 데이터와 이벤트 핸들러를 통해 새 요소를 생성하고 DOM에 추가합니다.
 * - 내부 캐시 배열에도 해당 항목을 추가하여 상태 일관성을 유지합니다.
 *
 * @param {Object} todo - 추가할 todo 항목 객체.
 * @param {Object} handlers - 이벤트 핸들러 객체. 포함된 이벤트:
 *    - onEdit: (todoId: string, newTitle: string) => Promise 또는 void.
 *    - onToggle: (todoId: string, newState: boolean) => void.
 *    - onDelete: (todoId: string) => void.
 * @returns {void}
 */
export function addTodoToList(todo, handlers) {
  // TODO : 기존아이템과의 중복 검증
  const todoElement = createTodoItem(todo, handlers);
  elements.todoList.appendChild(todoElement);
  // 캐시 업데이트
  todosCache.push(todo);
}

// TODO : 메시지 커스터마이징 개선 (메시지유형 및 지속시간)
/**
 * 사용자 인터페이스에 애니메이션 효과와 함께 메시지를 표시합니다.
 *
 * - 메시지 텍스트에 따라 동적으로 aria 속성을 설정하여 오류나 상태 메시지를 구분합니다.
 * - 'show' 클래스를 통해 메시지를 표시하고, 일정 시간 후 'hide' 효과로 서서히 사라지게 합니다.
 * - CSS 전환 효과에 따라, 메시지 제거 후 DOM 요소의 상태를 초기화합니다.
 *
 * @param {string} message - 사용자에게 표시할 메시지 텍스트.
 * @returns {void}
 */
export function showMessage(message) {
  const messageContainer = $$('.message-container')[0];

  // 오류 메시지인 경우 role="alert", 일반 메시지인 경우 role="status" 추가
  const isError = message.includes('실패') || message.includes('오류') || message.includes('없');
  messageContainer.setAttribute('role', isError ? 'alert' : 'status');
  messageContainer.setAttribute('aria-live', isError ? 'assertive' : 'polite');

  messageContainer.innerText = message;
  messageContainer.classList.add('show'); // 애니메이션 적용

  // 메시지를 일정 시간 후에 자동으로 제거
  setTimeout(() => {
    messageContainer.classList.add('hide'); // 서서히 사라지는 애니메이션 적용

    setTimeout(() => {
      messageContainer.classList.remove('show', 'hide'); // 애니메이션 종료 후 완전히 숨김
    }, 500); // transition 시간과 동일하게 설정 (0.5초)
  }, 3000);
}
