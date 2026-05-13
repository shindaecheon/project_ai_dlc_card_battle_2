# Server Implementation Summary - Unit 1

## Overview
Node.js + Express + Socket.io 기반 멀티플레이어 카드 배틀 게임 서버 구현 완료

**구현 날짜**: 2026-05-13

---

## Generated Files

### Application Code (workspace root)

#### 1. `server/package.json` (~20 LOC)
**Purpose**: 프로젝트 의존성 및 스크립트 정의

**Dependencies**:
- `express` (^4.18.0) - HTTP 서버
- `socket.io` (^4.6.0) - WebSocket 서버

**DevDependencies**:
- `nodemon` (^3.0.0) - 개발 시 자동 재시작

**Scripts**:
- `npm start` - 서버 시작
- `npm run dev` - 개발 모드 (nodemon)

---

#### 2. `server/match-maker.js` (~60 LOC)
**Purpose**: FIFO 매칭 큐 관리

**Exports**:
- `addPlayer(socketId)` - 플레이어를 매칭 큐에 추가
- `checkMatch()` - 2명 이상일 때 자동 매칭 생성
- `removePlayer(socketId)` - 큐에서 플레이어 제거
- `getQueueSize()` - 대기 중인 플레이어 수 조회

**Data Structure**:
```javascript
waitingQueue: Array<string> // Socket ID 배열
```

**Logic**:
- FIFO (First-In-First-Out) 방식
- 2명이 모이면 자동 매칭
- 매칭 성공 시 큐에서 제거

**Stories Implemented**: FR-2 (매칭 시스템)

---

#### 3. `server/game-manager.js` (~300 LOC)
**Purpose**: 게임 세션 관리 및 게임 로직 실행

**Constants**:
```javascript
SUITS = ['♠', '♥', '♦', '♣']
RANKS = ['A', '2', '3', ..., 'K']
RANK_VALUES = { 'A': 1, '2': 2, ..., 'K': 13 }
INITIAL_HP = 10
INITIAL_CARDS = 10
MAX_TURNS = 10
```

**Data Structure**:
```javascript
games: Map<gameId, {
  gameId: string,
  player1: {
    socketId: string,
    hand: Array<Card>,
    hp: number,
    submittedCard: Card | null
  },
  player2: { ... },
  turn: number,
  turnTimer: Interval | null,
  status: 'playing' | 'ended'
}>
```

**Exports**:
- `createGame(gameId, player1SocketId, player2SocketId)` - 게임 초기화
- `handleCardSubmit(gameId, socketId, cardIndex)` - 카드 제출 처리
- `endGame(gameId, reason)` - 게임 강제 종료
- `getGame(gameId)` - 게임 상태 조회
- `deleteGame(gameId)` - 게임 삭제
- `getAllGames()` - 모든 게임 목록 조회

**Internal Functions**:
- `createDeck()` - 52장 카드 덱 생성
- `shuffle(deck)` - Fisher-Yates 셔플
- `compareCards(card1, card2)` - 카드 비교 (승자 결정)
- `resolveBattle(gameId)` - 배틀 판정 및 HP 계산

**Game Logic**:
1. 게임 생성 시 52장 덱 셔플 후 각 플레이어에게 10장 배분
2. 카드 제출 시 유효성 검증 (인덱스, 중복 제출)
3. 두 플레이어 모두 제출 시 배틀 판정
4. 카드 값 비교: 높은 값이 승리, 패자 HP -1
5. 게임 종료 조건: HP 0 이하 또는 10턴 완료
6. 최종 승자 결정: HP 비교 (무승부 가능)

**Stories Implemented**: FR-3 (게임 규칙), FR-5 (실시간 동기화 - 상태 관리)

---

#### 4. `server/server.js` (~350 LOC)
**Purpose**: Express + Socket.io 메인 서버 및 WebSocket 이벤트 핸들러

**Server Setup**:
- Express HTTP 서버
- Socket.io WebSocket 서버
- 정적 파일 제공 (`../` 경로로 index.html 제공)
- 포트: 3000 (환경변수로 변경 가능)

**Local IP Detection**:
```javascript
getLocalIP() // os.networkInterfaces() 사용
```
- IPv4, non-internal 주소 자동 감지
- 콘솔에 로컬 및 네트워크 접속 URL 출력

**WebSocket Event Handlers**:

1. **`connection`** - 클라이언트 연결
   - Socket ID 로깅

2. **`player:join`** - 매칭 큐 진입
   - `matchMaker.addPlayer(socketId)` 호출
   - 매칭 확인 (`checkMatch()`)
   - 매칭 성공 시:
     - 게임 생성 (`createGame()`)
     - `match:found` 이벤트 전송 (양쪽)
     - `game:start` 이벤트 전송 (양쪽, hand 포함)
     - 타이머 시작 (`startTurnTimer()`)

3. **`card:submit`** - 카드 제출
   - `{ gameId, cardIndex }` 수신
   - `handleCardSubmit()` 호출
   - 유효성 검증 실패 시 `error` 이벤트 전송
   - 대기 중이면 `turn:waiting` 전송
   - 배틀 완료 시:
     - `turn:result` 전송 (양쪽, 관점에 맞게 조정)
     - 게임 종료 시 `game:end` 전송 (양쪽)
     - 계속 시 다음 턴 타이머 시작

4. **`emoji:send`** - 이모티콘 전송
   - `{ gameId, emoji }` 수신
   - 허용된 이모티콘 검증 (`['👍', '😊', '😢', '😡', '🎉']`)
   - 상대방에게 `emoji:received` 전송

5. **`disconnect`** - 연결 끊김
   - 매칭 큐에서 제거 (`removePlayer()`)
   - 진행 중인 게임 찾기
   - 상대방에게 `opponent:disconnected` 전송
   - 게임 종료 및 삭제

**Turn Timer**:
```javascript
startTurnTimer(gameId)
```
- 10초 카운트다운
- 1초마다 `timer:tick` 전송 (양쪽)
- 타임아웃 시:
  - 제출하지 않은 플레이어의 랜덤 카드 자동 제출
  - 배틀 결과 전송

**Stories Implemented**: 
- FR-2 (매칭 시스템 - 이벤트 핸들링)
- FR-3 (게임 규칙 - 이벤트 핸들링)
- FR-4 (턴 시간 제한)
- FR-5 (실시간 동기화)
- FR-6 (연결 끊김 처리)
- FR-8 (이모티콘 중계)
- NFR-4 (로컬 네트워크 - IP 감지)

---

## WebSocket Protocol Summary

### Client → Server Events

| Event | Payload | Purpose |
|-------|---------|---------|
| `player:join` | 없음 | 매칭 큐 진입 |
| `card:submit` | `{ gameId, cardIndex }` | 카드 제출 |
| `emoji:send` | `{ gameId, emoji }` | 이모티콘 전송 |

### Server → Client Events

| Event | Payload | Purpose |
|-------|---------|---------|
| `match:found` | `{ gameId }` | 매칭 완료 알림 |
| `game:start` | `{ gameId, hand, isFirstPlayer }` | 게임 시작 |
| `turn:waiting` | 없음 | 상대방 대기 중 |
| `turn:result` | `{ playerCard, opponentCard, winner, newHP }` | 배틀 결과 |
| `game:end` | `{ winner, reason, finalHP }` | 게임 종료 |
| `timer:tick` | `{ remainingTime }` | 타이머 업데이트 |
| `emoji:received` | `{ emoji }` | 이모티콘 수신 |
| `opponent:disconnected` | 없음 | 상대방 연결 끊김 |
| `error` | `{ message }` | 에러 메시지 |

---

## Installation and Execution

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Start Server
```bash
npm start
```

또는 개발 모드 (nodemon):
```bash
npm run dev
```

### 3. Console Output
서버 시작 시 다음과 같은 정보가 출력됨:
```
============================================================
🎮  Card Battle Server - 멀티플레이어 카드 배틀 게임
============================================================
✅ 서버가 시작되었습니다!

📡 접속 주소:
   로컬:     http://localhost:3000
   네트워크: http://192.168.1.100:3000

💡 다른 기기에서 접속하려면 네트워크 주소를 사용하세요.
💡 같은 Wi-Fi 네트워크에 연결되어 있어야 합니다.
============================================================
```

### 4. Access
- **로컬 접속**: `http://localhost:3000`
- **네트워크 접속**: `http://<SERVER_IP>:3000` (다른 기기에서)

---

## Testing Strategy

### Unit Testing (선택 사항)
- **match-maker.js**: FIFO 큐 로직 테스트
  - `addPlayer()`, `checkMatch()`, `removePlayer()` 함수
- **game-manager.js**: 게임 로직 테스트
  - `createDeck()`, `shuffle()`, `compareCards()` 함수
  - 배틀 판정 및 HP 계산

### Integration Testing
1. 서버 시작
2. 2개 브라우저 탭 또는 다른 기기에서 접속
3. 매칭 및 게임 플레이 시나리오 테스트:
   - 매칭 큐 진입 → 자동 매칭
   - 게임 시작 → 카드 제출 → 배틀 결과
   - 10초 타이머 작동 확인
   - 타임아웃 시 자동 카드 제출
   - 게임 종료 조건 (HP 0 또는 10턴)
   - 연결 끊김 처리
   - 이모티콘 전송 및 수신

### Manual Testing Checklist
- [ ] 서버 정상 시작
- [ ] 로컬 IP 자동 감지 및 출력
- [ ] 정적 파일 제공 (index.html 접속 가능)
- [ ] 2명 매칭 성공
- [ ] 게임 시작 및 카드 배분
- [ ] 카드 제출 및 배틀 판정
- [ ] 10초 타이머 작동
- [ ] 타임아웃 자동 카드 제출
- [ ] 게임 종료 (HP 0)
- [ ] 게임 종료 (10턴 완료)
- [ ] 연결 끊김 감지 및 처리
- [ ] 이모티콘 전송

---

## Code Quality

### Strengths
- ✅ 모듈화: 3개 파일로 책임 분리 (server, match-maker, game-manager)
- ✅ 명확한 함수명 및 주석
- ✅ 서버 사이드 게임 로직 검증 (치팅 방지)
- ✅ 로깅: 모든 주요 이벤트 로깅
- ✅ 에러 처리: 유효성 검증 및 에러 응답

### Limitations (프로토타입 수준)
- ⚠️ 인메모리 Map 사용 (영속성 없음)
- ⚠️ 테스트 코드 없음
- ⚠️ Rate limiting 없음
- ⚠️ 입력 검증 최소 수준
- ⚠️ 확장성 고려하지 않음 (10명 미만 동시 접속)

---

## Security Considerations

### Implemented
- ✅ 서버 사이드 게임 로직 실행 (클라이언트 신뢰 안 함)
- ✅ 카드 제출 유효성 검증 (인덱스 범위, 중복 제출)
- ✅ 이모티콘 허용 목록 검증

### Not Implemented (프로토타입)
- ❌ HTTPS (로컬 네트워크)
- ❌ 사용자 인증
- ❌ Rate limiting
- ❌ 입력 sanitization (심화)

---

## Dependencies

### Runtime
- Node.js v18+ (LTS)
- npm or yarn

### External Packages
- `express` (^4.18.0)
- `socket.io` (^4.6.0)

### DevDependencies
- `nodemon` (^3.0.0)

---

## Next Steps

1. **Unit 2 (Client Modification)**: `index.html` 수정
   - WebSocket 클라이언트 추가
   - 모드 선택 UI
   - 멀티플레이어 게임 화면
   - 타이머 UI
   - 이모티콘 UI

2. **Integration Testing**: 서버와 클라이언트 통합 테스트

3. **Build and Test**: 전체 시스템 빌드 및 테스트 지침 생성

---

## Notes

- 서버는 완전히 독립적으로 개발됨
- WebSocket 프로토콜이 명확히 정의되어 있어 클라이언트와 독립적으로 테스트 가능
- 프로토타입 수준이므로 빠른 구현을 우선시함
- 향후 프로덕션 배포 시 보안, 확장성, 영속성 고려 필요
