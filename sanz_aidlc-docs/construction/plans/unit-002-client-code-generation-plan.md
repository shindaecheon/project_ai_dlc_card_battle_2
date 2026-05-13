# Code Generation Plan - Unit 2: Client Modification

## Unit Information
- **Unit ID**: UNIT-002
- **Unit Name**: Client Modification
- **Type**: Frontend Application (Browser)
- **Location**: `index.html` in workspace root

## Context

### Stories Implemented by This Unit
From `unit-of-work-story-map.md`:
- **FR-1**: 게임 모드 선택 (AI / 멀티플레이어)
- **FR-2**: 매칭 시스템 (클라이언트 사이드 - 매칭 요청 및 대기 UI)
- **FR-3**: 게임 규칙 (UI 렌더링)
- **FR-4**: 턴 시간 제한 (타이머 표시)
- **FR-5**: 실시간 게임 동기화 (이벤트 수신)
- **FR-6**: 연결 끊김 처리 (알림 표시)
- **FR-8**: 채팅 기능 (이모티콘 UI)

### Unit Dependencies
From `unit-of-work-dependency.md`:
- **Depends on Unit 1**: WebSocket API 제공 (서버)
- **External Dependencies**: socket.io-client (서버에서 `/socket.io/socket.io.js` 제공)
- **Internal Dependencies**: None (단일 파일)

### Expected Interfaces
From `unit-of-work-dependency.md`:
**Client → Server Events**:
- `player:join`
- `card:submit { gameId, cardIndex }`
- `emoji:send { gameId, emoji }`

**Server → Client Events**:
- `match:found { gameId }`
- `game:start { gameId, hand, isFirstPlayer }`
- `turn:result { playerCard, opponentCard, winner, newHP }`
- `game:end { winner, reason, finalHP }`
- `timer:tick { remainingTime }`
- `emoji:received { emoji }`
- `opponent:disconnected`

### Service Boundaries
From `unit-of-work.md`:
- 게임 모드 선택 (AI / 멀티플레이어)
- WebSocket 서버 연결
- 서버 이벤트 처리
- UI 렌더링 (모드 선택, 매칭 대기, 게임 화면, 타이머, 이모티콘)
- 로컬 AI 모드 유지 (기존 기능)

---

## Files to Modify

### Workspace Root: `/home/ec2-user/table-order`

**Application Code** (workspace root - **BROWNFIELD**):
1. `index.html` - 기존 파일 수정 (485 LOC → ~685-785 LOC)
   - Socket.io-client 스크립트 추가
   - 모드 선택 UI 추가
   - WebSocket 연결 코드 추가
   - 멀티플레이어 이벤트 핸들러 추가
   - 타이머 UI 추가
   - 이모티콘 UI 추가
   - 기존 AI 모드 유지

**Documentation** (aidlc-docs/):
2. `aidlc-docs/construction/unit-002-client/code/client-implementation-summary.md` - 구현 요약

---

## Code Generation Steps

### Step 1: Backup Original File
**Description**: 기존 `index.html` 백업 (안전을 위해)

**Actions**:
- [x] Read current `index.html` to understand structure
- [x] Note: 기존 파일은 Git으로 관리되므로 별도 백업 불필요

**Output**: 기존 구조 파악 완료

**Stories**: N/A (준비 작업)

---

### Step 2: Add Socket.io Client Script
**Description**: `index.html`에 Socket.io-client 라이브러리 추가

**Actions**:
- [x] `<head>` 섹션에 Socket.io-client CDN 스크립트 추가
  ```html
  <script src="/socket.io/socket.io.js"></script>
  ```
  (서버에서 자동 제공)

**Output**: Socket.io-client 로드 가능

**Stories**: N/A (기반 작업)

---

### Step 3: Add Mode Selection UI
**Description**: 게임 시작 시 모드 선택 화면 추가

**Actions**:
- [x] HTML: 모드 선택 화면 추가
  ```html
  <div id="mode-selection" class="mode-selection">
    <h1>카드 배틀</h1>
    <button id="ai-mode-btn">AI 대전</button>
    <button id="multiplayer-mode-btn">멀티플레이어</button>
  </div>
  ```
- [x] CSS: 모드 선택 버튼 스타일링
- [x] JavaScript: 모드 선택 이벤트 핸들러
  ```javascript
  document.getElementById('ai-mode-btn').onclick = startAIMode;
  document.getElementById('multiplayer-mode-btn').onclick = startMultiplayerMode;
  ```

**Output**: 모드 선택 화면

**Stories**: FR-1 (게임 모드 선택)

---

### Step 4: Add Matching UI
**Description**: 멀티플레이어 매칭 대기 화면 추가

**Actions**:
- [x] HTML: 매칭 대기 화면 추가
  ```html
  <div id="matching-screen" class="matching-screen" style="display:none;">
    <h2>매칭 중...</h2>
    <p>상대방을 찾고 있습니다</p>
  </div>
  ```
- [x] CSS: 로딩 애니메이션 스타일링
- [x] JavaScript: 매칭 화면 표시/숨김 함수

**Output**: 매칭 대기 화면

**Stories**: FR-2 (매칭 시스템 - 클라이언트)

---

### Step 5: Add WebSocket Connection
**Description**: WebSocket 연결 및 기본 이벤트 핸들러 추가

**Actions**:
- [x] JavaScript: Socket.io 초기화
  ```javascript
  let socket = null;
  let gameMode = null; // 'ai' or 'multiplayer'
  let gameId = null;
  
  function initWebSocket() {
    socket = io(); // 자동으로 window.location.origin에 연결
    
    socket.on('connect', () => {
      console.log('서버 연결됨');
    });
    
    socket.on('disconnect', () => {
      console.log('서버 연결 끊김');
    });
  }
  ```

**Output**: WebSocket 연결 기능

**Stories**: FR-5 (실시간 동기화 - 연결)

---

### Step 6: Add Multiplayer Event Handlers
**Description**: 서버 이벤트 핸들러 추가

**Actions**:
- [x] JavaScript: 매칭 이벤트 핸들러
  ```javascript
  socket.on('match:found', (data) => {
    gameId = data.gameId;
    hideMatchingScreen();
  });
  
  socket.on('game:start', (data) => {
    gameId = data.gameId;
    playerHand = data.hand;
    isFirstPlayer = data.isFirstPlayer;
    renderMultiplayerGame();
  });
  ```
- [x] JavaScript: 게임 진행 이벤트 핸들러
  ```javascript
  socket.on('turn:result', (data) => {
    showBattleResult(data);
    updateHP(data.newHP);
  });
  
  socket.on('game:end', (data) => {
    showGameEnd(data);
  });
  ```
- [x] JavaScript: 타이머 이벤트 핸들러
  ```javascript
  socket.on('timer:tick', (data) => {
    updateTimer(data.remainingTime);
  });
  ```
- [x] JavaScript: 이모티콘 이벤트 핸들러
  ```javascript
  socket.on('emoji:received', (data) => {
    showEmoji(data.emoji);
  });
  ```
- [x] JavaScript: 연결 끊김 이벤트 핸들러
  ```javascript
  socket.on('opponent:disconnected', () => {
    alert('상대방의 연결이 끊어졌습니다.');
    returnToModeSelection();
  });
  ```

**Output**: 모든 서버 이벤트 처리

**Stories**: FR-2, FR-3, FR-4, FR-5, FR-6, FR-8

---

### Step 7: Add Timer UI
**Description**: 턴 타이머 표시 UI 추가

**Actions**:
- [x] HTML: 타이머 디스플레이 추가
  ```html
  <div id="turn-timer" style="display:none;">
    남은 시간: <span id="timer-value">10</span>초
  </div>
  ```
- [x] CSS: 타이머 스타일링 (3초 이하 빨간색)
- [x] JavaScript: 타이머 업데이트 함수
  ```javascript
  function updateTimer(remainingTime) {
    document.getElementById('timer-value').textContent = remainingTime;
    if (remainingTime <= 3) {
      document.getElementById('turn-timer').classList.add('warning');
    }
  }
  ```

**Output**: 타이머 UI

**Stories**: FR-4 (턴 시간 제한)

---

### Step 8: Add Emoji UI
**Description**: 이모티콘 전송 UI 추가

**Actions**:
- [x] HTML: 이모티콘 버튼 추가
  ```html
  <div id="emoji-buttons" style="display:none;">
    <button onclick="sendEmoji('👍')">👍</button>
    <button onclick="sendEmoji('😊')">😊</button>
    <button onclick="sendEmoji('😢')">😢</button>
    <button onclick="sendEmoji('😡')">😡</button>
    <button onclick="sendEmoji('🎉')">🎉</button>
  </div>
  <div id="emoji-display"></div>
  ```
- [x] CSS: 이모티콘 버튼 및 애니메이션 스타일링
- [x] JavaScript: 이모티콘 전송 함수
  ```javascript
  function sendEmoji(emoji) {
    socket.emit('emoji:send', { gameId, emoji });
  }
  
  function showEmoji(emoji) {
    const display = document.getElementById('emoji-display');
    display.textContent = emoji;
    display.style.display = 'block';
    setTimeout(() => {
      display.style.display = 'none';
    }, 3000);
  }
  ```

**Output**: 이모티콘 UI 및 애니메이션

**Stories**: FR-8 (채팅 기능)

---

### Step 9: Modify Game Logic for Multiplayer
**Description**: 기존 게임 로직을 AI/멀티플레이어 모드로 분기

**Actions**:
- [x] JavaScript: 게임 모드 변수 추가
- [x] JavaScript: `playCard()` 함수 수정
  ```javascript
  function playCard(cardIndex) {
    if (gameMode === 'ai') {
      // 기존 AI 로직
      playCardAI(cardIndex);
    } else if (gameMode === 'multiplayer') {
      // 서버에 카드 제출
      socket.emit('card:submit', { gameId, cardIndex });
      // UI 업데이트는 turn:result 이벤트에서 처리
    }
  }
  ```
- [x] JavaScript: AI 모드 함수 분리
  ```javascript
  function startAIMode() {
    gameMode = 'ai';
    hideAllScreens();
    startGame(); // 기존 startGame 함수
  }
  
  function startMultiplayerMode() {
    gameMode = 'multiplayer';
    initWebSocket();
    hideAllScreens();
    showMatchingScreen();
    socket.emit('player:join');
  }
  ```

**Output**: AI/멀티플레이어 모드 분기

**Stories**: FR-1, FR-3

---

### Step 10: Update UI Rendering
**Description**: 멀티플레이어 게임 화면 렌더링 함수 추가

**Actions**:
- [x] JavaScript: 멀티플레이어 게임 렌더링
  ```javascript
  function renderMultiplayerGame() {
    showGameContainer();
    renderHand(playerHand);
    updateHP(playerHp, opponentHp);
    updateTurnInfo(`턴 ${turn}`);
    showTimerUI();
    showEmojiButtons();
  }
  ```
- [x] JavaScript: 배틀 결과 표시
  ```javascript
  function showBattleResult(data) {
    displayCard(data.playerCard, 'player');
    displayCard(data.opponentCard, 'opponent');
    // 승패 표시
    setTimeout(() => {
      clearBattleCards();
    }, 2000);
  }
  ```

**Output**: 멀티플레이어 UI 렌더링

**Stories**: FR-3, FR-5

---

### Step 11: Add Screen Management
**Description**: 화면 전환 관리 함수 추가

**Actions**:
- [x] JavaScript: 화면 전환 유틸리티
  ```javascript
  function hideAllScreens() {
    document.getElementById('mode-selection').style.display = 'none';
    document.getElementById('matching-screen').style.display = 'none';
    document.querySelector('.game-container').style.display = 'none';
  }
  
  function showModeSelection() {
    hideAllScreens();
    document.getElementById('mode-selection').style.display = 'block';
  }
  
  function showMatchingScreen() {
    hideAllScreens();
    document.getElementById('matching-screen').style.display = 'flex';
  }
  
  function showGameContainer() {
    hideAllScreens();
    document.querySelector('.game-container').style.display = 'block';
  }
  
  function returnToModeSelection() {
    gameMode = null;
    gameId = null;
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    showModeSelection();
  }
  ```

**Output**: 화면 전환 관리

**Stories**: FR-1

---

### Step 12: Update Initial Load
**Description**: 페이지 로드 시 모드 선택 화면 표시

**Actions**:
- [x] JavaScript: DOMContentLoaded 이벤트 수정
  ```javascript
  document.addEventListener('DOMContentLoaded', () => {
    showModeSelection();
  });
  ```
- [x] HTML: 초기 게임 컨테이너 숨김
  ```html
  <div class="game-container" style="display:none;">
  ```

**Output**: 초기 화면 설정

**Stories**: FR-1

---

### Step 13: Documentation Generation
**Description**: 클라이언트 구현 요약 문서 생성

**Actions**:
- [x] Create `aidlc-docs/construction/unit-002-client/` directory
- [x] Create `aidlc-docs/construction/unit-002-client/code/` subdirectory
- [x] Generate `aidlc-docs/construction/unit-002-client/code/client-implementation-summary.md`:
  - 수정 내역 요약
  - 추가된 UI 컴포넌트
  - WebSocket 이벤트 핸들러 목록
  - 모드 선택 플로우
  - 테스트 지침

**Output**: `aidlc-docs/construction/unit-002-client/code/client-implementation-summary.md`

**Stories**: N/A (문서화)

---

## Summary

**Total Steps**: 13

**Modification Type**: Brownfield (기존 파일 수정)

**Estimated LOC Addition**: ~200-300 LOC
- Socket.io-client 연결: ~50 LOC
- 모드 선택 UI: ~40 LOC
- 매칭 UI: ~30 LOC
- WebSocket 이벤트 핸들러: ~80 LOC
- 타이머 UI: ~20 LOC
- 이모티콘 UI: ~40 LOC
- 화면 관리: ~40 LOC

**Total LOC**: ~685-785 (485 existing + 200-300 new)

**Stories Coverage**:
- ✅ FR-1: 게임 모드 선택
- ✅ FR-2: 매칭 시스템 (클라이언트)
- ✅ FR-3: 게임 규칙 (UI)
- ✅ FR-4: 턴 시간 제한 (UI)
- ✅ FR-5: 실시간 게임 동기화 (이벤트 수신)
- ✅ FR-6: 연결 끊김 처리 (알림)
- ✅ FR-8: 채팅 기능 (이모티콘 UI)

**Brownfield Notes**:
- 기존 AI 모드 코드 유지
- 기존 카드 렌더링 함수 재사용
- 기존 스타일링 확장

**Next Step**: Integration Testing (Unit 1 + Unit 2)
