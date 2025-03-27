import { ERROR_MESSAGES } from './config.js';

/**
 * Handles an error by logging it with its type and displaying a corresponding user-friendly alert message.
 *
 * This function logs an error message that includes the provided error type and the error object to the console.
 * It then retrieves a user-friendly message from the ERROR_MESSAGES configuration mapping using the error type.
 * If no corresponding message is found, it falls back to the error object's message or a default message before
 * displaying it in an alert dialog.
 *
 * @param {*} error - The caught error object.
 * @param {string} errorType - The key used to look up a specific error message in the configuration.
 */
export function handleError(error, errorType) {
  console.error(`${errorType} 실패:`, error);
  const message = ERROR_MESSAGES[errorType] || error.message || '알 수 없는 오류가 발생했습니다.';
  alert(message);
}

/**
 * Returns the first DOM element that matches the given CSS selector.
 *
 * @param {string} selector - A valid CSS selector for querying the document.
 * @returns {Element|null} The first matching DOM element, or null if no element matches.
 */
export function $(selector) {
  return document.querySelector(selector);
}

/**
 * Selects and returns all DOM elements that match the specified CSS selector.
 *
 * @param {string} selector - A valid CSS selector used to find elements within the document.
 * @returns {NodeListOf<Element>} A NodeList containing all matching DOM elements.
 */

export function $$(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Adds an event listener to one or more DOM elements.
 *
 * If the provided elements parameter is a collection (NodeList, HTMLCollection, or Array), the event listener is added to each element.
 * If a single DOM element is provided, the event listener is attached directly.
 * Logs a warning if the elements parameter is null or not a valid DOM element type.
 *
 * @param {(NodeList|HTMLCollection|Element|Array)} elements - The target element(s) for the event listener.
 * @param {string} eventType - The type of event to listen for (e.g., 'click', 'submit', 'change').
 * @param {Function} handler - The callback function to execute when the event is triggered.
 *
 * @example
 * // Attach an event listener to a single element:
 * addMultipleEventListeners(submitButton, 'click', handleSubmit);
 *
 * @example
 * // Attach an event listener to multiple elements:
 * addMultipleEventListeners(deleteButtons, 'click', handleDelete);
 */
export function addMultipleEventListeners(elements, eventType, handler) {
  if (!elements) {
    console.warn('addMultipleEventListeners: elements가 제공되지 않았습니다.');
    return;
  }
  if (
    elements instanceof NodeList ||
    elements instanceof HTMLCollection ||
    Array.isArray(elements)
  ) {
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
 * Creates a new DOM element using the specified HTML tag.
 *
 * Optionally applies a CSS class name, sets text content, and attaches a click event listener to the element.
 *
 * @param {string} tag - The HTML tag name for the new element.
 * @param {Object} [options] - An optional object containing properties for the element.
 * @param {string} [options.className] - The CSS class name to assign to the element.
 * @param {string} [options.text] - The text content to set on the element.
 * @param {Function} [options.onClick] - A callback to attach as a click event listener.
 * @returns {HTMLElement} The newly created DOM element.
 */
export function createElement(tag, { className, text, onClick } = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  if (onClick) element.addEventListener('click', onClick);
  return element;
}
