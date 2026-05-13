# Component Methods

## Overview
이 문서는 각 컴포넌트의 메서드 시그니처, 입출력 타입, 고수준 목적을 정의합니다.

**Note**: 상세한 비즈니스 규칙 및 구현 로직은 Functional Design (CONSTRUCTION 단계)에서 정의됩니다.

---

## Server-Side Component Methods

### WebSocket Server (server.js)

#### `initializeServer(port: number): void`
**Purpose**: Express 및 Socket.io 서버 초기화

**Parameters**:
- `port`: 서버 포트 번호 (예: 3000)

**Returns**: void

**Side Effects**:
- HTTP 서버 시작
- Socket.io 서버 초기화
- 정적 파일 경로 설정

---

#### `getLocalNetworkIP(): string`
**Purpose**: 로컬 네트워크 IP 주소 자동 감지

**Parameters**: 없음

**Returns**: string (예: "192.168.1.100")

**Algorithm**: 
- `os.networkInterfaces()` 사용
- IPv4, 비-내부 인터페이스 필터링

---

#### `handleConnection(socket: Socket): void`
**Purpose**: 클라이언트 연결 이벤트 처리

**Parameters**:
- `socket`: Socket.io Socket 인스턴스

**Returns**: void

**Side Effects**:
- 소켓 이벤트 리스너 등록
- 연결 로그 출력

---

#### `handleDisconnection(socket: Socket): void`
**Purpose**: 클라이언트 연결 해제 이벤트 처리

**Parameters**:
- `socket`: Socket.io Socket 인스턴스

**Returns**: void

**Side Effects**:
- 매칭 큐에서 제거 (MatchMaker.removePlayerFromQueue)
- 진행 중인 게임 종료 (GameManager.handleDisconnect)
- 연결 해제 로그 출력

---

#### `routeEvent(socket: Socket, eventName: string, data: any): void`
**Purpose**: 클라이언트 이벤트를 적절한 핸들러로 라우팅

**Parameters**:
- `socket`: 이벤트를 보낸 소켓
- `eventName`: 이벤트 이름 (`player:join`, `card:submit` 등)
- `data`: 이벤트 페이로드

**Returns**: void

**Routing Logic**:
- `player:join` → MatchMaker.addPlayerToQueue()
- `card:submit` → GameManager.handleCardSubmit()
- `emoji:send` → GameManager.handleEmoji()

---

### Match Maker (match-maker.js)

#### `addPlayerToQueue(socketId: string): { player1: string, player2: string } | null`
**Purpose**: 플레이어를 매칭 큐에 추가하고 매칭 시도

**Parameters**:
- `socketId`: 플레이어 소켓 ID

**Returns**: 
- `{ player1, player2 }` - 매칭 성공 시
- `null` - 대기 중 (큐에 1명만 있음)

**Algorithm**:
```
1. waitingQueue.push(socketId)
2. if waitingQueue.length >= 2:
   - player1 = waitingQueue.shift()
   - player2 = waitingQueue.shift()
   - return { player1, player2 }
3. return null
```

---

#### `removePlayerFromQueue(socketId: string): boolean`
**Purpose**: 플레이어를 매칭 큐에서 제거

**Parameters**:
- `socketId`: 제거할 플레이어 소켓 ID

**Returns**: 
- `true` - 제거 성공
- `false` - 큐에 없음

**Algorithm**:
```
1. index = waitingQueue.indexOf(socketId)
2. if index !== -1:
   - waitingQueue.splice(index, 1)
   - return true
3. return false
```

---

#### `getQueueLength(): number`
**Purpose**: 현재 대기 중인 플레이어 수 반환

**Parameters**: 없음

**Returns**: number

---

### Game Manager (game-manager.js)

#### `createGame(player1SocketId: string, player2SocketId: string, io: SocketIO): string`
**Purpose**: 새로운 게임 세션 생성 및 초기화

**Parameters**:
- `player1SocketId`: 플레이어 1 소켓 ID
- `player2SocketId`: 플레이어 2 소켓 ID
- `io`: Socket.io 서버 인스턴스

**Returns**: string (게임 ID)

**Side Effects**:
- 게임 ID 생성 (UUID 또는 timestamp)
- 카드 덱 생성 및 셔플
- 각 플레이어에게 10장 배분
- 초기 HP 설정 (10)
- `games` Map에 저장
- `socketToGame` Map에 매핑 추가
- 양 플레이어에게 `game:start` 이벤트 전송

---

#### `createDeck(): Array<Card>`
**Purpose**: 52장의 표준 카드 덱 생성

**Parameters**: 없음

**Returns**: Array<Card>

**Algorithm**:
```
deck = []
for suit in ['♠', '♥', '♦', '♣']:
  for rank in ['A', '2', ..., 'K']:
    deck.push({ suit, rank, value: RANK_VALUES[rank] })
return deck
```

---

#### `shuffle(deck: Array<Card>): Array<Card>`
**Purpose**: 카드 덱을 무작위로 섞음 (Fisher-Yates)

**Parameters**:
- `deck`: 섞을 카드 배열

**Returns**: Array<Card> (섞인 덱)

**Algorithm**: Fisher-Yates shuffle

---

#### `handleCardSubmit(gameId: string, playerId: string, cardIndex: number, io: SocketIO): void`
**Purpose**: 플레이어의 카드 제출 처리 및 배틀 판정

**Parameters**:
- `gameId`: 게임 ID
- `playerId`: 플레이어 소켓 ID
- `cardIndex`: 제출할 카드 인덱스 (0-based)
- `io`: Socket.io 서버 인스턴스

**Returns**: void

**Side Effects**:
- 카드 제출 검증 (유효한 인덱스, 자신의 턴)
- 플레이어 패에서 카드 제거
- `submittedCard` 필드에 저장
- 양 플레이어 카드 제출 완료 시:
  - 배틀 판정 (compareCards)
  - HP 업데이트
  - 턴 증가
  - 양 플레이어에게 `turn:result` 이벤트 전송
  - 게임 종료 조건 확인
  - 다음 턴 타이머 시작

---

#### `compareCards(card1: Card, card2: Card): 1 | 2 | 0`
**Purpose**: 두 카드 비교 및 승자 판정

**Parameters**:
- `card1`: 플레이어 1 카드
- `card2`: 플레이어 2 카드

**Returns**:
- `1` - 플레이어 1 승리
- `2` - 플레이어 2 승리
- `0` - 무승부

**Algorithm**:
```
if card1.value > card2.value: return 1
if card1.value < card2.value: return 2
return 0
```

---

#### `startTurnTimer(gameId: string, currentPlayerId: string, io: SocketIO): void`
**Purpose**: 턴 타이머 시작 (10초 제한)

**Parameters**:
- `gameId`: 게임 ID
- `currentPlayerId`: 현재 턴 플레이어 소켓 ID
- `io`: Socket.io 서버 인스턴스

**Returns**: void

**Side Effects**:
- `setTimeout` 설정 (10초)
- 매 초마다 `timer:tick` 이벤트 전송 (선택 사항)
- 10초 초과 시 자동으로 랜덤 카드 제출

**Algorithm**:
```
remainingTime = 10
interval = setInterval(() => {
  remainingTime -= 1
  io.to(currentPlayerId).emit('timer:tick', { remainingTime })
  if remainingTime <= 0:
    clearInterval(interval)
    handleTimeoutCardSubmit(gameId, currentPlayerId)
}, 1000)

store interval in game.turnTimer
```

---

#### `handleTimeoutCardSubmit(gameId: string, playerId: string, io: SocketIO): void`
**Purpose**: 타임아웃 시 자동으로 랜덤 카드 제출

**Parameters**:
- `gameId`: 게임 ID
- `playerId`: 타임아웃된 플레이어 소켓 ID
- `io`: Socket.io 서버 인스턴스

**Returns**: void

**Side Effects**:
- 플레이어 패에서 랜덤 카드 선택
- `handleCardSubmit` 호출

**Algorithm**:
```
game = games.get(gameId)
player = game.player1.socketId === playerId ? game.player1 : game.player2
randomIndex = Math.floor(Math.random() * player.hand.length)
handleCardSubmit(gameId, playerId, randomIndex, io)
```

---

#### `checkGameEnd(gameId: string, io: SocketIO): boolean`
**Purpose**: 게임 종료 조건 확인

**Parameters**:
- `gameId`: 게임 ID
- `io`: Socket.io 서버 인스턴스

**Returns**: 
- `true` - 게임 종료됨
- `false` - 게임 계속

**End Conditions**:
- 어느 플레이어의 HP가 0
- 10턴 완료 (카드 소진)

**Side Effects** (게임 종료 시):
- 승패 판정
- 양 플레이어에게 `game:end` 이벤트 전송
- `games` Map에서 제거
- `socketToGame` Map에서 제거

---

#### `handleDisconnect(socketId: string, io: SocketIO): void`
**Purpose**: 플레이어 연결 끊김 처리

**Parameters**:
- `socketId`: 연결이 끊긴 플레이어 소켓 ID
- `io`: Socket.io 서버 인스턴스

**Returns**: void

**Side Effects**:
- 해당 플레이어가 속한 게임 찾기
- 게임 즉시 종료
- 상대방에게 `opponent:disconnected` 이벤트 전송
- 연결 끊긴 플레이어는 패배 처리
- 게임 데이터 정리

---

#### `handleEmoji(gameId: string, playerId: string, emoji: string, io: SocketIO): void`
**Purpose**: 이모티콘 전송 처리

**Parameters**:
- `gameId`: 게임 ID
- `playerId`: 이모티콘을 보낸 플레이어 소켓 ID
- `emoji`: 이모티콘 문자열 (👍, 😊, 😢, 😡, 🎉)
- `io`: Socket.io 서버 인스턴스

**Returns**: void

**Side Effects**:
- 이모티콘 검증 (허용된 5개 중 하나인지)
- 상대방에게 `emoji:received` 이벤트 전송

---

## Client-Side Component Methods

### Game Mode Selector (index.html)

#### `showModeSelection(): void`
**Purpose**: 모드 선택 화면 표시

**Parameters**: 없음

**Returns**: void

**Side Effects**:
- AI 대전 / 멀티플레이어 버튼 표시
- 기존 게임 화면 숨김

---

#### `selectAIMode(): void`
**Purpose**: AI 모드 선택 처리

**Parameters**: 없음

**Returns**: void

**Side Effects**:
- 모드 선택 화면 숨김
- 기존 `startGame()` 함수 호출 (로컬 AI 게임 시작)

---

#### `selectMultiplayerMode(): void`
**Purpose**: 멀티플레이어 모드 선택 처리

**Parameters**: 없음

**Returns**: void

**Side Effects**:
- 모드 선택 화면 숨김
- WebSocket 연결 시작 (`initializeWebSocket()`)
- 매칭 대기 화면 표시

---

### WebSocket Client (index.html)

#### `initializeWebSocket(serverUrl: string): void`
**Purpose**: Socket.io 클라이언트 초기화 및 연결

**Parameters**:
- `serverUrl`: 서버 URL (예: "http://192.168.1.100:3000")

**Returns**: void

**Side Effects**:
- `io()` 호출로 소켓 연결
- 이벤트 리스너 등록
- 연결 성공 시 `player:join` 이벤트 전송

---

#### `registerEventListeners(): void`
**Purpose**: 서버 이벤트 리스너 등록

**Parameters**: 없음

**Returns**: void

**Event Handlers**:
- `socket.on('match:found', handleMatchFound)`
- `socket.on('game:start', handleGameStart)`
- `socket.on('turn:waiting', handleTurnWaiting)`
- `socket.on('turn:result', handleTurnResult)`
- `socket.on('game:end', handleGameEnd)`
- `socket.on('timer:tick', handleTimerTick)`
- `socket.on('emoji:received', handleEmojiReceived)`
- `socket.on('opponent:disconnected', handleOpponentDisconnected)`
- `socket.on('disconnect', handleDisconnect)`
- `socket.on('connect_error', handleConnectError)`

---

#### `emitCardSubmit(cardIndex: number): void`
**Purpose**: 카드 제출 이벤트 전송

**Parameters**:
- `cardIndex`: 제출할 카드 인덱스

**Returns**: void

**Payload**:
```javascript
socket.emit('card:submit', { gameId, cardIndex })
```

---

#### `emitEmoji(emoji: string): void`
**Purpose**: 이모티콘 전송 이벤트 전송

**Parameters**:
- `emoji`: 이모티콘 문자열

**Returns**: void

**Payload**:
```javascript
socket.emit('emoji:send', { gameId, emoji })
```

---

#### `handleMatchFound(data: { gameId: string }): void`
**Purpose**: 매칭 완료 이벤트 처리

**Parameters**:
- `data.gameId`: 매칭된 게임 ID

**Returns**: void

**Side Effects**:
- 게임 ID 저장
- 매칭 대기 화면 숨김
- "매칭 완료! 게임 시작 중..." 메시지 표시

---

#### `handleGameStart(data: { gameId: string, hand: Array<Card>, isFirstPlayer: boolean }): void`
**Purpose**: 게임 시작 이벤트 처리

**Parameters**:
- `data.gameId`: 게임 ID
- `data.hand`: 초기 카드 패 (10장)
- `data.isFirstPlayer`: 선공 여부

**Returns**: void

**Side Effects**:
- 게임 화면 표시
- 플레이어 패 렌더링
- HP 초기화 (10 / 10)
- 턴 표시 (1 / 10)

---

#### `handleTurnResult(data: { playerCard: Card, opponentCard: Card, winner: 1|2|0, myNewHp: number, opponentNewHp: number, turn: number }): void`
**Purpose**: 턴 결과 이벤트 처리

**Parameters**:
- `data`: 턴 결과 데이터

**Returns**: void

**Side Effects**:
- 배틀 영역에 카드 표시
- 결과 메시지 표시 (승/패/무)
- HP 업데이트
- 턴 수 업데이트

---

#### `handleGameEnd(data: { winner: 1|2|0, reason: string, finalHp: { player1: number, player2: number } }): void`
**Purpose**: 게임 종료 이벤트 처리

**Parameters**:
- `data`: 게임 종료 데이터

**Returns**: void

**Side Effects**:
- 게임 오버 오버레이 표시
- 승패 메시지 표시
- 최종 점수 표시

---

#### `handleTimerTick(data: { remainingTime: number }): void`
**Purpose**: 타이머 업데이트 이벤트 처리

**Parameters**:
- `data.remainingTime`: 남은 시간 (초)

**Returns**: void

**Side Effects**:
- 타이머 UI 업데이트

---

#### `handleEmojiReceived(data: { emoji: string }): void`
**Purpose**: 이모티콘 수신 이벤트 처리

**Parameters**:
- `data.emoji`: 수신한 이모티콘

**Returns**: void

**Side Effects**:
- 화면에 이모티콘 표시 (3초간)
- 애니메이션 효과

---

#### `handleOpponentDisconnected(): void`
**Purpose**: 상대방 연결 끊김 이벤트 처리

**Parameters**: 없음

**Returns**: void

**Side Effects**:
- "상대방 연결 끊김" 메시지 표시
- 게임 종료 처리

---

### UI Renderer (index.html)

#### `renderModeSelection(): void`
**Purpose**: 모드 선택 화면 렌더링

**Parameters**: 없음

**Returns**: void

**DOM Updates**:
- 모드 선택 버튼 2개 표시
- 기존 게임 화면 숨김

---

#### `renderMatchingScreen(): void`
**Purpose**: 매칭 대기 화면 렌더링

**Parameters**: 없음

**Returns**: void

**DOM Updates**:
- "매칭 중..." 메시지 표시
- 로딩 애니메이션

---

#### `renderPlayerHand(hand: Array<Card>): void`
**Purpose**: 플레이어 패 렌더링 (기존 함수 유지)

**Parameters**:
- `hand`: 카드 배열

**Returns**: void

**DOM Updates**:
- 카드 요소 생성 및 표시

---

#### `renderTimer(remainingTime: number): void`
**Purpose**: 턴 타이머 렌더링

**Parameters**:
- `remainingTime`: 남은 시간 (초)

**Returns**: void

**DOM Updates**:
- 타이머 표시 (예: "⏱️ 8초")
- 5초 이하일 때 빨간색 강조

---

#### `renderEmojiButton(): void`
**Purpose**: 이모티콘 버튼 렌더링

**Parameters**: 없음

**Returns**: void

**DOM Updates**:
- 5개 이모티콘 버튼 표시 (👍😊😢😡🎉)

---

#### `showEmojiAnimation(emoji: string): void`
**Purpose**: 수신한 이모티콘 애니메이션 표시

**Parameters**:
- `emoji`: 이모티콘 문자열

**Returns**: void

**DOM Updates**:
- 화면 중앙에 이모티콘 크게 표시
- 3초 후 사라짐

---

### Local AI (index.html)

#### `chooseAiCard(playerCard: Card): number`
**Purpose**: AI 카드 선택 전략 (기존 함수 유지)

**Parameters**:
- `playerCard`: 플레이어가 제출한 카드

**Returns**: number (AI 패에서 선택한 카드 인덱스)

**Algorithm**: (기존 알고리즘 유지)
1. 이길 수 있는 카드 중 가장 낮은 값 선택
2. 없으면 가장 낮은 카드 버림

---

## Method Count Summary

| Component | Method Count |
|-----------|--------------|
| **WebSocket Server** | 6 |
| **Match Maker** | 3 |
| **Game Manager** | 10 |
| **Game Mode Selector** | 3 |
| **WebSocket Client** | 10 |
| **UI Renderer** | 6 |
| **Local AI** | 1 (기존) |
| **Total** | 39 methods |

---

## Notes

- 상세한 비즈니스 로직은 CONSTRUCTION 단계의 Functional Design에서 정의됩니다
- 모든 메서드는 고수준 시그니처만 정의되었으며, 구현 세부사항은 Code Generation에서 작성됩니다
- 에러 핸들링은 기본 수준 (`console.error` + 사용자 알림)
