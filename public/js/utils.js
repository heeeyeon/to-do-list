/**
 * 이 모듈은 DOM 조작 및 오류 처리를 위한 다양한 유틸리티 함수를 제공합니다.
 * 모든 기능은 한국어로 완전하게 문서화되어 있습니다.
 */

import DOMPurify from 'dompurify';
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
 * 지정된 태그 이름에 해당하는 새로운 DOM 요소를 생성하는 유틸리티 함수입니다.
 * 이 함수는 Open/Closed 원칙을 지키도록 확장성과 유지보수성을 고려하여 구현되었습니다.
 *
 * @param {string} tag - 생성할 DOM 요소의 태그 이름입니다. 예: 'div', 'span', 'button' 등.
 * @param {Object} [options] - 요소에 적용할 선택적 속성들을 포함한 객체입니다.
 * @param {string} [options.className] - 요소에 적용할 CSS 클래스입니다.
 * @param {string} [options.id] - 요소의 ID입니다.
 * @param {string} [options.text] - 요소의 텍스트 노드 내용입니다. `textContent`로 처리됩니다.
 * @param {string} [options.html] - 요소의 HTML 콘텐츠입니다. `innerHTML`로 처리됩니다.
 *   예: `DOMPurify.sanitize(html)` — 반드시 신뢰할 수 없는 입력에 대해 적용하세요.
 *   가능하면 `text` 옵션을 사용하세요.
 *   TODO: 현재는 DOMPurify로 html을 sanitize하고 있으므로 안전하지만,
 *       API 명확성을 위해 html 대신 htmlSafe 키를 도입하여 신뢰된 HTML임을 명시하는 방향으로 리팩토링 고려.
 *       이로써 sanitize 여부를 API 설계 수준에서 강제 가능해짐.
 * @param {Object.<string, string>} [options.attributes] - 요소에 설정할 추가 속성들입니다. data-*, aria-*, role 등 포함.
 * @param {(Node|string|Object|Array<Node|string|Object>)} [options.children] - 자식 노드, 텍스트, 또는 또 다른 createElement 옵션 객체의 배열입니다.
 * @param {Object.<string, Function>} [options.onEvent] - 사용자 정의 이벤트 핸들러 객체입니다. 예: { click: fn, blur: fn }
 * @param {...Object} [rest] - 기타 이벤트 핸들러 속성입니다.
 *   속성명이 'on'으로 시작하고 함수인 경우 이벤트로 자동 등록됩니다.
 *   예: `...rest` 문법으로 onClick, onInput 등의 명시되지 않은 나머지 이벤트를 자동으로 인식하여 addEventListener로 연결합니다.
 * @param {number} [options.depth=0] - 재귀 호출의 현재 깊이를 나타냅니다 (내부 사용용).
 * @param {number} [options.maxDepth=3] - 생성 가능한 최대 재귀 깊이입니다. 기본값은 3입니다.
 *   ⚠️ 너무 깊은 재귀 구조를 방지하기 위한 안전장치입니다.
 *
 * @returns {HTMLElement} 생성된 DOM 요소를 반환합니다.
 *
 * @example
 * const item = createElement('li', {
 *   className: 'todo-item',
 *   children: [
 *     createElement('span', { text: '할 일' }),
 *     {
 *       tag: 'button',
 *       text: '삭제',
 *       onClick: () => alert('삭제됨')
 *     }
 *   ]
 * });
 * @example
 * const input = createElement('input', {
 *   attributes: { type: 'text', placeholder: '이름 입력' },
 *   onEvent: {
 *     focus: () => console.log('입력 시작'),
 *     blur: () => console.log('입력 종료')
 *   }
 * });
 */
export function createElement(tag, options = {}) {
  if (typeof tag !== 'string') {
    throw new TypeError(`Expected 'tag' to be a string, but received ${typeof tag}`);
  }

  const {
    className,
    id,
    text,
    html,
    attributes,
    children,
    onEvent = {},
    depth = 0,
    maxDepth = 3,
    ...rest
  } = options;

  if (depth > maxDepth) {
    throw new Error(`Maximum recursive depth (${maxDepth}) exceeded.`);
  }
  const element = document.createElement(tag);

  if (className) element.className = className;
  if (id) element.id = id;
  if (text) element.textContent = text;
  if (html) element.innerHTML = DOMPurify.sanitize(html);

  // ✅ 속성 처리 (data-*, aria-*, role 등)
  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
  }

  // ✅ 자식 요소 처리 - createElement를 재귀적으로 호출하여 트리 구조 생성 가능
  if (children) {
    const appendChild = child => {
      if (child == null) return; // null 또는 undefined인 경우 무시
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      } else if (typeof child === 'object' && child.tag) {
        // createElement를 재귀적으로 호출하여 중첩된 자식 생성
        const childOptions = { ...child, depth: depth + 1, maxDepth };
        element.appendChild(createElement(child.tag, childOptions));
      } else if (typeof child === 'object') {
        console.warn('자식 요소 객체에 필수 속성 `tag`가 누락되었습니다:', child);
      }
    };

    if (Array.isArray(children)) {
      children.forEach(appendChild);
    } else {
      appendChild(children);
    }
  }

  // ✅ 명시적으로 등록된 이벤트 핸들러 자동 처리 (ex. onClick, onInput 등)
  for (const [key, value] of Object.entries(rest)) {
    if (key.startsWith('on') && typeof value === 'function') {
      const event = key.slice(2).toLowerCase(); // onClick → click
      element.addEventListener(event, value);
    }
  }

  // ✅ onEvent 객체 기반 동적 이벤트 처리
  for (const [eventName, handler] of Object.entries(onEvent)) {
    if (typeof handler === 'function') {
      element.addEventListener(eventName, handler);
    }
  }

  return element;
}
