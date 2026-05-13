# Unit of Work Story Map

## Overview
이 문서는 각 기능 요구사항(FR)을 어느 유닛에서 구현할지 매핑합니다.

**Source**: `aidlc-docs/inception/requirements/requirements.md`

**Units**:
- **Unit 1**: Server Implementation (UNIT-001)
- **Unit 2**: Client Modification (UNIT-002)

---

## Story Mapping Matrix

| Requirement ID | Requirement Name | Unit 1: Server | Unit 2: Client | Notes |
|----------------|------------------|----------------|----------------|-------|
| FR-1 | 게임 모드 선택 | - | ✅ | 클라이언트 UI에서 모드 선택 |
| FR-2 | 매칭 시스템 | ✅ | ✅ | 서버: 매칭 로직, 클라이언트: 매칭 요청 및 대기 UI |
| FR-3 | 게임 규칙 | ✅ | ✅ | 서버: 게임 로직 실행, 클라이언트: UI 렌더링 |
| FR-4 | 턴 시간 제한 | ✅ | ✅ | 서버: 타이머 관리, 클라이언트: 타이머 표시 |
| FR-5 | 실시간 게임 동기화 | ✅ | ✅ | 서버: 이벤트 브로드캐스트, 클라이언트: 이벤트 수신 |
| FR-6 | 연결 끊김 처리 | ✅ | ✅ | 서버: 연결 감지, 클라이언트: 알림 표시 |
| FR-7 | 게임 기록 | - | - | Out of scope (데이터 저장 없음) |
| FR-8 | 채팅 기능 | ✅ | ✅ | 서버: 이모티콘 중계, 클라이언트: 이모티콘 UI |

**Legend**:
- ✅ 구현 필요
- - 구현 불필요

---

## FR-1: 게임 모드 선택

### Unit Allocation: Unit 2 (Client)

**Priority**: High

**Description**: 사용자가 게임 시작 시 AI 대전 또는 멀티플레이어 중 선택

### Unit 2: Client 작업
**Scope**:
- [ ] 모드 선택 화면 UI 구현
  - "AI 대전" 버튼
  - "멀티플레이어" 버튼
- [ ] 버튼 클릭 이벤트 핸들러
  - AI 대전: 기존 `startGame()` 호출
  - 멀티플레이어: `socket.emit('player:join')` 호출
- [ ] 게임 모드 상태 변수 추가
  ```javascript
  let gameMode = null; // 'ai' or 'multiplayer'
  ```

**Acceptance Criteria**:
- [ ] 게임 시작 시 모드 선택 화면 표시
- [ ] AI 대전 선택 시 기존 로컬 게임 시작
- [ ] 멀티플레이어 선택 시 매칭 큐 진입

**File**: `index.html`

**Estimated LOC**: ~30-50 (UI HTML + CSS + JS)

---

## FR-2: 매칭 시스템

### Unit Allocation: Unit 1 + Unit 2

**Priority**: High

**Description**: 접속 순서대로 플레이어를 자동으로 1:1 매칭

### Unit 1: Server 작업
**Scope**:
- [ ] FIFO 매칭 큐 구현 (`match-maker.js`)
  ```javascript
  const waitingQueue = [];
  ```
- [ ] `player:join` 이벤트 핸들러
  - 플레이어를 큐에 추가
  - 큐에 2명이면 자동 매칭
- [ ] 매칭 완료 시 게임 세션 생성
  - `game-manager.js`의 `createGame()` 호출
- [ ] `match:found` 이벤트 전송
  ```javascript
  socket.emit('match:found', { gameId });
  ```

**Acceptance Criteria**:
- [ ] 플레이어가 `player:join` 전송 시 큐에 추가
- [ ] 큐에 2명이면 자동 매칭
- [ ] FIFO 순서 보장
- [ ] 매칭 완료 시 양쪽 플레이어에게 `match:found` 전송

**File**: `server/match-maker.js`, `server/server.js`

**Estimated LOC**: ~50-100

---

### Unit 2: Client 작업
**Scope**:
- [ ] 멀티플레이어 선택 시 `player:join` 이벤트 전송
  ```javascript
  socket.emit('player:join');
  ```
- [ ] 매칭 대기 화면 UI 구현
  - "매칭 중..." 메시지 표시
- [ ] `match:found` 이벤트 핸들러
  ```javascript
  socket.on('match:found', (data) => {
    gameId = data.gameId;
    // 게임 시작 대기
  });
  ```

**Acceptance Criteria**:
- [ ] 멀티플레이어 선택 시 매칭 대기 화면 표시
- [ ] `match:found` 수신 시 게임 준비

**File**: `index.html`

**Estimated LOC**: ~40-60 (UI + event handler)

---

## FR-3: 게임 규칙

### Unit Allocation: Unit 1 + Unit 2

**Priority**: High

**Description**: 현재 게임 규칙 유지 (10장, 10HP, 10턴, 카드 비교)

### Unit 1: Server 작업
**Scope**:
- [ ] 게임 초기화 (`game-manager.js`)
  - 카드 덱 생성 (52장)
  - Fisher-Yates 셔플
  - 각 플레이어에게 10장 배분
  - 초기 HP: 10
- [ ] 배틀 로직 구현
  - 카드 값 비교
  - 승자 결정
  - HP 계산 (패자 -1)
- [ ] 게임 종료 조건 확인
  - HP 0 이하
  - 10턴 완료
- [ ] `game:start` 이벤트 전송
  ```javascript
  socket.emit('game:start', { gameId, hand, isFirstPlayer });
  ```
- [ ] `turn:result` 이벤트 전송
  ```javascript
  socket.emit('turn:result', { playerCard, opponentCard, winner, newHP });
  ```
- [ ] `game:end` 이벤트 전송
  ```javascript
  socket.emit('game:end', { winner, reason, finalHP });
  ```

**Acceptance Criteria**:
- [ ] 각 플레이어 10장 카드 배분
- [ ] 초기 HP: 10
- [ ] 카드 비교 정확
- [ ] HP 계산 정확
- [ ] 게임 종료 조건 정확

**File**: `server/game-manager.js`

**Estimated LOC**: ~300-400

---

### Unit 2: Client 작업
**Scope**:
- [ ] `game:start` 이벤트 핸들러
  - 자신의 패 저장
  - 게임 화면 렌더링
  ```javascript
  socket.on('game:start', (data) => {
    myHand = data.hand;
    isFirstPlayer = data.isFirstPlayer;
    renderGameScreen();
  });
  ```
- [ ] `turn:result` 이벤트 핸들러
  - 배틀 결과 표시
  - HP 업데이트
  ```javascript
  socket.on('turn:result', (data) => {
    showBattleResult(data.playerCard, data.opponentCard, data.winner);
    updateHP(data.newHP);
  });
  ```
- [ ] `game:end` 이벤트 핸들러
  - 게임 결과 표시
  ```javascript
  socket.on('game:end', (data) => {
    showGameResult(data.winner, data.reason);
  });
  ```
- [ ] 게임 화면 UI 렌더링
  - 자신의 패 표시
  - HP 표시
  - 턴 수 표시

**Acceptance Criteria**:
- [ ] 게임 시작 시 자신의 패 표시
- [ ] 배틀 결과 정확하게 표시
- [ ] HP 동기화
- [ ] 게임 종료 시 결과 표시

**File**: `index.html`

**Estimated LOC**: ~100-150 (event handlers + UI)

---

## FR-4: 턴 시간 제한

### Unit Allocation: Unit 1 + Unit 2

**Priority**: Medium

**Description**: 각 플레이어는 카드 선택 시 10초 시간 제한

### Unit 1: Server 작업
**Scope**:
- [ ] 턴 타이머 구현 (`game-manager.js`)
  - 턴 시작 시 10초 타이머 시작
  - 1초마다 `timer:tick` 이벤트 전송
  - 10초 초과 시 자동 랜덤 카드 제출
  ```javascript
  const turnTimer = setInterval(() => {
    remainingTime--;
    socket.emit('timer:tick', { remainingTime });
    if (remainingTime <= 0) {
      autoSubmitCard();
    }
  }, 1000);
  ```
- [ ] 카드 제출 시 타이머 취소
  ```javascript
  clearInterval(turnTimer);
  ```

**Acceptance Criteria**:
- [ ] 턴 시작 시 10초 타이머 시작
- [ ] 1초마다 `timer:tick` 전송
- [ ] 10초 초과 시 자동 랜덤 카드 제출
- [ ] 카드 제출 시 타이머 취소

**File**: `server/game-manager.js`

**Estimated LOC**: ~50-80

---

### Unit 2: Client 작업
**Scope**:
- [ ] 타이머 UI 추가
  - 화면에 남은 시간 표시
  ```html
  <div id="timer">남은 시간: 10초</div>
  ```
- [ ] `timer:tick` 이벤트 핸들러
  ```javascript
  socket.on('timer:tick', (data) => {
    updateTimerDisplay(data.remainingTime);
  });
  ```
- [ ] 타이머 시각적 표시 (선택 사항)
  - 3초 이하일 때 빨간색으로 강조

**Acceptance Criteria**:
- [ ] 화면에 남은 시간 표시
- [ ] 1초마다 업데이트
- [ ] 타임아웃 시 자동 카드 제출 (서버에서 처리)

**File**: `index.html`

**Estimated LOC**: ~20-40 (UI + event handler)

---

## FR-5: 실시간 게임 동기화

### Unit Allocation: Unit 1 + Unit 2

**Priority**: High

**Description**: 두 플레이어의 게임 상태를 실시간으로 동기화

### Unit 1: Server 작업
**Scope**:
- [ ] WebSocket 이벤트 브로드캐스트
  - `game:start` - 게임 시작 (양쪽 플레이어)
  - `turn:result` - 배틀 결과 (양쪽 플레이어)
  - `game:end` - 게임 종료 (양쪽 플레이어)
- [ ] 게임 상태 관리 (인메모리 Map)
  ```javascript
  const games = new Map(); // gameId → game state
  ```
- [ ] 서버가 Single Source of Truth
  - 모든 게임 로직 서버에서 실행
  - 클라이언트는 결과만 수신

**Acceptance Criteria**:
- [ ] 서버에서 게임 상태 관리
- [ ] 모든 이벤트가 양쪽 플레이어에게 동시 전송
- [ ] 상태 동기화 정확

**File**: `server/game-manager.js`, `server/server.js`

**Estimated LOC**: ~100-150

---

### Unit 2: Client 작업
**Scope**:
- [ ] 서버 이벤트 수신 및 처리
  - `game:start` - 게임 시작 화면 렌더링
  - `turn:result` - 배틀 결과 표시
  - `game:end` - 게임 결과 표시
- [ ] UI 상태 업데이트
  - HP 동기화
  - 턴 수 동기화
  - 카드 수 동기화
- [ ] 서버 응답 신뢰
  - 클라이언트는 계산하지 않음

**Acceptance Criteria**:
- [ ] 모든 서버 이벤트 정상 처리
- [ ] UI가 서버 상태와 일치
- [ ] 실시간으로 업데이트

**File**: `index.html`

**Estimated LOC**: ~50-80 (event handlers)

---

## FR-6: 연결 끊김 처리

### Unit Allocation: Unit 1 + Unit 2

**Priority**: Medium

**Description**: 플레이어 연결이 끊기면 즉시 게임 종료

### Unit 1: Server 작업
**Scope**:
- [ ] Socket.io `disconnect` 이벤트 핸들러
  ```javascript
  socket.on('disconnect', () => {
    // 진행 중인 게임 찾기
    const game = findGameBySocketId(socket.id);
    if (game) {
      // 상대방에게 알림
      socket.to(game.opponentId).emit('opponent:disconnected');
      // 게임 종료
      endGame(game.gameId, 'disconnect');
    }
  });
  ```
- [ ] 게임 세션 정리
  - 인메모리 Map에서 게임 제거
  - 타이머 취소

**Acceptance Criteria**:
- [ ] 연결 끊김 감지
- [ ] 상대방에게 `opponent:disconnected` 전송
- [ ] 게임 세션 정리

**File**: `server/server.js`, `server/game-manager.js`

**Estimated LOC**: ~30-50

---

### Unit 2: Client 작업
**Scope**:
- [ ] `opponent:disconnected` 이벤트 핸들러
  ```javascript
  socket.on('opponent:disconnected', () => {
    alert('상대방의 연결이 끊어졌습니다. 게임이 종료됩니다.');
    returnToModeSelection();
  });
  ```
- [ ] 초기 화면으로 복귀

**Acceptance Criteria**:
- [ ] 상대방 연결 끊김 시 알림 표시
- [ ] 게임 종료 후 모드 선택 화면으로 이동

**File**: `index.html`

**Estimated LOC**: ~10-20 (event handler)

---

## FR-7: 게임 기록

### Unit Allocation: N/A (Out of Scope)

**Priority**: Low

**Description**: 게임 결과 저장 없음

**Rationale**: 프로토타입 수준, 데이터베이스 불필요

**No work required**

---

## FR-8: 채팅 기능

### Unit Allocation: Unit 1 + Unit 2

**Priority**: Low

**Description**: 간단한 이모티콘 전송 기능

### Unit 1: Server 작업
**Scope**:
- [ ] `emoji:send` 이벤트 핸들러
  ```javascript
  socket.on('emoji:send', (data) => {
    const { gameId, emoji } = data;
    // 이모티콘 검증
    if (ALLOWED_EMOJIS.includes(emoji)) {
      // 상대방에게 전송
      socket.to(opponentSocketId).emit('emoji:received', { emoji });
    }
  });
  ```
- [ ] 이모티콘 검증
  ```javascript
  const ALLOWED_EMOJIS = ['👍', '😊', '😢', '😡', '🎉'];
  ```

**Acceptance Criteria**:
- [ ] `emoji:send` 이벤트 처리
- [ ] 5개 이모티콘만 허용
- [ ] 상대방에게 `emoji:received` 전송

**File**: `server/server.js`

**Estimated LOC**: ~20-30

---

### Unit 2: Client 작업
**Scope**:
- [ ] 이모티콘 UI 추가
  - 5개 이모티콘 버튼: 👍, 😊, 😢, 😡, 🎉
  ```html
  <div id="emoji-buttons">
    <button onclick="sendEmoji('👍')">👍</button>
    <button onclick="sendEmoji('😊')">😊</button>
    <button onclick="sendEmoji('😢')">😢</button>
    <button onclick="sendEmoji('😡')">😡</button>
    <button onclick="sendEmoji('🎉')">🎉</button>
  </div>
  ```
- [ ] `emoji:send` 이벤트 전송
  ```javascript
  function sendEmoji(emoji) {
    socket.emit('emoji:send', { gameId, emoji });
  }
  ```
- [ ] `emoji:received` 이벤트 핸들러
  ```javascript
  socket.on('emoji:received', (data) => {
    showEmojiAnimation(data.emoji);
    // 3초 후 사라짐
    setTimeout(() => hideEmojiAnimation(), 3000);
  });
  ```
- [ ] 이모티콘 애니메이션
  - 화면 중앙에 크게 표시
  - 3초 후 사라짐

**Acceptance Criteria**:
- [ ] 이모티콘 버튼 표시
- [ ] 버튼 클릭 시 서버에 전송
- [ ] 상대방 이모티콘 수신 시 화면에 표시
- [ ] 3초 후 자동으로 사라짐

**File**: `index.html`

**Estimated LOC**: ~50-70 (UI + event handler + animation)

---

## Non-Functional Requirements Mapping

### NFR-1: 성능
**Unit Allocation**: Unit 1 + Unit 2

**Server**:
- [ ] 이벤트 처리 최적화
- [ ] 비동기 처리 사용

**Client**:
- [ ] UI 렌더링 최적화
- [ ] 불필요한 재렌더링 최소화

---

### NFR-2: 확장성
**Unit Allocation**: Unit 1

**Server**:
- [ ] 인메모리 Map 사용 (10명 미만 충분)
- [ ] 향후 확장 가능성 고려하지 않음

---

### NFR-3: 보안
**Unit Allocation**: Unit 1

**Server**:
- [ ] 서버 사이드 게임 로직 검증
- [ ] 카드 제출 유효성 검증
- [ ] 턴 순서 검증
- [ ] HP 계산 서버에서 수행

---

### NFR-4: 배포 환경
**Unit Allocation**: Unit 1

**Server**:
- [ ] 로컬 IP 자동 감지
  ```javascript
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  ```
- [ ] 콘솔에 접속 URL 표시
  ```javascript
  console.log(`Server running at http://${localIP}:${PORT}`);
  ```

---

### NFR-5: 유지보수성
**Unit Allocation**: Unit 1 + Unit 2

**Server**:
- [ ] 3개 파일로 모듈 분리
  - `server.js` - 메인 서버
  - `match-maker.js` - 매칭 시스템
  - `game-manager.js` - 게임 로직

**Client**:
- [ ] 최소한의 코드 변경
- [ ] 기존 AI 모드 유지

---

## Unit Work Summary

### Unit 1: Server Implementation
**Total Tasks**: ~15-20 tasks

**Modules**:
- **server.js** (메인 서버)
  - Express 서버 설정
  - Socket.io 서버 초기화
  - 이벤트 라우팅
  - 로컬 IP 감지
- **match-maker.js** (매칭 시스템)
  - FIFO 큐 관리
  - 매칭 로직
- **game-manager.js** (게임 로직)
  - 게임 초기화
  - 배틀 로직
  - 타이머 관리
  - 게임 종료 조건

**Estimated LOC**: ~650-900

---

### Unit 2: Client Modification
**Total Tasks**: ~12-18 tasks

**Modifications**:
- **모드 선택 UI** (신규)
  - AI 대전 버튼
  - 멀티플레이어 버튼
- **WebSocket 통신** (신규)
  - Socket.io-client 연결
  - 이벤트 송수신
- **멀티플레이어 UI** (신규)
  - 매칭 대기 화면
  - 타이머 표시
  - 이모티콘 UI
- **기존 AI 모드** (유지)
  - 로컬 게임 로직 유지

**Estimated LOC**: ~685-785 (485 existing + 200-300 new)

---

## Story Dependencies

```
FR-1 (모드 선택)
  └─> FR-2 (매칭 시스템)
        └─> FR-3 (게임 규칙)
              ├─> FR-4 (턴 시간 제한)
              ├─> FR-5 (실시간 동기화)
              ├─> FR-6 (연결 끊김 처리)
              └─> FR-8 (채팅 기능)

FR-7 (게임 기록) - Out of Scope
```

**Critical Path**:
1. FR-1 (모드 선택) - 게임 시작의 전제 조건
2. FR-2 (매칭 시스템) - 멀티플레이어의 핵심
3. FR-3 (게임 규칙) - 게임 로직
4. FR-5 (실시간 동기화) - 멀티플레이어의 필수 요소

**Optional Features**:
- FR-4 (턴 시간 제한) - 게임 플레이 향상
- FR-6 (연결 끊김 처리) - 안정성 향상
- FR-8 (채팅 기능) - 사용자 경험 향상

---

## Notes

- 모든 요구사항이 2개 유닛에 명확히 매핑됨
- 각 유닛의 작업 범위가 독립적이어서 병렬 개발 가능
- 통합 테스트 시 모든 요구사항을 함께 검증
- FR-7 (게임 기록)은 Out of Scope으로 작업 불필요
