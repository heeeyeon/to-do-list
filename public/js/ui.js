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
  openCreate() {
    elements.createModal.style.display = 'block';
    elements.newTodoTitle.value = '';
    elements.newTodoTitle.focus();

    // ESC 키로 모달 닫기 기능 추가
    const handleEscape = e => {
      if (e.key === 'Escape') {
        this.closeCreate();
        document.removeEventListener('keydown', handleEscape);
      }
    };

    document.addEventListener('keydown', handleEscape);
  },

  closeCreate() {
    elements.createModal.style.display = 'none';
    elements.newTodoTitle.value = '';
  },
};

/**
 * Creates a DOM list item representing a todo with inline editing and action buttons.
 *
 * The returned element displays the todo's title and provides interactive controls to edit the title,
 * toggle the completion status, and delete the todo after confirmation. Clicking on the title or pressing
 * Enter/Space when focused triggers inline editing via the provided callback. If an error occurs during
 * creation, the error is logged and a fallback list item indicating the error is returned.
 *
 * @param {Object} todo - The todo object, which must include an `id`, `title`, and a boolean `completed` flag.
 * @param {Function} onEdit - Callback to initiate inline editing of the todo title.
 * @param {Function} onToggle - Callback to toggle the completion status of the todo.
 * @param {Function} onDelete - Callback to delete the todo after confirmation.
 * @returns {HTMLElement} A list item element representing the todo, or a fallback error element if creation fails.
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
    editIcon.innerHTML = `
      <svg
        width="16" height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        role="img"
        aria-label="편집 아이콘"
      >

        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
      </svg>
    `;
    const buttonsDiv = createElement('div', { className: 'todo-buttons' });
    const toggleButton = createElement('button', {
      className: `toggle-btn ${todo.completed ? '' : 'incomplete'}`,
      attributes: {
        'aria-pressed': todo.completed ? 'true' : 'false',
        'aria-label': todo.completed
          ? '완료됨, 클릭하여 미완료로 표시'
          : '미완료, 클릭하여 완료로 표시',
      },
      onClick: () => onToggle(todoId, !todo.completed),
    });

    // 버튼 내용 개선
    toggleButton.innerHTML = `
              <span class="toggle-icon" aria-hidden="true">${todo.completed ? '✅' : '🟨'}</span>
              <span class="toggle-text">${todo.completed ? '완료됨' : '미완료'}</span>
            `;
    const deleteButton = createElement('button', {
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
      attributes: {
        role: 'alert',
      },
    });
  }
}

/**
 * Displays the loading indicator by appending the predefined loading message element
 * to the todo list container.
 */
export function showLoading() {
  elements.todoList.appendChild(elements.loadingMessage);
}

/**
 * Hides the loading message element from the DOM.
 *
 * This function removes the loading message element, ensuring that any indication of a loading state is no longer visible.
 */
export function hideLoading() {
  elements.loadingMessage.remove();
}

/**
 * Renders a list of todo items in the user interface.
 *
 * This function clears the current todo list and repopulates it with new elements generated via the createTodoItem function.
 * It also updates the internal cache to reflect the latest state of todos.
 *
 * @param {Array} todos - Array of todo objects to display.
 * @param {Object} handlers - Object containing callback functions for actions such as editing, toggling completion, and deleting todos.
 */
export function displayTodos(todos, handlers) {
  elements.todoList.innerHTML = '';
  const todoElements = todos.map(todo => createTodoItem(todo, handlers));
  elements.todoList.append(...todoElements);
  // 캐시 업데이트
  todosCache = todos;
}

/**
 * Retrieves the current cached list of todo items.
 *
 * @returns {Array} An array containing the todo items stored in the cache.
 */
export function getTodos() {
  return todosCache;
}

/**
 * Creates an input element configured for inline editing of a todo item's title.
 *
 * The input is initialized with the supplied text and equipped with event handlers that:
 * - Save the edit when the Enter key is pressed.
 * - Cancel the edit when the Escape key is pressed.
 * - Save the edit on blur if the blur event isn't triggered by a keyboard action.
 *
 * @param {string} currentText - The text to display and edit in the input field.
 * @param {number|string} todoId - The unique identifier of the todo item being edited.
 * @param {Function} onEdit - Callback invoked to handle saving or canceling the edit.
 * @returns {HTMLInputElement} The configured input element for inline editing.
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
 * Converts a non-editable element into an editable input field.
 *
 * If the provided DOM element is not already an input field, it is replaced by an input element
 * containing its original text. The new input is automatically focused and its text is selected
 * for immediate inline editing.
 *
 * @param {HTMLElement} element - The DOM element (typically a <span>) representing the to-do item's title.
 * @param {string} todoId - A unique identifier for the to-do item.
 * @param {Function} onEdit - Callback function to handle the edit action.
 */
function makeEditable(element, todoId, onEdit) {
  if (element.tagName.toLowerCase() === 'input') return;

  const input = createEditableInput(element.textContent, todoId, onEdit);
  element.parentElement.replaceChild(input, element);
  input.focus();
  input.select();
}

/**
 * Saves the edited title for a todo item.
 *
 * Trims the input value and checks whether it is both non-empty and different from the original title.
 * If the trimmed value is empty or unchanged, it cancels the edit; otherwise, it invokes the provided
 * callback with the todo item's identifier and the new title. If an error occurs during the update,
 * an error message is displayed, the error is logged, and the edit mode is retained.
 *
 * @param {HTMLInputElement} input - The input element containing the edited todo title.
 * @param {string|number} todoId - The identifier of the todo item being edited.
 * @param {function} onEdit - Callback to update the todo when a valid change is detected.
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
 * Reverts the inline editing input field back to a non-editable title element.
 *
 * The function replaces the editing input with a span element that displays the original title,
 * retrieved from the input's dataset. Clicking the span will re-enable editing by calling the provided callback.
 *
 * @param {HTMLInputElement} input - The input element in edit mode, which contains the original title in its dataset.
 * @param {string|number} todoId - The identifier for the todo item.
 * @param {Function} onEdit - Callback function that re-enables editing when the title element is clicked.
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
 * Validates a todo title by trimming leading and trailing whitespace.
 *
 * Removes extra spaces from the provided title and checks if the result is non-empty.
 * If the trimmed title is empty, it displays an error message and focuses the title input field,
 * returning false. Otherwise, it returns true.
 *
 * @param {string} title - The todo title to validate.
 * @returns {boolean} True if the trimmed title is non-empty, false otherwise.
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
 * Retrieves the new to-do title from the input field with leading and trailing whitespace removed.
 *
 * @returns {string} The trimmed to-do title.
 */
export function getInputTitle() {
  return elements.newTodoTitle.value.trim();
}

/**
 * Adds a new todo item to the UI list and updates the internal cache.
 *
 * Creates a DOM element for the provided todo using the specified callbacks and appends it to
 * the todo list container. The todo item is then added to the internal cache.
 *
 * @param {object} todo - The todo item to add.
 * @param {object} handlers - Callback functions for editing, toggling completion status, and deleting the todo.
 */
export function addTodoToList(todo, handlers) {
  const todoElement = createTodoItem(todo, handlers);
  elements.todoList.appendChild(todoElement);
  // 캐시 업데이트
  todosCache.push(todo);
}

/**
 * Displays a user message with a fade-out animation and adjusts accessibility attributes.
 *
 * The function updates the text of the first element with the "message-container" class to the provided message.
 * It sets ARIA attributes based on whether the message appears to be an error (detected by keywords such as "실패", "오류", or "없").
 * If an error is detected, the element's role is set to "alert" with "assertive" aria-live; otherwise, it is set to "status" with "polite" aria-live.
 * The message is shown immediately with a "show" animation, remains visible for 3 seconds, and then fades out over 0.5 seconds,
 * after which the animation classes are removed.
 *
 * @param {string} message - The text to display to the user.
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
