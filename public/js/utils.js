/**
 * 이 모듈은 DOM 조작과 오류 처리를 위한 다양한 유틸리티 함수를 제공합니다.
 * 모든 함수와 문서는 한국어로 작성되었으며, JSDoc 스타일 주석을 사용하여 자세히 문서화되어 있습니다.
 */
import { ERROR_MESSAGES } from './config.js';

/**
 * 오류 처리를 위한 함수.
 *
 * 이 함수는 주어진 오류 객체와 오류 타입을 기반으로 콘솔에 오류를 기록하고,
 * ERROR_MESSAGES 매핑에서 해당 오류 타입에 맞는 사용자 친화적 메시지를 검색하여
 * alert 창을 통해 사용자에게 전달합니다.
 *
 * @param {*} error - 발생한 오류 객체.
 * @param {string} errorType - ERROR_MESSAGES 매핑에서 오류 메시지를 검색하기 위한 키.
 * @returns {void} 반환값이 없습니다.
 */
export function handleError(error, errorType) {
  console.error(`${errorType} 실패:`, error);
  const message = ERROR_MESSAGES[errorType] || error.message || '알 수 없는 오류가 발생했습니다.';
  alert(message);
}

/**
 * CSS 선택자에 맞는 첫 번째 DOM 요소를 검색하는 함수.
 *
 * 제공된 선택자를 이용하여 document.querySelector를 호출하고,
 * 일치하는 DOM 요소가 있으면 해당 요소를 반환하며, 그렇지 않을 경우 null을 반환합니다.
 *
 * @param {string} selector - 검색할 CSS 선택자.
 * @returns {Element|null} 검색된 DOM 요소 또는 해당 요소가 없을 경우 null.
 */
export function $(selector) {
  return document.querySelector(selector);
}

/**
 * CSS 선택자에 해당하는 모든 DOM 요소를 검색하는 함수.
 *
 * document.querySelectorAll 메서드를 사용하여,
 * 선택자와 일치하는 모든 DOM 요소들을 NodeList 형태로 반환합니다.
 *
 * @param {string} selector - 검색할 CSS 선택자.
 * @returns {NodeListOf <Element>} 선택자와 일치하는 모든 DOM 요소들을 포함하는 NodeList.
 */
export function $$(selector) {
  return document.querySelectorAll(selector);
}

/**
 * 하나 또는 그 이상의 DOM 요소에 지정된 이벤트 리스너를 추가하는 함수.
 *
 * 전달된 요소가 NodeList, HTMLCollection, 배열 또는 단일 Element인 경우,
 * 각 요소에 대해 이벤트 리스너가 등록됩니다.
 * 요소가 유효하지 않거나 제공되지 않은 경우, 콘솔에 경고 메시지가 출력됩니다.
 *
 * @param {(NodeList|HTMLCollection|Array|Element)} elements - 이벤트 리스너를 추가할 대상 DOM 요소(들).
 * @param {string} eventType - 추가할 이벤트의 종류 (예: 'click', 'submit', 'change').
 * @param {Function} handler - 이벤트 발생 시 실행할 콜백 함수.
 * @returns {void} 반환값이 없습니다.
 *
 * @example
 * // 단일 DOM 요소에 이벤트 리스너 추가
 * addMultipleEventListeners(button, 'click', handleClick);
 *
 * @example
 * // 여러 DOM 요소에 이벤트 리스너 추가
 * addMultipleEventListeners(buttons, 'click', handleClick);
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
 * 주어진 HTML 태그명을 사용하여 새로운 DOM 요소를 생성하는 함수.
 *
 * 선택적으로, options 객체를 통해 CSS 클래스 이름, 텍스트 내용 및 클릭 이벤트 핸들러를 설정할 수 있습니다.
 * - options.className이 제공되면 생성된 요소에 해당 클래스가 추가됩니다.
 * - options.text가 제공되면 생성된 요소의 textContent가 해당 텍스트로 설정됩니다.
 * - options.onClick이 제공되면 'click' 이벤트 발생 시 해당 함수가 실행됩니다.
 *
 * @param {string} tag - 새로 생성할 DOM 요소의 HTML 태그명.
 * @param {Object} [options] - 요소의 선택적 속성을 포함하는 객체.
 * @param {string} [options.className] - 생성된 요소에 추가할 CSS 클래스 이름.
 * @param {string} [options.text] - 생성된 요소의 텍스트 내용.
 * @param {Function} [options.onClick] - 생성된 요소에 추가할 클릭 이벤트 리스너.
 * @returns {HTMLElement} 새로 생성된 DOM 요소.
 */
export function createElement(tag, { className, text, onClick } = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  if (onClick) element.addEventListener('click', onClick);
  return element;
}

 * 2. options 객체의 className, text, onClick 프로퍼티가 제공되면 이를 각각 CSS 클래스, 텍스트 내용, 클릭 이벤트 리스너로 적용합니다.
 *
 * @param {string} tag - 생성할 HTML 요소의 태그명 (예: 'div', 'span', 'button').
 * @param {Object} [options={}] - 선택적 속성들을 포함하는 객체.
 * @param {string} [options.className] - 생성된 요소에 할당할 CSS 클래스명.
 * @param {string} [options.text] - 생성된 요소에 설정할 텍스트 내용.
 * @param {Function} [options.onClick] - 생성된 요소에 추가할 클릭 이벤트 리스너.
 *
 * @returns {HTMLElement} 생성된 DOM 요소를 반환합니다.
 *
 * @sideeffect - 옵션에 따라 DOM 요소에 CSS 클래스 또는 이벤트 핸들러가 추가될 수 있습니다.
 */
export function createElement(tag, { className, text, onClick } = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  if (onClick) element.addEventListener('click', onClick);
  return element;
}
