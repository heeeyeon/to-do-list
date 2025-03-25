import { API_CONFIG, ERROR_MESSAGES, ERROR_TYPES, HTTP_METHOD } from './config.js';

/**
 * API 요청에 필요한 설정을 생성하는 함수
 * @param {string} method - HTTP 메서드 (GET, POST, PATCH, DELETE 등)
 * @param {Object|null} body - 요청 본문 데이터 (POST, PATCH 요청의 경우)
 * @returns {Object} 가져오기 API에 전달할 구성 객체
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
 * API 요청을 실행하고 응답을 검증하는 함수
 * @param {string} url - API 엔드포인트 URL
 * @param {Object} config - 가져오기 API에 전달할 구성 객체
 * @returns {Promise <any>} API 응답 데이터
 * @throws {Error} API 요청 실패 시 에러 발생
 */

const executeRequest = async (url, config) => {
  try {
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
 * 서버에서 할일 목록을 조회하는 함수
 * @returns {Promise<Array>} 할일 목록 배열
 * @throws {Error} 목록 조회 실패 시 에러 발생
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
 * 새로운 할일을 생성하는 함수
 * @param {string} title - 생성할 할일의 제목
 * @returns {Promise<Object>} 생성된 할일 객체
 * @throws {Error} 제목이 비어있거나 생성 실패 시 에러 발생
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
 * 기존 할일을 수정하는 함수
 * @param {string} id - 수정할 할일의 ID
 * @param {Object} updates - 수정할 데이터 객체
 * @returns {Promise<Object>} 수정된 할일 객체
 * @throws {Error} 수정 실패 시 에러 발생
 */
export const updateTodoItem = async (id, updates) => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TODOS}/${id}`;
  const config = createRequestConfig(HTTP_METHOD.PATCH, updates);

  return await executeRequest(url, config);
};

/**
 * 할일을 삭제하는 함수
 * @param {string} id - 삭제할 할일의 ID
 * @returns {Promise<boolean>} 삭제 성공 여부
 * @throws {Error} 삭제 실패 시 에러 발생
 */
export const deleteTodoItem = async id => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TODOS}/${id}`;
  const config = createRequestConfig(HTTP_METHOD.DELETE);

  return await executeRequest(url, config);
};
