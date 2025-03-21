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
 * Creates a DOM list item for a todo, complete with inline editing and action buttons.
 *
 * The returned list item displays the todo's title and provides interactive controls for editing, toggling its completion status,
 * and, upon confirmation, deletion. Clicking the title triggers inline editing via the provided edit handler. If an error occurs during
 * element creation, the function logs the error and returns a fallback list item indicating the failure.
 *
 * @param {Object} todo - An object representing the todo, with at least an `id`, `title`, and a boolean `completed` flag.
 * @param {Function} onEdit - Callback invoked to initiate editing the todo title.
 * @param {Function} onToggle - Callback invoked to toggle the todo's completion status.
 * @param {Function} onDelete - Callback invoked to delete the todo after confirmation.
 * @returns {HTMLElement} The list item element representing the todo, or an error element if creation fails.
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
 * Appends the loading message element to the todo list.
 *
 * This function displays a loading indicator by appending a predefined loading message element to the todo list container.
 */
export function showLoading() {
  elements.todoList.appendChild(elements.loadingMessage);
}

/**
 * Hides the loading message by removing it from the DOM.
 */
export function hideLoading() {
  elements.loadingMessage.remove();
}

/**
 * Renders the list of todo items in the user interface.
 *
 * Clears the current list, creates new todo elements via the createTodoItem function, and appends them to the display.
 * The internal cache is updated to reflect the current state of todos.
 *
 * @param {Array} todos - An array of todo objects to display.
 * @param {Object} handlers - An object with callback functions for handling todo actions such as editing, toggling, and deleting.
 */
export function displayTodos(todos, handlers) {
  elements.todoList.innerHTML = '';
  const todoElements = todos.map(todo => createTodoItem(todo, handlers));
  elements.todoList.append(...todoElements);
  // 캐시 업데이트
  todosCache = todos;
}

/**
 * Retrieves the current list of cached todos.
 *
 * @returns {Array} An array of todo items.
 */
export function getTodos() {
  return todosCache;
}

/**
 * Creates an editable input field for inline editing of a todo item's title.
 *
 * Configures an input element with the provided current text and sets up event handlers to save edits when the
 * Enter key is pressed, cancel edits when the Escape key is pressed, or save edits on blur if not triggered by
 * a keyboard action.
 *
 * @param {string} currentText - The existing title text to display in the input.
 * @param {number|string} todoId - The unique identifier of the todo item being edited.
 * @param {Function} onEdit - Callback function invoked to handle saving or canceling the edit.
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
 * Transforms a non-editable element into an editable input field.
 *
 * If the given element is not already an input, it is replaced with an input element
 * pre-filled with the original text content. The input is automatically focused and its text selected,
 * enabling immediate editing.
 *
 * @param {HTMLElement} element - The DOM element representing the todo item's title (typically a span).
 * @param {string} todoId - The unique identifier of the todo item.
 * @param {function} onEdit - Callback function to handle the edit action.
 */
function makeEditable(element, todoId, onEdit) {
  if (element.tagName.toLowerCase() === 'input') return;

  const input = createEditableInput(element.textContent, todoId, onEdit);
  element.parentElement.replaceChild(input, element);
  input.focus();
  input.select();
}

/**
 * Saves the edited title of a todo item.
 *
 * Trims the input value and checks if the new value is valid and different from the original. If the trimmed value is empty or unchanged, it cancels the edit; otherwise, it calls the provided callback with the todo's identifier and the new title.
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
    onEdit(todoId, newValue);
  } else {
    cancelEdit(input, todoId, onEdit);
  }
}

/**
 * Cancels inline editing of a todo title by reverting the editable input to its original, non-editable state.
 *
 * This function creates a new clickable span element using the original title stored in the input's dataset.
 * Clicking the span triggers editing by invoking the provided callback.
 *
 * @param {HTMLInputElement} input - The input element in edit mode which holds the original title in its dataset.
 * @param {string|number} todoId - The identifier for the todo item.
 * @param {Function} onEdit - Callback function invoked to re-enable editing when the title is clicked.
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
 * Validates that a todo title is non-empty after trimming.
 *
 * This function trims any whitespace from the provided title. If the resulting string is empty,
 * it alerts the user with an error message and returns false; otherwise, it returns true.
 *
 * @param {string} title - The todo title to validate.
 * @returns {boolean} True if the title is non-empty; otherwise, false.
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
 * Retrieves the trimmed text from the new todo title input field.
 *
 * @returns {string} The trimmed title entered by the user.
 */
export function getInputTitle() {
  return elements.newTodoTitle.value.trim();
}

/**
 * Adds a new todo item to the UI list and updates the internal cache.
 *
 * This function creates a DOM element for the provided todo using the specified handlers,
 * appends it to the todo list, and then stores the todo in the internal cache.
 *
 * @param {object} todo - The todo item to be added.
 * @param {object} handlers - Callbacks for operations like editing, toggling, or deleting the todo.
 */
export function addTodoToList(todo, handlers) {
  const todoElement = createTodoItem(todo, handlers);
  elements.todoList.appendChild(todoElement);
  // 캐시 업데이트
  todosCache.push(todo);
}

/**
 * Displays a message to the user with animated transitions.
 *
 * This function updates the text content of the message container element with the provided message,
 * applies a "show" animation, and automatically hides the message after 3 seconds by initiating a "hide"
 * animation before resetting the container's state.
 *
 * @param {string} message - The text of the message to display.
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
