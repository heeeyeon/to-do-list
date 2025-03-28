# Commit Convention

## 커밋 메시지 구조

```text
<type>(<scope>): <subject>

<body>

<footer>
```

## Type

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드, 리팩토링 테스트 코드 추가
- `chore`: 빌드 업무 수정, 패키지 매니저 수정
- `design`: CSS 등 사용자 UI 디자인 변경
- `comment`: 필요한 주석 추가 및 변경
- `rename`: 파일 혹은 폴더명을 수정하거나 옮기는 작업만인 경우
- `remove`: 파일을 삭제하는 작업만 수행한 경우
- `!BREAKING CHANGE`: 커다란 API 변경의 경우

## Scope (선택사항)

- 어떤 부분이 변경되었는지를 명시
- 예: (auth), (user), (todo), (api)

## Subject

- 변경사항에 대한 간단한 설명
- 현재 시제 사용
- 첫 글자는 대문자로 시작하지 않음
- 마지막에 마침표(.) 사용하지 않음

## Body (선택사항)

- 변경사항에 대한 자세한 설명
- 여러 줄의 메시지를 작성할 경우 사용
- "-"로 구분하여 내용을 작성

## Footer (선택사항)

- Breaking Changes나 이슈에 대한 참조를 기록
- BREAKING CHANGE: API의 큰 변경사항이 있을 경우
- Closes #123, #456: 이슈 종료를 명시할 경우

## 예시

```text
feat(auth): add login functionality

- implement login form
- add validation
- integrate with backend API

Closes #123
```

```text
fix(todo): resolve item deletion bug

- fix race condition in delete operation
- add error handling
```

```text
docs(readme): update installation guide

- add development setup instructions
- update API documentation
```

## 권장사항

1. 커밋은 가능한 작은 단위로 나누어 작성
2. 커밋 메시지는 명확하고 이해하기 쉽게 작성
3. 관련된 이슈 번호는 반드시 포함
4. 불필요한 커밋은 squash하여 정리
