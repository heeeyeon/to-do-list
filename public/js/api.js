/**
 * API 모듈 - Todo 항목에 대한 CRUD 작업을 위한 API 통신 함수를 제공합니다.
 * 이 모듈은 HTTP 요청 생성, 실행 및 결과 처리를 담당합니다.
 */
import { API_CONFIG, ERROR_MESSAGES, ERROR_TYPES, HTTP_METHOD } from './config.js';

/**
 * API 요청에 필요한 설정을 생성하는 함수입니다.
 * 주어진 HTTP 메서드와 요청 본문 데이터를 사용하여 fetch 함수 호출에 사용할 설정 객체를 생성합니다.
 *
 * @param {string} method - HTTP 메서드 (GET, POST, PATCH, DELETE 등)
 * @param {Object|null} body - 요청 본문 데이터. POST 및 PATCH 요청 시 사용됩니다.
 * @returns {Object} HTTP 요청에 사용될 설정 객체. body가 제공되면 JSON 문자열로 포함됩니다.
 * @throws 없음 - 이 함수는 입력값에 대해 별도의 검증이나 예외 처리를 하지 않습니다.
 */
const createRequestConfig = (method, body = null) = > {
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
 * API 요청을 실행하고 응답의 상태를 검증하는 함수입니다.
 * 주어진 URL과 설정 객체를 사용하여 HTTP 요청을 전송하고, 응답을 JSON 형태로 반환합니다.
 * 응답의 상태 코드가 200~299 범위에 있지 않거나, 네트워크, 타임아웃, 서버 오류가 발생하면 에러를 던집니다.
 *
 * @param {string} url - 요청을 보낼 API 엔드포인트 URL
 * @param {Object} config - HTTP 요청에 사용될 설정 객체 (메서드, 헤더 및 선택적 본문 포함)
 * @returns {Promise <any>} API 응답 데이터를 JSON 형태로 반환합니다.
 * @throws {Error} HTTP 상태 코드가 정상 범위가 아니거나 네트워크, 타임아웃, 서버 오류 발생 시 에러를 던집니다.
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
 * 서버에서 할일 목록을 조회하는 함수입니다.
 * API_CONFIG의 기본 URL과 할일 엔드포인트를 결합하여 API 요청을 전송하고,
 * 응답 데이터를 배열로 반환합니다. 응답 데이터가 배열이 아닐 경우, INVALID_RESPONSE 오류 메시지에 따라 에러가 발생합니다.
 *
 * @returns {Promise<Array>} 할일 목록 배열을 반환합니다.
 * @throws {Error} API 요청 실패 또는 반환된 데이터 형식이 올바르지 않을 경우 에러를 던집니다.
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
 * 새로운 할일 항목을 생성하는 함수입니다.
 * 주어진 제목을 사용하여 기본 상태(completed: false)의 할일 객체를 생성한 후, 서버에 POST 요청을 전송합니다.
 * 제목이 제공되지 않으면 EMPTY_TITLE 오류 메시지에 따른 에러가 발생합니다.
 *
 * @param {string} title - 생성할 할일의 제목 (빈 제목은 허용되지 않음).
 * @returns {Promise<Object>} 서버로부터 반환받은 생성된 할일 객체.
 * @throws {Error} 제목이 없거나, API 요청 과정에서 실패할 경우 에러를 던집니다.
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
 * 기존 할일 항목을 수정하는 함수입니다.
 * 주어진 ID를 사용하여 해당 할일 항목을 찾아 업데이트 객체를 적용한 후,
 * PATCH 요청을 통해 수정 사항을 서버에 전달하고, 수정된 할일 객체를 반환받습니다.
 *
 * @param {string} id - 수정할 할일 항목의 고유 ID입니다.
 * @param {Object} updates - 변경할 데이터를 담은 객체입니다.
 * @returns {Promise<Object>} 서버로부터 반환받은 수정된 할일 객체.
 * @throws {Error} API 요청 실패 또는 수정 과정에서 에러 발생 시 에러를 던집니다.
 */
export const updateTodoItem = async (id, updates) => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TODOS}/${id}`;
  const config = createRequestConfig(HTTP_METHOD.PATCH, updates);

  return await executeRequest(url, config);
};

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
 * 기존 Todo 항목을 수정하는 함수입니다.
 * 지정된 ID와 수정 데이터를 사용하여 PATCH 요청을 실행하고,
 * 수정된 Todo 항목 객체를 반환합니다.
 *
 * @param {string} id - 수정할 Todo 항목의 고유 ID
 * @param {Object} updates - 업데이트할 데이터 객체 (예: { title, completed })
 * @returns {Promise<Object>} 수정된 Todo 항목 객체
 * @throws {Error} 
 *   - API 요청 실패 시 (네트워크 오류, 타임아웃, 서버 오류 등)
 */
export const updateTodoItem = async (id, updates) => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TODOS}/${id}`;
  const config = createRequestConfig(HTTP_METHOD.PATCH, updates);

  return await executeRequest(url, config);
};

/**
 * Todo 항목을 삭제하는 함수입니다.
 * 주어진 Todo ID를 사용하여 DELETE 요청을 전송하며,
 * 삭제 성공 여부를 반환합니다.
 *
 * @param {string} id - 삭제할 Todo 항목의 고유 ID
 * @returns {Promise<boolean>} 삭제 성공 시 true 반환 (실패 시 에러 발생)
 * @throws {Error} 
 *   - API 요청 실패 시 (네트워크, 타임아웃, 서버 오류 등)
 */
export const deleteTodoItem = async id => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TODOS}/${id}`;
  const config = createRequestConfig(HTTP_METHOD.DELETE);

  return await executeRequest(url, config);
};

 * @throws {Error} API 요청 실패 시 에러 발생
 *
 * @description
 * 이 함수는 특정 Todo 항목의 식별자와 업데이트 데이터를 기반으로 PATCH 요청을 보내,
 * 해당 Todo 항목의 데이터를 수정합니다.
 */
export const updateTodoItem = async (id, updates) => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TODOS}/${id}`;
  const config = createRequestConfig(HTTP_METHOD.PATCH, updates);

  return await executeRequest(url, config);
};

/**
 * 할일을 삭제하는 함수
 *
 * @param {string} id - 삭제할 Todo 항목의 ID
 * @returns {Promise<boolean>} API 요청 결과에 따른 삭제 성공 여부 (true: 삭제 성공)
 * @throws {Error} API 요청 실패 시 에러 발생
 *
 * @description
 * 이 함수는 특정 Todo 항목의 ID를 기반으로 DELETE 요청을 보내,
 * 해당 항목을 서버에서 삭제하는 기능을 수행합니다.
 */
export const deleteTodoItem = async id => {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TODOS}/${id}`;
  const config = createRequestConfig(HTTP_METHOD.DELETE);
  
  return await executeRequest(url, config);
};
