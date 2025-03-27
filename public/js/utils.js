/**
 * 이 모듈은 DOM 조작 및 오류 처리를 위한 다양한 유틸리티 함수를 제공합니다.
 * 모든 기능은 한국어로 완전하게 문서화되어 있습니다.
 */

import { ERROR_MESSAGES } from './config.js';

/**
 * 오류 처리를 수행하는 함수입니다.
 * 주어진 오류 객체와 오류 유형을 입력받아,
 * 콘솔에 오류 정보를 출력하고 ERROR_MESSAGES에서 매핑된 사용자 메시지를 찾아 알림창을 표시합니다.
 *
 * @param {*} error - 처리할 오류 객체로, 오류에 관한 상세 정보를 포함합니다.
 * @param {string} errorType - 오류 메시지를 식별하기 위한 문자열이며, 이 값을 통해 ERROR_MESSAGES에서 사용자 친화적 메시지를 검색합니다.
 * @returns {void} 반환값이 없습니다.
 */
export function handleError(error, errorType) {
  console.error(`${errorType} 실패:`, error);
  const message = ERROR_MESSAGES[errorType] || error.message || '알 수 없는 오류가 발생했습니다.';
  alert(message);
}

/**
 * 주어진 CSS 선택자와 일치하는 첫 번째 DOM 요소를 검색하여 반환합니다.
 *
 * 이 함수는 document.querySelector()를 사용하여 DOM 내에서 해당 요소를 찾습니다.
 *
 * @param {string} selector - 검색할 요소를 지정하는 CSS 선택자 문자열입니다.
 * @returns {Element|null} 선택자에 해당하는 첫 번째 DOM 요소를 반환하며, 해당 요소가 없을 경우 null을 반환합니다.
 */
export function $(selector) {
  return document.querySelector(selector);
}

/**
 * 주어진 CSS 선택자와 일치하는 모든 DOM 요소를 검색하여 NodeList로 반환합니다.
 *
 * 이 함수는 document.querySelectorAll()을 사용하여 문서 내의 모든 해당 요소를 선택합니다.
 *
 * @param {string} selector - 검색할 요소들을 지정하는 CSS 선택자 문자열입니다.
 * @returns {NodeListOf <Element>} 선택된 모든 DOM 요소들을 포함하는 NodeList를 반환합니다.
 */
export function $$(selector) {
  return document.querySelectorAll(selector);
}

/**
 * 하나 이상의 DOM 요소에 지정된 이벤트 리스너를 추가하는 함수입니다.
 *
 * 이 함수는 이벤트 대상이 단일 DOM 요소인지 또는 NodeList, HTMLCollection, 혹은 배열 형태인지 확인한 후,
 * 각 요소에 지정된 이벤트 유형과 핸들러를 적용합니다.
 * 유효하지 않은 요소가 전달되는 경우, 콘솔에 경고 메시지를 출력합니다.
 *
 * @param {Element|NodeList|HTMLCollection|Array<Element>} elements - 이벤트 리스너를 추가할 DOM 요소 또는 요소들의 컬렉션입니다.
 * @param {string} eventType - 추가할 이벤트 이름으로, 예를 들어 'click', 'submit', 'change' 등이 있습니다.
 * @param {Function} handler - 이벤트 발생 시 호출할 콜백 함수입니다.
 * @returns {void} 반환값이 없습니다.
 *
 * @example
 * // 단일 DOM 요소에 이벤트 리스너 추가
 * addMultipleEventListeners(document.getElementById('submitButton'), 'click', handleSubmit);
 *
 * @example
 * // 여러 DOM 요소에 이벤트 리스너 추가
 * const buttons = document.querySelectorAll('.deleteButton');
 * addMultipleEventListeners(buttons, 'click', handleDelete);
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
 * 지정된 태그 이름에 해당하는 새로운 DOM 요소를 생성하는 함수입니다.
 *
 * 이 함수는 선택적으로 요소에 CSS 클래스, 텍스트 내용, 그리고 'click' 이벤트 핸들러를 추가할 수 있습니다.
 *
 * @param {string} tag - 생성할 DOM 요소의 HTML 태그명을 나타내는 문자열입니다.
 * @param {Object} [options] - DOM 요소에 적용할 선택적 속성들을 포함하는 객체입니다.
 * @param {string} [options.className] - 생성된 요소에 적용할 CSS 클래스 이름입니다.
 * @param {string} [options.text] - 생성된 요소의 텍스트 콘텐츠입니다.
 * @param {Function} [options.onClick] - 생성된 요소에 추가할 'click' 이벤트 핸들러 함수입니다.
 * @returns {HTMLElement} 생성된 DOM 요소를 반환합니다.
 */
export function createElement(tag, { className, text, onClick } = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  if (onClick) element.addEventListener('click', onClick);
  return element;
}

 * @param {string} tag - 새로 생성할 DOM 요소의 HTML 태그명입니다.
 * @param {Object} [options] - 생성된 요소에 대해 설정할 선택적 속성들을 담은 객체입니다.
 * @param {string} [options.className] - 새 요소에 적용할 CSS 클래스 이름입니다.
 * @param {string} [options.text] - 새 요소에 설정할 텍스트 내용입니다.
 * @param {Function} [options.onClick] - 새 요소에 추가할 클릭 이벤트 리스너 함수입니다.
 *
 * @returns {HTMLElement} 새롭게 생성된 DOM 요소를 반환합니다.
 *
 * @sideeffect 새로운 DOM 요소가 생성되며, 옵션에 따라 이벤트 리스너가 추가될 수 있습니다.
 */
export function createElement(tag, { className, text, onClick } = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  if (onClick) element.addEventListener('click', onClick);
  return element;
}
