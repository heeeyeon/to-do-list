import { ERROR_MESSAGES } from './config.js';

/**
 * Handles and displays an error based on the provided error type.
 *
 * Logs an error message to the console with a prefix indicating the error type,
 * and displays an alert with a corresponding message retrieved from the error messages configuration.
 *
 * @param {Error} error - The error object encountered during the operation.
 * @param {string} errorType - A key representing the type of error, used to retrieve a user-friendly message.
 */
export function handleError(error, errorType) {
  console.error(`${errorType} 실패:`, error);
  alert(ERROR_MESSAGES[errorType]);
}

/**
 * Returns the first DOM element that matches the provided CSS selector.
 *
 * @param {string} selector - A CSS selector string to locate the element.
 * @returns {Element|null} The first matching element, or null if no match is found.
 */
export function $(selector) {
  return document.querySelector(selector);
}

/**
 * Selects all DOM elements that match the provided CSS selector.
 *
 * @param {string} selector - A CSS selector string.
 * @returns {NodeList} A list of matching DOM elements.
 */
export function $$(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Attaches an event listener to a DOM element or a collection of DOM elements.
 *
 * This function adds the specified event handler to a single element or iterates over a NodeList
 * to add the event handler to each element.
 *
 * @example
 * // Attaching an event listener to a single element:
 * addMultipleEventListeners(submitButton, 'click', handleSubmit);
 *
 * // Attaching an event listener to multiple elements:
 * addMultipleEventListeners(deleteButtons, 'click', handleDelete);
 *
 * @param {NodeList|Element} elements - The DOM element or NodeList of elements to which the event listener will be added.
 * @param {string} eventType - The type of event to listen for (e.g., 'click', 'submit', 'change').
 * @param {Function} handler - The callback function to invoke when the event is triggered.
 */
export function addMultipleEventListeners(elements, eventType, handler) {
  if (elements instanceof NodeList) {
    elements.forEach(element => element.addEventListener(eventType, handler));
  } else {
    elements.addEventListener(eventType, handler);
  }
}

/**
 * Creates a new DOM element with optional CSS class, text content, and click event listener.
 *
 * @param {string} tag - The tag name of the element to be created (e.g., 'div', 'span').
 * @param {Object} [options={}] - Optional settings for the created element.
 * @param {string} [options.className] - A CSS class to assign to the element.
 * @param {string} [options.text] - Text content to set for the element.
 * @param {Function} [options.onClick] - A function to attach as a click event listener.
 * @returns {HTMLElement} The newly created DOM element.
 */
export function createElement(tag, { className, text, onClick } = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  if (onClick) element.addEventListener('click', onClick);
  return element;
}
