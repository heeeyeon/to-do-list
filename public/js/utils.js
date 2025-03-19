import { ERROR_MESSAGES } from './config.js';

// 에러 처리 유틸리티
export function handleError(error, errorType) {
  console.error(`${errorType} 실패:`, error);
  const message = ERROR_MESSAGES[errorType] || error.message || '알 수 없는 오류가 발생했습니다.';
  alert(message);
}

// DOM 요소 선택 유틸리티
export function $(selector) {
  return document.querySelector(selector);
}

export function $$(selector) {
  return document.querySelectorAll(selector);
}

/**
 * 여러 DOM 요소에 이벤트 리스너를 추가하는 유틸리티 함수
 * @param {NodeList|Element} elements - 이벤트 리스너를 추가할 요소들 (NodeList 또는 단일 Element)
 * @param {string} eventType - 이벤트 타입 (예: 'click', 'submit', 'change' 등)
 * @param {Function} handler - 이벤트 발생 시 실행할 콜백 함수
 * @example
 * // 단일 요소에 이벤트 리스너 추가
 * addMultipleEventListeners(submitButton, 'click', handleSubmit);
 *
 * // 여러 요소에 이벤트 리스너 추가
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

// DOM 엘리먼트 생성 유틸리티
export function createElement(tag, { className, text, onClick } = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  if (onClick) element.addEventListener('click', onClick);
  return element;
}
