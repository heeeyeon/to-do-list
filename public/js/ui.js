/**
 * Todo 애플리케이션의 사용자 인터페이스(UI) 조작을 담당하는 모듈입니다.
 * 이 모듈은 todo 항목의 생성, 수정, 삭제와 관련된 다양한 UI 작업을 수행하며,
 * 로딩 인디케이터 및 사용자 알림 메시지 등의 동작을 관리합니다.
 * 모든 주석은 한글로 상세하게 기술되어 있어 개발자들이 쉽게 이해하고 유지보수할 수 있습니다.
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
export const modal = {
  /**
   * 새 Todo 항목 생성을 위한 모달을 엽니다.
   * 모달을 표시하고 입력 필드를 초기화한 후 포커스를 설정합니다.
   * 또한, ESC 키 이벤트에 따라 모달을 닫는 핸들러를 등록합니다.
   *
   * @function openCreate
   */
  openCreate() {
    elements.createModal.style.display = 'block';
    elements.newTodoTitle.value = '';
    elements.newTodoTitle.focus();

    // ESC 키로 모달 닫기 기능 추가
    const handleEscape = e = > {
      if (e.key === 'Escape') {
        this.closeCreate();
        document.removeEventListener('keydown', handleEscape);
      }
    };

    document.addEventListener('keydown', handleEscape);
  },

  /**
   * 새 Todo 항목 생성을 위한 모달을 닫습니다.
   * 모달 창을 숨기고 입력 필드의 내용을 초기화합니다.
   *
   * @function closeCreate
   */
  closeCreate() {
    elements.createModal.style.display = 'none';
    elements.newTodoTitle.value = '';
  },
};

/**
 * todo 항목에 대한 DOM 리스트 아이템을 생성합니다.
 * 생성된 리스트 아이템은 제목 표시, 인라인 편집 기능, 완료/미완료 토글 및 삭제 버튼을 포함합니다.
 * 제목을 클릭하면 인라인 편집 모드가 활성화되어, 변경 사항은 지정된 콜백 함수(onEdit)를 통해 처리됩니다.
 * DOM 요소 생성 도중 예외가 발생하면, 오류를 로그에 기록하고 대체 요소를 반환합니다.
 *
 * @param {Object} todo - 필수 속성 { id, title, completed }를 갖는 todo 객체.
 * @param {Object} handlers - todo 항목의 편집(onEdit), 상태 전환(onToggle) 및 삭제(onDelete) 기능을 위한 콜백 함수 객체.
 * @returns {HTMLElement} 생성된 todo 리스트 아이템 요소.
 */
function createTodoItem(todo, { onEdit, onToggle, onDelete }) {
  try {
    const todoId = String(todo.id);

    const li = createElement('li', {
      className: `todo-item ${todo.completed ? 'completed' : ''}`,
      id: `todo-${todoId}`,
      attributes: {
        'data-todo-id': todoId,
      },
    });

    const todoContent = createElement('div', {
      className: 'todo-content',
      onClick: () => makeEditable(titleSpan, todoId, onEdit),
      attributes: {
        role: 'button',
        tabindex: '0',
        'aria-label': `${todo.title} 편집하기`,
      },
      onKeyDown: e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          makeEditable(titleSpan, todoId, onEdit);
        }
      },
    });

    const titleSpan = createElement('span', {
      className: 'title',
      text: todo.title,
    });

    const editIcon = createElement('span', {
      className: 'edit-icon',
      attributes: {
        'aria-hidden': 'true',
      },
    });

    // SVG 아이콘 추가하기
    editIcon.innerHTML = ` <svg
        width="16" height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        role="img"
        aria-label="편집 아이콘"
      >
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
      </svg> `;
    const buttonsDiv = createElement('div', { className: 'todo-buttons' });
    const toggleButton = createElement('button', {
      className: `toggle-btn ${todo.completed ? '' : 'incomplete'}`,
      attributes: {
        'aria-pressed': todo.completed ? 'true' : 'false',
        'aria-label': todo.completed
          ? '완료됨, 클릭하여 미완료로 표시'
          : '미완료, 클릭하여 완료로 표시',
      },
      onClick: () = > onToggle(todoId, !todo.completed),
    });

    // 버튼 내용 개선
    toggleButton.innerHTML = ` <span class="toggle-icon" aria-hidden="true">${todo.completed ? '✅' : '🟨'}</span> <span class="toggle-text">${todo.completed ? '완료됨' : '미완료'}</span> `;
    const deleteButton = createElement('button', {
      className: 'delete-btn',
      text: '삭제',
      attributes: {
        'aria-label': `${todo.title} 삭제`,
      },
      onClick: () = > {
        if (confirm(\`"\${todo.title}" 항목을 삭제하시겠습니까?\`)) {
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
    li.appendChild(buttonsDiv);

    return li;
  } catch (error) {
    console.error('createTodoItem 오류:', error);
    return createElement('li', {
      className: 'todo-item error',
      text: '오류가 발생했습니다. 다시 시도해주세요.',
      attributes: {
        role: 'alert',
      },
    });
  }
}

/**
 * Todo 리스트에 로딩 메시지 요소를 추가하여 로딩 상태를 표시합니다.
 *
 * 이 함수는 UI의 로딩 중 상태를 사용자에게 시각적으로 전달하기 위해 미리 정의된 로딩 메시지 요소를
 * todo 리스트 DOM 요소 하위에 추가합니다. 만약 로딩 메시지 DOM 요소를 찾을 수 없으면, 콘솔에 오류를 남길 수 있습니다.
 */
export function showLoading() {
  elements.todoList.appendChild(elements.loadingMessage);
}

/**
 * Todo 리스트에서 로딩 메시지 요소를 제거하여 로딩 상태 표시를 종료합니다.
 *
 * 이 함수는 미리 추가된 로딩 메시지 요소를 DOM에서 제거하여, 사용자에게 로딩 상태가 종료되었음을 표시합니다.
 * 만약 로딩 메시지 요소가 존재하지 않는 경우 추가 처리는 수행하지 않습니다.
 */
export function hideLoading() {
  elements.loadingMessage.remove();
}

/**
 * 제공된 todo 항목 배열을 사용하여 UI 상에 todo 리스트를 렌더링합니다.
 *
 * 기존의 todo 리스트를 초기화한 후, 각 todo 항목에 대해 createTodoItem 함수를 호출하여 DOM 리스트 아이템을 생성하고,
 * 이를 todo 리스트 컨테이너에 추가합니다. 이 함수는 내부 캐시를 업데이트하여 현재 상태를 유지합니다.
 *
 * @param {Array <Object>} todos - 렌더링할 todo 객체 배열입니다.
 * @param {Object} handlers - 각 todo 항목의 상호작용(편집, 토글, 삭제)을 처리하기 위한 콜백 함수(onEdit, onToggle, onDelete)를 포함하는 객체입니다.
 */
export function displayTodos(todos, handlers) {
  elements.todoList.innerHTML = '';
  const todoElements = todos.map(todo => createTodoItem(todo, handlers));
  elements.todoList.append(...todoElements);
  // 캐시 업데이트
  todosCache = todos;
}

/**
 * 현재 캐시된 todo 항목들의 배열을 반환합니다.
 *
 * 이 함수는 내부적으로 저장된 todo 항목 목록을 리턴하여, 최신 상태 정보를 제공하며,
 * 데이터 소스와의 싱크가 필요한 로직에서 활용할 수 있습니다.
 *
 * @returns {Array<Object>} 현재 캐시된 todo 객체들의 배열을 반환합니다.
 */
export function getTodos() {
  return todosCache;
}

/**
 * 인라인 편집 모드를 위한 입력 필드를 생성합니다.
 *
 * 주어진 현재 텍스트로 입력 필드를 초기화하고, Enter 키 입력 시 편집 저장, Escape 키 입력 시 편집 취소를 처리합니다.
 * 또한, blur 이벤트 처리 시 키보드 액션에 의한 이벤트 여부를 확인하여 적절한 편집 저장 또는 취소 로직을 수행합니다.
 *
 * @param {string} currentText - 입력 필드에 초기화할 기존 텍스트.
 * @param {number|string} todoId - 편집 중인 todo 항목의 고유 식별자.
 * @param {Function} onEdit - 편집 완료 또는 취소 시 호출되는 콜백 함수.
 * @returns {HTMLInputElement} 구성이 완료된 인라인 편집 입력 요소.
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
 * 비편집 상태의 DOM 요소를 편집 가능한 입력 필드로 전환합니다.
 *
 * 이 함수는 주어진 요소가 이미 입력 필드가 아닌 경우에만 인라인 편집을 활성화하며,
 * 입력 필드를 생성하여 기존 요소를 대체하고 자동으로 포커싱 및 텍스트 선택 상태로 전환합니다.
 *
 * @param {HTMLElement} element - 편집 전인 todo 항목의 제목 DOM 요소(주로 span 요소)입니다.
 * @param {string|number} todoId - todo 항목의 고유 식별자입니다.
 * @param {Function} onEdit - 편집 완료 또는 취소 시 실행되는 콜백 함수입니다.
 */
function makeEditable(element, todoId, onEdit) {
  if (element.tagName.toLowerCase() === 'input') return;

  const input = createEditableInput(element.textContent, todoId, onEdit);
  element.parentElement.replaceChild(input, element);
  input.focus();
  input.select();
}

/**
 * 인라인 편집 모드에서 사용자가 입력한 편집된 제목을 저장합니다.
 *
 * 입력 필드의 텍스트를 trim하여 새로운 값이 유효한지 검사한 후 기존 값과 달라졌다면, 제공된 onEdit 콜백 함수를 호출하여 업데이트합니다.
 * 만약 새로운 값이 비어있거나 변동이 없을 경우에는 편집 취소 로직을 호출합니다.
 * 오류 처리 시에는 사용자에게 적절한 메시지를 보여주고, 편집 모드를 유지합니다.
 *
 * @param {HTMLInputElement} input - 편집된 제목을 포함하는 입력 요소.
 * @param {string|number} todoId - 해당 todo 항목의 고유 식별자.
 * @param {Function} onEdit - 제목 변경을 처리하는 비동기 콜백 함수로, 실패 시 오류 메시지와 재편집 기능을 트리거합니다.
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
 * 인라인 편집 모드에서 수정된 내용을 취소하고, 원래의 텍스트를 복원합니다.
 *
 * 입력 요소의 dataset에서 저장된 원래 제목을 사용하여, 클릭 시 다시 인라인 편집 모드로 전환 가능한
 * span 요소로 대체합니다. 이 함수는 사용자가 수정 후 취소하고자 할 때 호출됩니다.
 *
 * @param {HTMLInputElement} input - 현재 편집 중인 입력 요소.
 * @param {string|number} todoId - 해당 todo 항목의 고유 식별자.
 * @param {Function} onEdit - 인라인 편집 재활성화를 위한 콜백 함수.
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
 * todo 제목에서 불필요한 공백을 제거하고, 제목이 유효한지 검증합니다.
 *
 * 제목이 빈 문자열이 되면 사용자에게 오류 메시지를 표시하고, 포커스를 입력 필드에 유지합니다.
 * 정상적인 제목인 경우 true를 반환하여 제목 검증을 통과했음을 알립니다.
 *
 * @param {string} title - 검증할 todo 제목 문자열.
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
 * 새 todo 제목 입력 필드에서 공백을 제거한 텍스트를 반환합니다.
 *
 * 이 함수는 사용자 입력값을 실시간으로 trim하여, 불필요한 공백을 제거한 제목 문자열을 리턴합니다.
 *
 * @returns {string} 사용자 입력에서 공백 제거 후의 제목.
 */
export function getInputTitle() {
  return elements.newTodoTitle.value.trim();
}

/**
 * 새 todo 항목을 UI 리스트에 추가하고, 내부 캐시에 업데이트합니다.
 *
 * 이 함수는 주어진 todo 항목에 대해 createTodoItem 함수를 호출하여 DOM 요소를 생성한 후,
 * 이를 todo 리스트에 추가하며, 내부 캐시 배열에 항목을 추가합니다.
 *
 * @param {Object} todo - 추가할 todo 항목 객체.
 * @param {Object} handlers - 각 todo 항목의 상호작용(편집, 완료 상태 전환, 삭제)을 처리할 콜백 함수들을 포함하는 객체.
 */
export function addTodoToList(todo, handlers) {
  const todoElement = createTodoItem(todo, handlers);
  elements.todoList.appendChild(todoElement);
  // 캐시 업데이트
  todosCache.push(todo);
}

/**
 * 사용자 인터페이스에 애니메이션 효과와 함께 메시지를 표시합니다.
 *
 * 이 함수는 주어진 메시지를 메시지 컨테이너 요소에 설정하고, 오류 여부에 따라 ARIA role을 동적으로 할당합니다.
 * 3초 후에 자동으로 사라지는 hide 애니메이션을 적용하여, 사용자에게 알림을 제공합니다.
 *
 * @param {string} message - 표시할 메시지 텍스트. 메시지 내용에 따라 오류 혹은 일반 상태가 결정됩니다.
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
      messageContainer.classList.remove('show', 'hide'); // 애니메이션이 끝난 후 완전히 숨김
    }, 500); // transition 시간과 동일하게 설정 (0.5s)
  }, 3000);
}

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
      messageContainer.classList.remove('show', 'hide'); // 애니메이션이 끝난 후 완전히 숨김
    }, 500); // transition 시간과 동일하게 설정 (0.5s)
  }, 3000);
}
