# Requirements Document

## Intent Analysis Summary

### User Request
> "2.2 서버 구축에서 매칭 시스템을 구현해서 멀티 플레이를 가능하게 하고 싶어. 접속 순서대로 1:1로 매칭되게. 일단 플랜을 짜줘"

### Project Overview
- **Request Type**: New Feature + Infrastructure
- **Scope**: System-wide (클라이언트 + 서버 아키텍처 전환)
- **Complexity**: Moderate to Complex
- **Timeline**: 즉시 (프로토타입 수준)
- **Priority**: 빠른 구현 우선

### Current State
- 단일 플레이어 카드 배틀 게임 (클라이언트 전용)
- 기술 스택: Vanilla HTML/CSS/JavaScript
- 아키텍처: 모든 로직이 브라우저에서 실행

### Target State
- 멀티플레이어 1:1 대전 지원
- WebSocket 서버 추가 (로컬 네트워크)
- 간단한 FIFO 매칭 시스템
- AI 모드와 멀티플레이어 모드 선택 가능

---

## Functional Requirements

### FR-1: 게임 모드 선택
**Priority**: High

**Description**: 사용자가 게임 시작 시 AI 대전 또는 멀티플레이어 중 선택할 수 있어야 함

**Acceptance Criteria**:
- [ ] 게임 시작 화면에 "AI 대전" 및 "멀티플레이어" 버튼 표시
- [ ] AI 대전 선택 시 기존과 동일하게 로컬 AI와 게임 진행
- [ ] 멀티플레이어 선택 시 매칭 큐에 진입

**Details**:
- 기존 AI 모드 코드 유지
- 새로운 멀티플레이어 모드 추가

---

### FR-2: 매칭 시스템
**Priority**: High

**Description**: 접속 순서대로 플레이어를 자동으로 1:1 매칭

**Acceptance Criteria**:
- [ ] 플레이어가 멀티플레이어 선택 시 자동으로 매칭 큐에 진입
- [ ] 큐에 2명의 플레이어가 있을 때 자동으로 매칭
- [ ] FIFO (First-In-First-Out) 방식으로 매칭
- [ ] 매칭 대기 중 "매칭 중..." 메시지 표시

**Details**:
- 대기 중인 플레이어 수 표시 없음 (간단한 구현)
- 수동 매칭 취소 기능 없음 (MVP)

---

### FR-3: 게임 규칙
**Priority**: High

**Description**: 현재 게임 규칙 유지

**Acceptance Criteria**:
- [ ] 각 플레이어 10장의 카드 배분
- [ ] 초기 HP: 10
- [ ] 최대 턴 수: 10턴
- [ ] 카드 값 비교: 높은 숫자가 승리, 패자는 HP 1 감소
- [ ] 무승부 시 HP 변화 없음

**Details**:
- 게임 규칙을 하드코딩 (빠른 구현 우선)
- 향후 확장 가능성 고려하지 않음 (필요 시 리팩토링)

---

### FR-4: 턴 시간 제한
**Priority**: Medium

**Description**: 각 플레이어는 카드 선택 시 10초 시간 제한

**Acceptance Criteria**:
- [ ] 플레이어 턴 시작 시 10초 타이머 시작
- [ ] 화면에 남은 시간 표시 (카운트다운)
- [ ] 10초 초과 시 자동으로 랜덤 카드 제출
- [ ] 타이머는 서버에서 관리 (클라이언트 조작 방지)

**Details**:
- 경고 표시 없음 (단순 구현)
- 타임아웃 시 가장 낮은 인덱스의 카드 자동 제출 (또는 완전 랜덤)

---

### FR-5: 실시간 게임 동기화
**Priority**: High

**Description**: 두 플레이어의 게임 상태를 실시간으로 동기화

**Acceptance Criteria**:
- [ ] 플레이어가 카드 제출 시 상대방에게 즉시 전달
- [ ] 배틀 결과를 양쪽 플레이어에게 동시 표시
- [ ] HP, 턴 수, 남은 카드 수 동기화
- [ ] 게임 종료 조건 도달 시 양쪽 플레이어에게 결과 표시

**Details**:
- WebSocket을 통한 실시간 통신
- 서버가 게임 상태의 단일 진실 공급원(Single Source of Truth)

---

### FR-6: 연결 끊김 처리
**Priority**: Medium

**Description**: 플레이어 연결이 끊기면 즉시 게임 종료

**Acceptance Criteria**:
- [ ] 플레이어 연결 끊김 감지
- [ ] 연결이 끊긴 플레이어는 자동 패배 처리
- [ ] 상대방에게 "상대방 연결 끊김" 메시지 표시
- [ ] 게임 종료 후 두 플레이어 모두 초기 화면으로 이동

**Details**:
- 재연결 기능 없음 (MVP)
- 연결 끊김 = 즉시 패배

---

### FR-7: 게임 기록
**Priority**: Low

**Description**: 게임 결과 저장 없음

**Acceptance Criteria**:
- [ ] 게임 종료 후 데이터 소멸
- [ ] 승/패 통계 없음
- [ ] 게임 히스토리 없음

**Details**:
- 데이터베이스 불필요
- 완전히 휘발성 게임 세션

---

### FR-8: 채팅 기능
**Priority**: Low

**Description**: 간단한 이모티콘 전송 기능

**Acceptance Criteria**:
- [ ] 게임 중 정해진 이모티콘 전송 가능
- [ ] 이모티콘 종류: 👍, 😊, 😢, 😡, 🎉 (5개)
- [ ] 이모티콘 수신 시 화면에 표시 (3초간 표시 후 사라짐)
- [ ] 텍스트 채팅 없음

**Details**:
- 욕설 필터 불필요 (이모티콘만)
- 스팸 방지: 3초당 1개 제한 (선택 사항)

---

## Non-Functional Requirements

### NFR-1: 성능
**Priority**: Medium

**Description**: 허용 가능한 응답 시간

**Requirements**:
- 카드 제출 후 결과 표시: 2~3초 이내 허용
- 매칭 완료: 즉시 (대기 중인 플레이어 있을 경우)
- WebSocket 연결: 5초 이내

**Notes**:
- 실시간 게임 느낌보다는 작동 우선
- 네트워크 지연 허용 (로컬 네트워크)

---

### NFR-2: 확장성
**Priority**: Low

**Description**: 동시 사용자 수

**Requirements**:
- 초기 목표: 10명 미만 동시 접속 지원
- 향후 확장 가능성 고려하지 않음
- 단일 서버 인스턴스로 충분

**Notes**:
- 클러스터링 불필요
- 로드 밸런싱 불필요

---

### NFR-3: 보안
**Priority**: Low

**Description**: 최소 수준의 보안

**Requirements**:
- 서버 사이드 게임 로직 검증 (치팅 방지)
  - 카드 제출 유효성 검증 (유효한 카드 인덱스인지)
  - 턴 순서 검증 (자신의 턴인지)
  - HP 계산 서버에서 수행
- 입력 검증: 기본 수준
- Rate Limiting: 없음
- HTTPS: 불필요 (로컬 네트워크)
- 사용자 인증: 없음

**Notes**:
- 프로토타입 수준이므로 최소 보안
- 공개 인터넷 노출 금지

---

### NFR-4: 배포 환경
**Priority**: High

**Description**: 로컬 네트워크 환경에서 실행

**Requirements**:
- 서버: 로컬 머신에서 실행
- 클라이언트: 같은 Wi-Fi 네트워크의 다른 기기에서 접속
- 서버 IP 자동 감지 및 표시
  - 서버 시작 시 로컬 네트워크 IP 주소 감지
  - 콘솔에 접속 URL 표시 (예: `http://192.168.1.100:3000`)
- 외부 배포 없음

**Details**:
- 방화벽 설정: 로컬 네트워크 내 포트 오픈
- 도메인 불필요

---

### NFR-5: 유지보수성
**Priority**: Low

**Description**: 빠른 구현 우선, 코드 품질 이차적

**Requirements**:
- 최소한의 코드 변경
- 기존 index.html 유지, WebSocket 통신만 추가
- 모듈화 불필요 (프로토타입)
- 테스트 코드 없음 (수동 테스트)

**Notes**:
- 향후 리팩토링 가능성 염두

---

## Technical Requirements

### TR-1: 기술 스택
**Priority**: High

**Server-side**:
- **Runtime**: Node.js (v18+ LTS)
- **Framework**: Express.js (v4.x)
- **WebSocket**: Socket.io (v4.x)
- **Language**: JavaScript (ES6+)

**Client-side**:
- **기존 유지**: HTML5, CSS3, Vanilla JavaScript
- **추가**: Socket.io-client (v4.x)

**Rationale**:
- JavaScript 풀스택 (학습 곡선 최소화)
- Socket.io의 자동 재연결 및 방(Room) 기능
- 빠른 프로토타입 개발에 적합

---

### TR-2: 코드 구조
**Priority**: High

**Client**:
- 기존 `index.html` 유지
- WebSocket 통신 코드만 추가
- 최소한의 리팩토링

**Server**:
- `server.js`: Express + Socket.io 서버
- `game-manager.js`: 게임 세션 관리
- `match-maker.js`: 매칭 큐 관리

**File Structure**:
```
table-order/
├── index.html              (기존, WebSocket 통신 추가)
├── server/
│   ├── server.js           (메인 서버)
│   ├── game-manager.js     (게임 관리)
│   └── match-maker.js      (매칭 시스템)
└── package.json            (서버 의존성)
```

---

### TR-3: 프로토콜 설계
**Priority**: High

**WebSocket Events**:

**Client → Server**:
- `player:join` - 매칭 큐 진입
- `card:submit` - 카드 제출 `{ gameId, cardIndex }`
- `emoji:send` - 이모티콘 전송 `{ gameId, emoji }`

**Server → Client**:
- `match:found` - 매칭 완료 `{ gameId, opponentId }`
- `game:start` - 게임 시작 `{ gameId, hand, isFirstPlayer }`
- `turn:waiting` - 상대방 턴 대기 중
- `turn:result` - 턴 결과 `{ playerCard, opponentCard, winner, newHP }`
- `game:end` - 게임 종료 `{ winner, reason, finalHP }`
- `opponent:disconnected` - 상대방 연결 끊김
- `emoji:received` - 이모티콘 수신 `{ emoji }`
- `timer:tick` - 타이머 업데이트 `{ remainingTime }`

---

### TR-4: 게임 상태 관리
**Priority**: High

**Server-side State**:
```javascript
{
  gameId: string,
  player1: { socketId, hand, hp },
  player2: { socketId, hand, hp },
  turn: number,
  currentPlayer: 1 or 2,
  deck: Array,
  turnTimer: Timeout
}
```

**Client-side State**:
- 자신의 패만 알 수 있음
- 상대방 패는 비공개
- 서버로부터 받은 게임 상태만 신뢰

---

## Out of Scope (향후 고려 사항)

다음 기능들은 현재 범위에서 제외됨:

- ❌ 사용자 인증 / 로그인 시스템
- ❌ 게임 기록 및 통계
- ❌ 리더보드 / 랭킹 시스템
- ❌ 방 생성 / 비밀번호 방
- ❌ 관전 모드
- ❌ 텍스트 채팅
- ❌ 게임 규칙 커스터마이징
- ❌ 다양한 게임 모드 (예: 2vs2, 토너먼트)
- ❌ 모바일 최적화
- ❌ 프로덕션 배포 (외부 서버)
- ❌ 데이터베이스
- ❌ 테스트 코드

---

## Extension Configuration

| Extension | Enabled | Decided At | Rationale |
|-----------|---------|------------|-----------|
| Security Baseline | No | Requirements Analysis | 프로토타입 프로젝트, 로컬 네트워크 전용 |
| Property-Based Testing | No | Requirements Analysis | 테스트 코드 불필요 (수동 테스트로 충분) |

---

## Success Criteria

프로젝트가 다음 조건을 만족하면 성공:

1. ✅ 두 플레이어가 같은 Wi-Fi 네트워크에서 접속 가능
2. ✅ FIFO 방식으로 자동 매칭
3. ✅ 실시간으로 카드 제출 및 배틀 결과 동기화
4. ✅ 10초 턴 시간 제한 작동
5. ✅ 게임 규칙이 정확하게 적용됨 (10장, 10HP, 10턴)
6. ✅ 연결 끊김 시 게임 종료
7. ✅ 간단한 이모티콘 전송 가능
8. ✅ AI 모드와 멀티플레이어 모드 선택 가능
9. ✅ 서버가 로컬 IP 주소를 자동으로 표시

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 네트워크 지연 | Medium | Low | 허용 가능한 지연 시간 설정 (2~3초) |
| 동시성 버그 | Medium | Medium | 서버 사이드 게임 상태 관리 |
| 브라우저 호환성 | Low | Low | 모던 브라우저만 지원 |
| 방화벽 차단 | Medium | High | 로컬 네트워크 포트 오픈 가이드 제공 |
| 타이머 정확도 | Low | Low | 서버 사이드 타이머 사용 |

---

## Assumptions

- 사용자는 같은 Wi-Fi 네트워크에 연결되어 있음
- 방화벽이 로컬 네트워크 내 통신을 허용함
- Node.js가 설치되어 있음
- 모던 브라우저 사용 (Chrome, Firefox, Safari, Edge 최신 버전)
- 최대 동시 접속자 10명 미만

---

## Dependencies

**External**:
- Node.js v18+ (런타임)
- npm (패키지 관리자)

**npm Packages**:
- `express` (^4.18.0) - HTTP 서버
- `socket.io` (^4.6.0) - WebSocket 서버
- `socket.io-client` (^4.6.0) - WebSocket 클라이언트 (CDN 또는 번들)

**Development**:
- `nodemon` (^3.0.0) - 개발 시 자동 재시작

---

## Timeline

**목표**: 즉시 구현 (프로토타입 수준)

**Phases**:
1. **서버 구축**: 1~2시간
   - Express + Socket.io 서버 설정
   - 매칭 시스템 구현
2. **클라이언트 수정**: 2~3시간
   - WebSocket 통신 추가
   - UI 업데이트 (모드 선택, 매칭 대기)
3. **게임 로직 통합**: 2~3시간
   - 서버 사이드 게임 로직
   - 실시간 동기화
4. **테스트 및 디버깅**: 1~2시간
   - 로컬 네트워크 테스트
   - 버그 수정

**Total**: 6~10시간 (1일 집중 개발)

---

## Approval

이 요구사항 문서는 사용자 답변을 기반으로 생성되었습니다.

**Date**: 2026-05-13
**Status**: Pending Approval
