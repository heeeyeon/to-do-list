/**
 * API 관련 설정값들을 관리하는 설정 파일
 */

/**
 * API 기본 설정
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
};

/**
 * 에러 타입 상수
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
};

/**
 * 단축키 설정
 * @type {Object}
 */
export const SHORTCUTS = {
  CREATE_TODO: {
    ctrl: true,
    alt: true,
    key: 'n',
  },
};
