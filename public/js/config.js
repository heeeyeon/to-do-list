/**
 * 이 모듈은 애플리케이션 내에서 사용되는 다양한 설정 값들
 * (API 설정, HTTP 상태 코드, 에러 메시지, 에러 타입, 단축키 등)을 중앙에서 관리하는 구성 모듈입니다.
 * 이를 통해 전체 애플리케이션의 설정을 일관되게 유지하고, 유지보수 및 확장을 용이하게 합니다.
 */

/**
 * API 기본 설정 상수
 *
 * 이 객체는 API 서버와의 통신을 위한 기본 설정 정보를 담습니다.
 * 속성:
 *  - BASE_URL: API 서버의 기본 URL.
 *  - ENDPOINTS: 다양한 API 엔드포인트 경로를 포함한 객체.
 *
 * @type {Object}
 */
export const API_CONFIG = {
  // API 서버 기본 URL
  BASE_URL: 'http://localhost:3000',

  // API 엔드포인트 경로
  ENDPOINTS: {
    TODOS: '/todos',
  },
};

/**
 * HTTP 상태 코드 상수
 *
 * 이 객체는 API 응답에 사용되는 HTTP 상태 코드를 정의합니다.
 * 각 속성은 해당 상태 코드의 의미(예: 성공, 생성, 오류 등)를 나타냅니다.
 *
 * @type {Object}
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * 에러 메시지 상수
 *
 * 이 객체는 애플리케이션에서 발생할 수 있는 다양한 에러 상황에 대해
 * 사용자에게 제공할 메시지를 정의합니다.
 * 각 속성은 특정 에러 상황에 대응하는 안내 메시지를 포함합니다.
 *
 * @type {Object}
 */
export const ERROR_MESSAGES = {
  FETCH_FAILED: '할일 목록을 불러오는데 실패했습니다.',
  CREATE_FAILED: '새 할일을 생성하는데 실패했습니다.',
  UPDATE_FAILED: '할일을 수정하는데 실패했습니다.',
  DELETE_FAILED: '할일을 삭제하는데 실패했습니다.',
  EMPTY_TITLE: '할일 제목을 입력해주세요.',
  ITEM_NOT_FOUND: '해당 할일을 찾을 수 없습니다.',
  INVALID_RESPONSE: '서버로부터 잘못된 응답을 받았습니다.',
  NETWORK_ERROR: '네트워크 연결이 끊어졌습니다.',
  TIMEOUT_ERROR: '서버 응답 시간이 초과되었습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
  GENERIC_ERROR: '네트워크 문제로 할일을 생성하지 못했습니다.',
};

/**
 * 에러 타입 상수
 *
 * 이 객체는 발생 가능한 에러의 유형을 식별하기 위한 문자열 상수를 정의합니다.
 * 각 속성은 관련 에러 메시지와 일관되게 사용되어 에러 처리를 용이하게 합니다.
 *
 * @type {Object}
 */
export const ERROR_TYPES = {
  FETCH_FAILED: 'FETCH_FAILED',
  CREATE_FAILED: 'CREATE_FAILED',
  UPDATE_FAILED: 'UPDATE_FAILED',
  DELETE_FAILED: 'DELETE_FAILED',
  EMPTY_TITLE: 'EMPTY_TITLE',
  ITEM_NOT_FOUND: 'ITEM_NOT_FOUND',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  GENERIC_ERROR: 'GENERIC_ERROR',
};

/**
 * 단축키 설정 상수
 *
 * 이 객체는 애플리케이션 내 UI 상호작용을 위한 단축키 조합을 정의합니다.
 * 각 단축키는 활성화 여부, 조합할 키 등을 포함하여 사용자가 기능에 빠르게 접근할 수 있도록 합니다.
 *
 * @type {Object}
 */
export const SHORTCUTS = {
  CREATE_TODO: {
    ctrl: true,
    alt: true,
    key: 'n',
  },
};

/**
 * HTTP 메서드 상수
 * 이 객체는 RESTful API 호출 시 사용되는 HTTP 메서드를 정의합니다.
 * 각 메서드는 다음과 같은 역할을 수행합니다.
 * - GET: 데이터를 조회할 때 사용합니다.
 * - POST: 새로운 데이터를 생성할 때 사용합니다.
 * - PUT: 기존 데이터를 전체적으로 업데이트할 때 사용합니다.
 * - PATCH: 기존 데이터를 부분적으로 업데이트할 때 사용합니다.
 * - DELETE: 데이터를 삭제할 때 사용합니다.
 * @type {Object}
 */
export const HTTP_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};
