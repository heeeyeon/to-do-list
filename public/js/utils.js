import { ERROR_MESSAGES } from './config.js';

/**
 * Handles an error by logging it with its type and displaying a corresponding user-friendly alert.
 *
 * The function logs an error message to the console that includes the provided error type. It then attempts to retrieve a user-friendly message
 * from the ERROR_MESSAGES mapping using the error type. If no specific message is found, it falls back to the error's own message or a default
 * generic error message before displaying it via an alert.
 *
 * @param {*} error - The error object that was caught.
 * @param {string} errorType - A key used to retrieve a specific error message from the configuration.
 */
export function handleError(error, errorType) {
  console.error(`${errorType} 실패:`, error);
  const message = ERROR_MESSAGES[errorType] || error.message || '알 수 없는 오류가 발생했습니다.';
  alert(message);
}

/**
 * Selects and returns the first DOM element that matches the provided CSS selector.
 *
 * @param {string} selector The CSS selector used to query the document.
 * @returns {Element|null} The first matching DOM element, or null if no match is found.
 */
export function $(selector) {
  return document.querySelector(selector);
}

/**
 * Retrieves all DOM elements that match the specified CSS selector.
 *
 * @param {string} selector - A valid CSS selector used to identify elements in the document.
 * @returns {NodeListOf<Element>} A NodeList containing all matching elements.
 */
export function $$(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Attaches an event listener to one or more DOM elements.
 *
 * If the provided elements is a NodeList, the listener is added to each element; if it is a single Element, the listener is added directly.
 * Logs a warning if no elements are provided or if the provided argument is not a valid NodeList or Element.
 *
 * @param {NodeList|Element} elements - The target element(s) to which the event listener is added.
 * @param {string} eventType - The type of event (e.g., 'click', 'submit', 'change').
 * @param {Function} handler - The callback function to execute when the event occurs.
 *
 * @example
 * // Attach an event listener to a single element
 * addMultipleEventListeners(submitButton, 'click', handleSubmit);
 *
 * @example
 * // Attach an event listener to multiple elements
 * addMultipleEventListeners(deleteButtons, 'click', handleDelete);
 */
export function addMultipleEventListeners(elements, eventType, handler) {
  if (!elements) {
    console.warn('addMultipleEventListeners: elements가 제공되지 않았습니다.');
    return;
  }
  if (elements instanceof NodeList) {
    elements.forEach(element => element.addEventListener(eventType, handler));
  } else {
    if (!(elements instanceof Element)) {
      console.warn('addMultipleEventListeners: elements가 유효하지 않은 타입입니다.');
      return;
    }
    elements.addEventListener(eventType, handler);
  }
}

/**
 * Creates a new DOM element with the specified tag.
 *
 * Optionally assigns a CSS class name, text content, and a click event handler if provided.
 *
 * @param {string} tag - The HTML tag name for the new element.
 * @param {Object} [options] - Optional properties for the element.
 * @param {string} [options.className] - A CSS class name to assign to the element.
 * @param {string} [options.text] - Text content to set for the element.
 * @param {Function} [options.onClick] - A callback function to attach as a click event listener.
 * @returns {HTMLElement} The newly created DOM element.
 */
export function createElement(tag, { className, text, onClick } = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  if (onClick) element.addEventListener('click', onClick);
  return element;
}
