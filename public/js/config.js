/**
 * 구성 모듈 (Configuration Module)
 * 이 파일은 애플리케이션 전반에 걸친 설정값들을 중앙 집중식으로 관리합니다.
 * 여기에는 API 호출 관련 기본 설정, HTTP 응답 상태 코드, 에러 메시지, 에러 타입 및 UI 단축키 설정이 포함됩니다.
 * 각 설정 상수는 최신 시스템 요구사항을 반영하여 명확한 한글 주석과 함께 정의되어 있습니다.
 *
 * 주요 설정 상수:
 * - API_CONFIG: API 호출에 필요한 기본 설정값들을 담은 객체입니다.
 * - HTTP_STATUS: 서버 응답에 사용되는 HTTP 상태 코드를 숫자로 정의한 객체입니다.
 * - ERROR_MESSAGES: API 요청 및 처리 중 발생할 수 있는 에러에 대응하는 메시지를 담은 객체입니다.
 * - ERROR_TYPES: 에러 발생 시 코드 상에서 구분하기 위한 에러 타입 문자열들을 포함하는 객체입니다.
 * - SHORTCUTS: 애플리케이션 내 단축키 조합을 정의한 객체입니다.
 */
 
/**
 * API 기본 설정 객체
 * 이 객체는 API 호출에 사용되는 기본 설정값들을 포함합니다.
 * - BASE_URL: API 서버의 기본 URL입니다.
 * - ENDPOINTS: API의 각종 엔드포인트 경로들을 정의하는 객체입니다.
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
 * HTTP 상태 코드 상수 객체
 * 이 객체는 서버 응답 상태를 나타내는 숫자형 HTTP 상태 코드들을 정의합니다.
 * 각 코드는 해당하는 HTTP 응답을 설명하며, 애플리케이션의 에러 핸들링에 활용됩니다.
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
 * 에러 메시지 상수 객체
 * 이 객체는 API 요청 및 처리 중 발생할 수 있는 에러 상황에 대해 사용자에게 표시할
 * 상세한 메시지들을 제공합니다. 각 메시지는 특정 에러 상황에 대응하여 적절한 안내를 제공합니다.
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
 * 에러 타입 상수 객체
 * 이 객체는 에러 상황을 코드 상에서 명확하게 식별하기 위한 문자열 상수들을 정의합니다.
 * 각 값은 에러의 종류를 구분하는 데 중요한 역할을 합니다.
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
 * 단축키 설정 객체
 * 이 객체는 애플리케이션 내에서 특정 동작을 빠르게 실행할 수 있도록 정의된 단축키 조합을 포함합니다.
 * 예를 들어, 할일 생성을 위한 단축키 등이 정의되어 있습니다.
 * @type {Object}
 */
export const SHORTCUTS = {
  CREATE_TODO: {
    ctrl: true,
    alt: true,
    key: 'n',
  },
};
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
 * 단축키 설정
 * 애플리케이션 내 기능을 빠르게 실행하기 위해 설정된 단축키 조합을 정의합니다.
 * 각 단축키는 특정 작업(예: 할일 생성)을 수행하기 위한 키 조합으로 설정됩니다.
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
 * API 호출 시 사용되는 HTTP 메서드를 문자열 상수로 정의합니다.
 * - GET: 데이터 조회
 * - POST: 새 데이터 생성
 * - PUT: 기존 데이터 전체 수정
 * - PATCH: 기존 데이터 일부 수정
 * - DELETE: 데이터 삭제
 * @type {Object}
 */
export const HTTP_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};
 * 단축키 설정
 *
 * 이 객체는 애플리케이션 내에서 사용되는 단축키 구성을 정의합니다.
 * 사용자는 이 단축키를 통해 기능을 보다 빠르게 접근할 수 있으며, 개발자는 이를 참조하여 단축키 관련 로직을 구현할 수 있습니다.
 *
 * @property {Object} CREATE_TODO - 새로운 할일 생성을 위한 단축키 설정 객체
 * @property {boolean} CREATE_TODO.ctrl - Ctrl 키 사용 여부
 * @property {boolean} CREATE_TODO.alt - Alt 키 사용 여부
 * @property {string} CREATE_TODO.key - 할일 생성을 위한 단축키 문자
 */
export const SHORTCUTS = {
  CREATE_TODO: {
    ctrl: true,
    alt: true,
    key: 'n',
  },
};

// ---------------------------------
// HTTP 메서드 상수
// ---------------------------------
/**
 * HTTP 메서드 상수
 *
 * 이 객체는 API 요청 시 사용되는 HTTP 메서드를 문자열 형태로 정의합니다.
 * 각 메서드는 해당 작업의 목적에 따라 적절히 선택되어야 하며, API 통신의 표준을 준수합니다.
 *
 * @property {string} GET - 데이터를 조회하기 위한 GET 메서드
 * @property {string} POST - 데이터를 생성하기 위한 POST 메서드
 * @property {string} PUT - 전체 데이터를 업데이트하기 위한 PUT 메서드
 * @property {string} PATCH - 부분 데이터를 업데이트하기 위한 PATCH 메서드
 * @property {string} DELETE - 데이터를 삭제하기 위한 DELETE 메서드
 */
export const HTTP_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};
  GENERIC_ERROR: 'GENERIC_ERROR',
};

/**
 * 단축키 설정
 *
 * 이 상수는 애플리케이션 사용 중 활성화할 단축키 조합을 정의합니다.
 * 예를 들어, 새로운 할일 생성을 위한 단축키가 포함되어 있습니다.
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
 *
 * 이 상수는 API 요청에 사용되는 HTTP 메서드(GET, POST, PUT, PATCH, DELETE)를 정의합니다.
 *
 * @type {Object}
 */
export const HTTP_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};