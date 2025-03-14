# Code Convention

## 기본 규칙

1. TypeScript를 사용하여 타입 안정성 확보
2. 모든 변수와 함수는 명확한 이름 사용
3. 일관된 코드 스타일 유지

## 네이밍 컨벤션

### 변수

- camelCase 사용
- 명확하고 설명적인 이름 사용
- 불린형 변수는 is, has, should 등으로 시작

```typescript
const userName = 'John';
const isActive = true;
const hasPermission = false;
```

### 함수

- camelCase 사용
- 동사로 시작
- 함수의 목적을 명확히 표현

```typescript
function getUserData() {}
function updateUserProfile() {}
function handleSubmit() {}
```

### 클래스

- PascalCase 사용
- 명사로 시작

```typescript
class UserProfile {}
class TodoItem {}
class AuthService {}
```

### 인터페이스

- PascalCase 사용
- 'I' 접두사 사용하지 않음

```typescript
interface User {}
interface TodoItem {}
interface AuthResponse {}
```

### 타입

- PascalCase 사용

```typescript
type UserRole = 'admin' | 'user';
type ValidationResult = {
  isValid: boolean;
  errors: string[];
};
```

### 상수

- UPPER_SNAKE_CASE 사용

```typescript
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';
```

## 코드 포맷팅

### 들여쓰기

- 2칸 들여쓰기 사용

### 중괄호

- 여는 중괄호는 같은 줄에 배치

```typescript
if (condition) {
  // code
}

function example() {
  // code
}
```

### 세미콜론

- 모든 구문 끝에 세미콜론 사용

### 따옴표

- 문자열에는 작은따옴표(') 사용
- JSX에서는 큰따옴표(") 사용

## React 관련 규칙

### 컴포넌트

- 파일명과 컴포넌트명은 PascalCase 사용
- 함수형 컴포넌트와 화살표 함수 사용

```typescript
// TodoItem.tsx
const TodoItem: React.FC<TodoItemProps> = ({ item }) => {
  return (
    <div>
      {item.title}
    </div>
  );
};
```

### Props

- 인터페이스로 타입 정의
- readonly 사용하여 불변성 보장

```typescript
interface TodoItemProps {
  readonly item: {
    id: number;
    title: string;
    completed: boolean;
  };
  onComplete: (id: number) => void;
}
```

### 이벤트 핸들러

- handle 접두사 사용
- 이벤트 타입 명시

```typescript
const handleClick = (event: React.MouseEvent) => {
  // code
};

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  // code
};
```

## 파일 구조

```
src/
├── components/      # 재사용 가능한 컴포넌트
├── pages/          # 페이지 컴포넌트
├── hooks/          # 커스텀 훅
├── services/       # API 호출 등 서비스 로직
├── utils/          # 유틸리티 함수
├── types/          # 타입 정의
└── constants/      # 상수 정의
```

## 주석 작성

- 복잡한 로직에만 주석 작성
- JSDoc 스타일 사용

```typescript
/**
 * 사용자 정보를 가져오는 함수
 * @param userId - 사용자 ID
 * @returns 사용자 정보 객체
 */
async function fetchUserInfo(userId: string): Promise<User> {
  // code
}
```

## 테스트

- 파일명은 `.test.ts` 또는 `.spec.ts` 사용
- Describe-It 패턴 사용
- 의미 있는 테스트 케이스 작성

```typescript
describe('TodoItem', () => {
  it('should render todo title', () => {
    // test code
  });

  it('should toggle completion status', () => {
    // test code
  });
});
```

## 에러 처리

- try-catch 구문 사용
- 의미 있는 에러 메시지 작성

```typescript
try {
  await api.updateUser(userData);
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message);
  } else {
    console.error('Unknown Error:', error);
  }
}
```

## 성능 최적화

- 불필요한 렌더링 방지
- useMemo, useCallback 적절히 사용
- 큰 목록은 가상화 사용

```typescript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(event => doSomething(event), []);
```
