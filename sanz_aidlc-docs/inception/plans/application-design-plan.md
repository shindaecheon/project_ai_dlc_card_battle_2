# Application Design Plan

## Purpose
고수준 컴포넌트 식별 및 서비스 레이어 설계

## Context Summary

**프로젝트**: 단일 플레이어 카드 배틀 게임 → 멀티플레이어 지원 (1:1 매칭)

**주요 요구사항**:
- WebSocket 기반 실시간 통신
- FIFO 매칭 시스템
- 서버 사이드 게임 로직 검증
- AI 모드 유지 (선택 가능)
- 10초 턴 타이머
- 간단한 이모티콘 전송

**아키텍처 변환**:
- **Before**: 클라이언트 전용 (index.html)
- **After**: 클라이언트-서버 분리 (WebSocket 통신)

---

## Design Plan Checklist

### Phase 1: Component Identification

#### 1.1 Server-Side Components
- [ ] WebSocket 서버 컴포넌트 식별
  - [ ] 연결 관리 담당 컴포넌트
  - [ ] 이벤트 라우팅 담당 컴포넌트
- [ ] 매칭 시스템 컴포넌트 식별
  - [ ] 매칭 큐 관리
  - [ ] 플레이어 페어링 로직
- [ ] 게임 관리 컴포넌트 식별
  - [ ] 게임 세션 생성/관리
  - [ ] 게임 상태 저장소
  - [ ] 턴 타이머 관리
- [ ] 게임 로직 컴포넌트 식별
  - [ ] 카드 덱 관리
  - [ ] 배틀 판정 로직
  - [ ] 게임 규칙 검증

#### 1.2 Client-Side Components
- [ ] 게임 모드 선택 컴포넌트
- [ ] WebSocket 통신 컴포넌트
- [ ] UI 렌더링 컴포넌트
- [ ] 로컬 AI 컴포넌트 (기존 유지)

#### 1.3 Shared Components
- [ ] 데이터 모델 정의 (Card, GameState, Player 등)
- [ ] 프로토콜 정의 (WebSocket 이벤트 스펙)

---

### Phase 2: Component Methods Definition

#### 2.1 서버 컴포넌트 메서드
- [ ] WebSocket 서버 메서드 정의
  - [ ] 연결 핸들러
  - [ ] 이벤트 리스너
  - [ ] 브로드캐스트 메서드
- [ ] 매칭 시스템 메서드 정의
  - [ ] 큐 추가/제거
  - [ ] 매칭 로직
- [ ] 게임 관리자 메서드 정의
  - [ ] 게임 생성
  - [ ] 상태 업데이트
  - [ ] 턴 관리
- [ ] 게임 로직 메서드 정의
  - [ ] 카드 비교
  - [ ] HP 계산
  - [ ] 검증 로직

#### 2.2 클라이언트 컴포넌트 메서드
- [ ] WebSocket 클라이언트 메서드
  - [ ] 연결/재연결
  - [ ] 이벤트 송수신
- [ ] UI 메서드
  - [ ] 모드 선택 화면
  - [ ] 게임 화면 업데이트
  - [ ] 타이머 표시

---

### Phase 3: Service Layer Design

#### 3.1 서버 서비스 정의
- [ ] 매칭 서비스
  - [ ] 책임 정의
  - [ ] 인터페이스 정의
- [ ] 게임 세션 서비스
  - [ ] 책임 정의
  - [ ] 인터페이스 정의
- [ ] 타이머 서비스
  - [ ] 책임 정의
  - [ ] 인터페이스 정의

#### 3.2 서비스 오케스트레이션
- [ ] 서비스 간 상호작용 패턴 정의
- [ ] 이벤트 플로우 설계

---

### Phase 4: Component Dependencies

#### 4.1 의존성 관계 정의
- [ ] 서버 컴포넌트 간 의존성
- [ ] 클라이언트 컴포넌트 간 의존성
- [ ] 클라이언트-서버 통신 인터페이스

#### 4.2 통신 패턴
- [ ] WebSocket 이벤트 플로우
- [ ] 동기/비동기 패턴

---

### Phase 5: Design Artifacts Generation

- [ ] Generate `components.md` - 컴포넌트 정의 및 책임
- [ ] Generate `component-methods.md` - 메서드 시그니처
- [ ] Generate `services.md` - 서비스 정의 및 오케스트레이션
- [ ] Generate `component-dependency.md` - 의존성 및 통신 패턴
- [ ] Generate `application-design.md` - 통합 설계 문서
- [ ] Validate design completeness and consistency

---

## Design Questions

프로젝트의 명확한 설계를 위해 다음 질문들에 답변해 주세요.

### Q1: 서버 컴포넌트 구조
서버 코드를 어떻게 구조화할까요?

A) 모듈화 - server.js, game-manager.js, match-maker.js로 분리 (권장)
B) 단일 파일 - server.js에 모든 로직 통합
C) 더 세분화 - 각 기능별로 더 많은 파일로 분리

[Answer]: A

---

### Q2: 게임 세션 저장소
게임 세션 데이터를 어떻게 저장할까요?

A) 인메모리 Map 객체 - gameId → gameState (간단, 권장)
B) 배열 기반 - 게임 목록을 배열로 관리
C) 클래스 기반 - GameSession 클래스 인스턴스 관리

[Answer]: A

---

### Q3: 매칭 큐 구현
매칭 큐를 어떤 자료구조로 구현할까요?

A) 배열 - Array.push() / Array.shift() (간단, FIFO 보장)
B) 링크드 리스트 - 노드 기반 큐
C) Queue 클래스 - 커스텀 큐 클래스 작성

[Answer]: A

---

### Q4: 타이머 관리
턴 타이머를 어떻게 구현할까요?

A) setTimeout 기반 - 각 턴마다 setTimeout으로 타이머 설정 (간단, 권장)
B) setInterval 기반 - 1초마다 남은 시간 체크
C) 타이머 클래스 - 전용 Timer 클래스 작성

[Answer]: A

---

### Q5: 클라이언트 WebSocket 통신
클라이언트의 WebSocket 통신 코드를 어떻게 구조화할까요?

A) index.html 내부에 통합 - <script> 태그 안에 모든 로직 (최소 변경, 권장)
B) 별도 JS 파일 - socket-client.js 파일 분리
C) 모듈화 - 여러 JS 파일로 기능별 분리

[Answer]: B

---

### Q6: 에러 핸들링 전략
네트워크 에러 및 게임 에러를 어떻게 처리할까요?

A) 기본 에러 처리 - console.error() + 사용자 알림 (간단, 프로토타입 적합)
B) 구조화된 에러 처리 - try/catch + 에러 타입별 처리
C) 에러 핸들러 클래스 - 전용 에러 처리 클래스

[Answer]: A

---

### Q7: 게임 상태 동기화 전략
게임 상태를 클라이언트와 어떻게 동기화할까요?

A) 이벤트 기반 - 상태 변경 시마다 이벤트 전송 (실시간, 권장)
B) 폴링 기반 - 클라이언트가 주기적으로 상태 요청
C) 전체 상태 전송 - 매 턴마다 전체 게임 상태 전송

[Answer]: A

---

### Q8: 카드 데이터 관리
카드 덱을 서버와 클라이언트 중 어디서 생성할까요?

A) 서버만 - 서버에서 덱 생성 후 각 플레이어에게 배분 (보안, 권장)
B) 클라이언트만 - 클라이언트에서 생성 후 서버에 전송
C) 양쪽 - 서버와 클라이언트 모두 독립적으로 생성

[Answer]: A

---

### Q9: AI 모드 처리
AI 모드를 어떻게 구현할까요?

A) 클라이언트 전용 - 기존 AI 로직 그대로 유지, 서버 접속 안 함 (권장)
B) 서버 통합 - AI도 서버를 통해 관리
C) 하이브리드 - AI는 로컬이지만 서버에 기록 전송

[Answer]: A

---

### Q10: 이모티콘 전송
이모티콘 전송을 어떻게 구현할까요?

A) 단순 이벤트 - emoji:send / emoji:received 이벤트로 처리 (간단, 권장)
B) 채팅 시스템 - 메시지 큐 방식
C) 별도 채널 - 전용 이모티콘 채널 생성

[Answer]: A

---

## Instructions

1. 위 10개 질문에 대해 [Answer]: 태그 뒤에 선택한 옵션(A, B, C)을 기입하세요
2. 답변 완료 후 "답변 완료"라고 알려주세요
3. 모든 답변이 완료되면 Application Design 산출물을 생성합니다

**답변 완료 후 "답변 완료"라고 알려주세요.**
