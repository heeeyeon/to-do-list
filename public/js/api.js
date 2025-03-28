/**
 * API 모듈 - Todo 항목에 대한 CRUD 작업을 위한 API 통신 함수를 제공합니다.
 * 이 모듈은 HTTP 요청 생성, 실행 및 결과 처리를 담당합니다.
 */
import { API_CONFIG, ERROR_MESSAGES, ERROR_TYPES, HTTP_METHOD } from './config.js';

/**
 * API 요청 구성 객체를 생성합니다.
 * 이 함수는 HTTP 요청에 필요한 옵션 객체를 생성하며, 주어진 HTTP 메서드와 선택적인 요청 본문 데이터를 기반으로 요청 설정을 구성합니다.
 *
 * @param {string} method - HTTP 메서드 (예: "GET", "POST", "PATCH", "DELETE")
 * @param {Object|null} body - 요청 본문 데이터. POST나 PATCH 요청 시 JSON 문자열로 변환되어 전송됩니다.
 *                              본문 데이터가 없는 경우 null을 전달할 수 있습니다.
 * @returns {Object} HTTP 요청 옵션 객체로, 메서드, 헤더, 및 선택적으로 본문(JSON 문자열 변환 포함)이 포함됩니다.
 * @throws {Error} JSON 문자열 변환에 실패할 경우 예외가 발생할 수 있습니다.
 */
const createRequestConfig = (method, body = null) => {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  return config;
};

/**
 * 지정된 URL로 API 요청을 실행하고 응답을 처리합니다.
 * 이 함수는 fetch API를 이용하여 HTTP 요청을 보내며, 응답이 정상(HTTP 2xx)일 경우 JSON 데이터로 변환합니다.
 * 네트워크 오류, 요청 중단(타임아웃) 또는 서버 오류 발생 시 적절한 예외를 던집니다.
 *
 * @param {string} url - 요청할 API 엔드포인트의 URL.
 * @param {Object} config - HTTP 요청의 구성 객체 (메서드, 헤더, 본문 포함).
 * @returns {Promise <any>} API 응답 데이터 (JSON 객체 또는 배열).
 * @throws {Error} 네트워크 오류, 타임아웃 또는 HTTP 오류 발생 시.
 */
const executeRequest = async (url, config) => {
  try {
    // TODO : 요청 타임아웃 구현
    // TODO : HTTP상태 코드에 따른 재시도 전략, 오류 처리 추가 구현
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    // 에러 타입 구분
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      error.name = 'NetworkError';
    } else if (error.name === 'AbortError') {
      error.name = 'TimeoutError';
    } else if (error.message.includes('HTTP error! status: 5')) {
      error.name = 'ServerError';
    }

    throw error;
  }
};

/**
 * 서버에서 할일 목록을 조회합니다.
 * 이 함수는 API를 호출하여 할일 목록 데이터를 배열 형식으로 받아옵니다.
 * 응답 데이터가 배열이 아닐 경우, 잘못된 응답으로 처리하여 예외를 발생시킵니다.
 *
 * @returns {Promise<Array>} 서버로부터 조회된 할일 항목들의 배열.
 * @throws {Error} API 요청 실패 또는 응답 데이터 형식 오류 시.
 */
export const fetchTodos = async () => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TODOS}`;
  const config = createRequestConfig(HTTP_METHOD.GET);

  const data = await executeRequest(url, config);

  if (!Array.isArray(data)) {
    throw new Error(ERROR_MESSAGES[ERROR_TYPES.INVALID_RESPONSE]);
  }

  return data;
};

/**
 * 새로운 할일 항목을 생성합니다.
 * 이 함수는 주어진 제목을 사용하여 새로운 할일을 생성하며, POST 요청을 통해 서버에 데이터를 전송합니다.
 *
 * @param {string} title - 생성할 할일 항목의 제목. 빈 문자열이거나 falsy 값이면 예외를 발생합니다.
 * @returns {Promise<Object>} 서버에서 생성된 할일 항목 객체를 반환합니다. (예: id, title, completed)
 * @throws {Error} 제목이 유효하지 않거나 API 요청 실패 시.
 */
export const createTodoItem = async title => {
  if (!title) {
    throw new Error(ERROR_MESSAGES[ERROR_TYPES.EMPTY_TITLE]);
  }

  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TODOS}`;
  const newTodo = {
    title,
    completed: false,
  };

  const config = createRequestConfig(HTTP_METHOD.POST, newTodo);
  return await executeRequest(url, config);
};

/**
 * 기존 할일 항목을 수정합니다.
 * 이 함수는 할일 항목의 고유 ID와 업데이트할 데이터를 받아, PATCH 요청을 통해 해당 항목을 업데이트합니다.
 * 지정된 ID를 가진 할일에 대해 부분 업데이트(PATCH)를 수행합니다.
 * 요청 본문에 업데이트 데이터를 포함하여 서버에 전송하며, 이 과정에서 네트워크 오류, 타임아웃 및 HTTP 상태 기반 오류가 발생할 수 있습니다.
 *
 * @param {string} id - 수정할 할일 항목의 고유 식별자.
 * @param {Object} updates - 할일 항목에 적용할 업데이트 객체 (예: title, completed).
 * @returns {Promise<Object>} 서버에서 갱신된 할일 항목 객체를 반환합니다.
 * @throws {Error} 유효하지 않은 ID, 업데이트 데이터 문제 또는 API 요청 실패 시.
 */
export const updateTodoItem = async (id, updates) => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TODOS}/${id}`;
  const config = createRequestConfig(HTTP_METHOD.PATCH, updates);

  return await executeRequest(url, config);
};

/**
 * 할일(Todo item)을 삭제합니다.
 *
 * 지정된 ID를 기반으로 DELETE 요청을 발송하여 해당 할일을 삭제합니다.
 * API 요청이 실패하거나 네트워크 오류, 타임아웃, 또는 HTTP 상태 기반 오류가 발생할 경우, 예외를 던집니다.
 *
 * @param {string} id - 삭제할 할일 항목의 고유 식별자(ID)
 * @returns {Promise<boolean>} 삭제가 성공한 경우 true가 반환됩니다.
 * @throws {Error} - API 요청 실패, 네트워크 오류, 타임아웃 또는 HTTP 상태 코드에 따른 오류 발생 시
 */
export const deleteTodoItem = async id => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TODOS}/${id}`;
  const config = createRequestConfig(HTTP_METHOD.DELETE);

  return await executeRequest(url, config);
};
