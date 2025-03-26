import { ERROR_MESSAGES } from './config.js';

/**
 * 오류를 처리합니다. 오류 유형을 콘솔에 기록하고, 이에 맞는 사용자 친화적 경고 메시지를 표시합니다.
 *
 * 이 함수는 제공된 오류 유형을 포함하는 오류 메시지를 콘솔에 출력한 후,
 * ERROR_MESSAGES 매핑에서 해당 오류 유형에 맞는 사용자 친화적 메시지를 검색합니다.
 * 특정 메시지가 없을 경우, 오류 객체의 메시지 또는 기본 오류 메시지를 사용하여 알림창에 표시합니다.
 *
 * @param {*} error - 포착된 오류 객체.
 * @param {string} errorType - 구성에서 특정 오류 메시지를 검색하기 위한 키.
 */
export function handleError(error, errorType) {
  console.error(`${errorType} 실패:`, error);
  const message = ERROR_MESSAGES[errorType] || error.message || '알 수 없는 오류가 발생했습니다.';
  alert(message);
}

/**
 * 제공된 CSS 선택자와 일치하는 첫 번째 DOM 요소를 찾아 반환합니다.
 *
 * @param {string} selector - 문서를 쿼리하기 위한 CSS 선택자.
 * @returns {Element|null} 일치하는 첫 번째 DOM 요소 또는 요소가 없으면 null을 반환합니다.
 */
export function $(selector) {
  return document.querySelector(selector);
}

/**
 * 지정된 CSS 선택자와 일치하는 모든 DOM 요소를 선택하여 반환합니다.
 *
 * @param {string} selector - 문서 내에서 요소를 찾기 위한 유효한 CSS 선택자.
 * @returns {NodeListOf <Element>} 일치하는 모든 DOM 요소를 포함하는 NodeList를 반환합니다.
 */

export function $$(selector) {
  return document.querySelectorAll(selector);
}

/**
 * 하나 이상의 DOM 요소에 이벤트 리스너를 추가합니다.
 *
 * 제공된 요소가 NodeList인 경우, 각 요소에 이벤트 리스너가 추가됩니다.
 * 단일 Element인 경우 해당 요소에 직접 이벤트 리스너가 추가됩니다.
 * 요소가 제공되지 않거나 유효하지 않은 경우, 경고 메시지를 콘솔에 출력합니다.
 *
 * @param {NodeList|Element} elements - 이벤트 리스너를 추가할 대상 DOM 요소들.
 * @param {string} eventType - 추가할 이벤트의 종류 (예: 'click', 'submit', 'change').
 * @param {Function} handler - 이벤트 발생 시 실행할 콜백 함수.
 *
 * @example
 * // 단일 요소에 이벤트 리스너 추가 예시
 * addMultipleEventListeners(submitButton, 'click', handleSubmit);
 *
 * @example
 * // 여러 요소에 이벤트 리스너 추가 예시
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
 * 지정된 HTML 태그명을 사용하여 새로운 DOM 요소를 생성합니다.
 *
 * 선택적으로, 해당 요소에 CSS 클래스 이름, 텍스트 내용, 클릭 이벤트 핸들러를 설정할 수 있습니다.
 *
 * @param {string} tag - 새로 생성할 DOM 요소의 HTML 태그명.
 * @param {Object} [options] - 요소의 선택적 속성들을 포함하는 객체입니다.
 * @param {string} [options.className] - 요소에 적용할 CSS 클래스 이름.
 * @param {string} [options.text] - 요소에 설정할 텍스트 내용.
 * @param {Function} [options.onClick] - 클릭 이벤트 리스너로 사용할 콜백 함수.
 * @returns {HTMLElement} 새롭게 생성된 DOM 요소를 반환합니다.
 */
export function createElement(tag, { className, text, onClick } = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  if (onClick) element.addEventListener('click', onClick);
  return element;
}
