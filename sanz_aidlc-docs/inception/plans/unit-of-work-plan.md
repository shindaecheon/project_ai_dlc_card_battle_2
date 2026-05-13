# Unit of Work Plan

## Overview
시스템을 관리 가능한 개발 단위(Units of Work)로 분해합니다.

**Context**:
- **프로젝트**: 멀티플레이어 카드 배틀 게임
- **아키텍처**: 클라이언트-서버 분리
- **컴포넌트**: 9개 (서버 3, 클라이언트 4, 공유 2)
- **복잡도**: Moderate

---

## Decomposition Strategy

### Application Design 분석

**서버 컴포넌트** (3개):
- WebSocket Server (server.js)
- Match Maker (match-maker.js)
- Game Manager (game-manager.js)

**클라이언트 컴포넌트** (4개):
- Mode Selector
- WebSocket Client
- UI Renderer
- Local AI

**분리 가능성**:
- 서버와 클라이언트는 명확히 분리됨
- 서버 컴포넌트 3개는 별도 파일로 이미 모듈화됨
- 클라이언트 컴포넌트는 index.html에 통합 (최소 변경 원칙)

---

## Unit of Work Plan Checklist

### Phase 1: 유닛 식별

- [ ] 서버 유닛 정의
  - [ ] 범위: server.js, match-maker.js, game-manager.js, package.json
  - [ ] 책임: WebSocket 서버, 매칭, 게임 로직
- [ ] 클라이언트 유닛 정의
  - [ ] 범위: index.html (기존 + WebSocket 통신 추가)
  - [ ] 책임: UI, WebSocket 클라이언트, AI 모드

### Phase 2: 유닛 의존성 분석

- [ ] 유닛 간 의존성 매트릭스 생성
- [ ] 통신 인터페이스 정의 (WebSocket 이벤트)
- [ ] 개발 순서 결정

### Phase 3: 스토리 매핑

- [ ] 각 기능 요구사항을 유닛에 할당
- [ ] 유닛별 작업 범위 명확화

### Phase 4: 산출물 생성

- [x] Generate `unit-of-work.md` - 유닛 정의 및 책임
- [x] Generate `unit-of-work-dependency.md` - 의존성 매트릭스
- [x] Generate `unit-of-work-story-map.md` - 스토리 매핑
- [x] Validate unit boundaries and dependencies

---

## Decomposition Questions

Units Generation을 위한 명확한 분해 전략을 수립하기 위해 다음 질문에 답변해 주세요.

### Q1: 유닛 수
시스템을 몇 개의 유닛으로 분해할까요?

A) 2개 유닛 - 서버 유닛 + 클라이언트 유닛 (권장)
B) 1개 유닛 - 전체를 하나의 유닛으로 (단순)
C) 3개 이상 - 서버를 여러 유닛으로 추가 분해

[Answer]: A

**근거 (A 권장)**:
- 서버와 클라이언트는 명확히 분리된 책임
- 병렬 개발 가능
- 독립적으로 테스트 가능

---

### Q2: 서버 유닛 범위
서버 유닛의 범위를 어떻게 정의할까요?

A) 단일 유닛 - server.js, match-maker.js, game-manager.js, package.json 전체 (권장)
B) 다중 유닛 - 각 모듈을 별도 유닛으로 분리 (복잡)
C) 최소 유닛 - server.js만 포함, 나머지는 클라이언트와 통합

[Answer]: A

**근거 (A 권장)**:
- 서버 모듈들이 긴밀하게 연결됨
- 함께 배포되어야 함
- 하나의 package.json으로 관리

---

### Q3: 클라이언트 유닛 범위
클라이언트 유닛의 범위를 어떻게 정의할까요?

A) 단일 파일 - index.html (기존 코드 + WebSocket 통신 추가) (권장)
B) 다중 파일 - HTML, JS, CSS 분리
C) 하이브리드 - HTML + 별도 JS 파일 1개

[Answer]: A

**근거 (A 권장)**:
- 요구사항: "최소 변경"
- 기존 index.html 유지
- 프로토타입 속도 우선

---

### Q4: 유닛 간 개발 순서
유닛을 어떤 순서로 개발할까요?

A) 병렬 개발 - 서버와 클라이언트 동시 개발 (권장)
B) 순차 개발 (서버 우선) - 서버 완료 후 클라이언트
C) 순차 개발 (클라이언트 우선) - 클라이언트 완료 후 서버

[Answer]: A

**근거 (A 권장)**:
- WebSocket 프로토콜이 사전 정의됨
- 독립적으로 개발 가능
- 시간 절약

---

### Q5: 유닛 간 인터페이스
유닛 간 통신 인터페이스는 무엇인가요?

A) WebSocket 이벤트 프로토콜 - requirements.md TR-3에 정의됨 (권장)
B) REST API - HTTP 기반
C) 혼합 - WebSocket + REST API

[Answer]: A

**근거 (A 권장)**:
- 요구사항에 명시
- 실시간 통신 필요
- 이미 설계됨

---

### Q6: 유닛 테스트 전략
각 유닛을 어떻게 테스트할까요?

A) 유닛 독립 테스트 + 통합 테스트 - 각각 테스트 후 통합 (권장)
B) 통합 테스트만 - 전체 시스템을 함께 테스트
C) 테스트 없음 - 수동 테스트만

[Answer]: A

**근거 (A 권장)**:
- 서버: 유닛 테스트 가능 (Socket.io mock)
- 클라이언트: 브라우저 테스트
- 통합: 2개 브라우저로 E2E 테스트

---

### Q7: 코드 조직 구조 (Greenfield)
새로운 서버 코드를 어떻게 조직할까요?

A) server/ 디렉토리 생성 - server/, index.html 분리 (권장)
B) 루트에 모두 배치 - server.js, index.html 같은 레벨
C) 중첩 구조 - src/server/, src/client/

[Answer]: A

**근거 (A 권장)**:
- 명확한 분리
- 확장 용이
- 일반적인 관행

---

### Q8: 공유 코드
유닛 간 공유 코드를 어떻게 처리할까요?

A) 중복 허용 - 각 유닛에서 독립적으로 정의 (권장, 프로토타입)
B) 공유 모듈 - shared/ 디렉토리 생성
C) 없음 - 공유 코드 불필요

[Answer]: A

**근거 (A 권장)**:
- 프로토타입 수준
- 공유 코드가 적음 (카드 상수 정도)
- 단순성 우선

---

### Q9: 유닛별 문서화
각 유닛에 대한 문서를 어떻게 작성할까요?

A) 유닛별 README - 각 유닛에 README.md (선택 사항)
B) 통합 문서만 - aidlc-docs/에만 문서화 (권장, 프로토타입)
C) 상세 문서 - API 문서, 설치 가이드 등

[Answer]: A

**근거 (B 권장)**:
- 프로토타입 수준
- aidlc-docs/ 산출물로 충분
- 빠른 구현 우선

---

### Q10: 유닛 배포
유닛을 어떻게 배포할까요?

A) 단일 배포 - 서버와 클라이언트 함께 배포 (권장, 로컬)
B) 분리 배포 - 서버와 클라이언트 별도 호스팅
C) 컨테이너 - Docker 사용

[Answer]: A

**근거 (A 권장)**:
- 로컬 네트워크 배포
- 서버가 index.html 제공
- 단순 구조

---

## Instructions

1. 위 10개 질문에 대해 [Answer]: 태그 뒤에 선택한 옵션(A, B, C)을 기입하세요
2. 답변 완료 후 "답변 완료"라고 알려주세요
3. 모든 답변이 완료되면 Units Generation 산출물을 생성합니다

**답변 완료 후 "답변 완료"라고 알려주세요.**
