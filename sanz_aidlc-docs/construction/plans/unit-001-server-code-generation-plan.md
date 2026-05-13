# Code Generation Plan - Unit 1: Server Implementation

## Unit Information
- **Unit ID**: UNIT-001
- **Unit Name**: Server Implementation
- **Type**: Backend Service (Node.js)
- **Location**: `server/` directory in workspace root

## Context

### Stories Implemented by This Unit
From `unit-of-work-story-map.md`:
- **FR-2**: 매칭 시스템 (서버 사이드)
- **FR-3**: 게임 규칙 (서버 사이드 로직)
- **FR-4**: 턴 시간 제한 (타이머 관리)
- **FR-5**: 실시간 게임 동기화 (이벤트 브로드캐스트)
- **FR-6**: 연결 끊김 처리 (연결 감지)
- **FR-8**: 채팅 기능 (이모티콘 중계)

### Unit Dependencies
From `unit-of-work-dependency.md`:
- **External Dependencies**: express (^4.18.0), socket.io (^4.6.0)
- **Internal Dependencies**: None (모든 모듈이 이 유닛 내부)
- **Provides to Unit 2**: WebSocket API, Static file serving

### Expected Interfaces
From `unit-of-work-dependency.md`:
**Server → Client Events**:
- `match:found { gameId }`
- `game:start { gameId, hand, isFirstPlayer }`
- `turn:result { playerCard, opponentCard, winner, newHP }`
- `game:end { winner, reason, finalHP }`
- `timer:tick { remainingTime }`
- `emoji:received { emoji }`
- `opponent:disconnected`

**Client → Server Events**:
- `player:join`
- `card:submit { gameId, cardIndex }`
- `emoji:send { gameId, emoji }`

### Service Boundaries
From `unit-of-work.md`:
- WebSocket 서버 관리 (Express + Socket.io)
- FIFO 매칭 큐 관리
- 게임 세션 관리 (인메모리 Map)
- 게임 로직 실행 (카드 비교, HP 계산)
- 실시간 동기화 (이벤트 브로드캐스트)
- 타이머 관리 (10초 턴 타이머)
- 로컬 네트워크 지원 (IP 감지)

---

## Files to Generate

### Workspace Root: `/home/ec2-user/table-order`

**Application Code** (workspace root):
1. `server/server.js` - 메인 서버 (Express + Socket.io 초기화, 이벤트 라우팅)
2. `server/match-maker.js` - 매칭 시스템 (FIFO 큐)
3. `server/game-manager.js` - 게임 로직 (게임 생성, 배틀 판정, 타이머)
4. `server/package.json` - 의존성 관리

**Documentation** (aidlc-docs/):
5. `aidlc-docs/construction/unit-001-server/code/server-implementation-summary.md` - 구현 요약

---

## Code Generation Steps

### Step 1: Project Structure Setup
**Description**: `server/` 디렉토리 생성 및 초기 구조 설정

**Actions**:
- [x] Create `server/` directory in workspace root
- [x] Verify directory structure

**Output**: Directory structure ready

**Stories**: N/A (기반 작업)

---

### Step 2: Package Configuration Generation
**Description**: `server/package.json` 생성 - 의존성 및 스크립트 정의

**Actions**:
- [x] Generate `server/package.json`:
  - Package name: "card-battle-server"
  - Main: "server.js"
  - Scripts: `"start": "node server.js"`, `"dev": "nodemon server.js"`
  - Dependencies: express (^4.18.0), socket.io (^4.6.0)
  - DevDependencies: nodemon (^3.0.0)
  - Node version: >=18.0.0

**Output**: `server/package.json`

**Stories**: N/A (설정 파일)

---

### Step 3: Match Maker Module Generation
**Description**: `server/match-maker.js` 생성 - FIFO 매칭 큐 구현

**Actions**:
- [x] Generate `server/match-maker.js`:
  - FIFO queue 구현 (Array 기반)
  - `addPlayer(socketId)` - 큐에 플레이어 추가
  - `checkMatch()` - 2명 이상일 때 매칭 생성, 큐에서 제거
  - `removePlayer(socketId)` - 연결 끊김 시 큐에서 제거
  - Export functions

**Implementation Details**:
```javascript
const waitingQueue = [];

function addPlayer(socketId) {
  if (!waitingQueue.includes(socketId)) {
    waitingQueue.push(socketId);
  }
}

function checkMatch() {
  if (waitingQueue.length >= 2) {
    const player1 = waitingQueue.shift();
    const player2 = waitingQueue.shift();
    return { player1, player2 };
  }
  return null;
}

function removePlayer(socketId) {
  const index = waitingQueue.indexOf(socketId);
  if (index !== -1) {
    waitingQueue.splice(index, 1);
  }
}

module.exports = { addPlayer, checkMatch, removePlayer };
```

**Output**: `server/match-maker.js` (~50-100 LOC)

**Stories**: FR-2 (매칭 시스템 - 서버 사이드)

---

### Step 4: Game Manager Module Generation
**Description**: `server/game-manager.js` 생성 - 게임 로직 구현

**Actions**:
- [x] Generate `server/game-manager.js`:
  - 상수 정의 (SUITS, RANKS, RANK_VALUES, INITIAL_HP, INITIAL_CARDS, TURN_TIMEOUT)
  - 게임 상태 저장 (Map: gameId → game state)
  - `createDeck()` - 52장 카드 덱 생성
  - `shuffle(deck)` - Fisher-Yates 셔플
  - `createGame(gameId, player1SocketId, player2SocketId)` - 게임 초기화
  - `handleCardSubmit(gameId, socketId, cardIndex)` - 카드 제출 처리
  - `compareCards(card1, card2)` - 카드 비교 로직
  - `endGame(gameId, reason)` - 게임 종료
  - `getGame(gameId)` - 게임 상태 조회
  - `deleteGame(gameId)` - 게임 삭제
  - Export functions

**Implementation Details**:
```javascript
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RANK_VALUES = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13
};
const INITIAL_HP = 10;
const INITIAL_CARDS = 10;
const TURN_TIMEOUT = 10000; // 10초

const games = new Map();

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, value: RANK_VALUES[rank] });
    }
  }
  return deck;
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function createGame(gameId, player1SocketId, player2SocketId) {
  const deck = shuffle(createDeck());
  const game = {
    gameId,
    player1: {
      socketId: player1SocketId,
      hand: deck.slice(0, INITIAL_CARDS),
      hp: INITIAL_HP,
      submittedCard: null
    },
    player2: {
      socketId: player2SocketId,
      hand: deck.slice(INITIAL_CARDS, INITIAL_CARDS * 2),
      hp: INITIAL_HP,
      submittedCard: null
    },
    turn: 1,
    currentPlayer: 1, // 1 또는 2
    turnTimer: null,
    status: 'playing'
  };
  games.set(gameId, game);
  return game;
}

function handleCardSubmit(gameId, socketId, cardIndex) {
  const game = games.get(gameId);
  if (!game) return null;
  
  // 플레이어 식별
  const isPlayer1 = game.player1.socketId === socketId;
  const player = isPlayer1 ? game.player1 : game.player2;
  
  // 카드 유효성 검증
  if (cardIndex < 0 || cardIndex >= player.hand.length) {
    return null; // 유효하지 않은 카드 인덱스
  }
  
  // 카드 제출
  player.submittedCard = player.hand.splice(cardIndex, 1)[0];
  
  // 타이머 취소
  if (game.turnTimer) {
    clearTimeout(game.turnTimer);
    game.turnTimer = null;
  }
  
  // 두 플레이어 모두 카드 제출했는지 확인
  if (game.player1.submittedCard && game.player2.submittedCard) {
    return resolveBattle(gameId);
  }
  
  return { waiting: true };
}

function compareCards(card1, card2) {
  if (card1.value > card2.value) return 1;
  if (card1.value < card2.value) return 2;
  return 0; // 무승부
}

function resolveBattle(gameId) {
  const game = games.get(gameId);
  const winner = compareCards(game.player1.submittedCard, game.player2.submittedCard);
  
  // HP 계산
  if (winner === 1) {
    game.player2.hp -= 1;
  } else if (winner === 2) {
    game.player1.hp -= 1;
  }
  
  const result = {
    player1Card: game.player1.submittedCard,
    player2Card: game.player2.submittedCard,
    winner,
    player1HP: game.player1.hp,
    player2HP: game.player2.hp
  };
  
  // 제출된 카드 초기화
  game.player1.submittedCard = null;
  game.player2.submittedCard = null;
  
  // 게임 종료 조건 확인
  if (game.player1.hp <= 0 || game.player2.hp <= 0 || game.turn >= 10) {
    game.status = 'ended';
    result.gameEnded = true;
    result.finalWinner = game.player1.hp > game.player2.hp ? 1 : (game.player2.hp > game.player1.hp ? 2 : 0);
  } else {
    game.turn += 1;
  }
  
  return result;
}

function endGame(gameId, reason) {
  const game = games.get(gameId);
  if (game) {
    game.status = 'ended';
    if (game.turnTimer) {
      clearTimeout(game.turnTimer);
    }
  }
}

function getGame(gameId) {
  return games.get(gameId);
}

function deleteGame(gameId) {
  games.delete(gameId);
}

module.exports = {
  createGame,
  handleCardSubmit,
  endGame,
  getGame,
  deleteGame
};
```

**Output**: `server/game-manager.js` (~300-400 LOC)

**Stories**: FR-3 (게임 규칙), FR-4 (턴 시간 제한 - 로직), FR-5 (실시간 동기화 - 상태 관리)

---

### Step 5: Main Server Generation
**Description**: `server/server.js` 생성 - Express + Socket.io 서버 및 이벤트 핸들러

**Actions**:
- [x] Generate `server/server.js`:
  - Express 서버 초기화
  - Socket.io 서버 초기화
  - 정적 파일 제공 (`../` 경로로 index.html 제공)
  - 로컬 IP 자동 감지 (os.networkInterfaces())
  - WebSocket 이벤트 핸들러:
    - `connection` - 클라이언트 연결
    - `player:join` - 매칭 큐 진입
    - `card:submit` - 카드 제출
    - `emoji:send` - 이모티콘 전송
    - `disconnect` - 연결 끊김
  - 타이머 시작 함수 (`startTurnTimer`)
  - 서버 시작 및 콘솔 출력

**Implementation Details**:
```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');

const matchMaker = require('./match-maker');
const gameManager = require('./game-manager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const TURN_TIMEOUT = 10000;

// 정적 파일 제공 (index.html)
app.use(express.static(path.join(__dirname, '..')));

// 로컬 IP 감지
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// WebSocket 연결
io.on('connection', (socket) => {
  console.log(`플레이어 연결: ${socket.id}`);
  
  // 매칭 큐 진입
  socket.on('player:join', () => {
    console.log(`${socket.id} 매칭 큐 진입`);
    matchMaker.addPlayer(socket.id);
    
    // 매칭 확인
    const match = matchMaker.checkMatch();
    if (match) {
      const gameId = `game-${Date.now()}`;
      console.log(`매칭 완료: ${match.player1} vs ${match.player2}`);
      
      // 게임 생성
      const game = gameManager.createGame(gameId, match.player1, match.player2);
      
      // 양쪽 플레이어에게 매칭 완료 알림
      io.to(match.player1).emit('match:found', { gameId });
      io.to(match.player2).emit('match:found', { gameId });
      
      // 게임 시작
      io.to(match.player1).emit('game:start', {
        gameId,
        hand: game.player1.hand,
        isFirstPlayer: true
      });
      io.to(match.player2).emit('game:start', {
        gameId,
        hand: game.player2.hand,
        isFirstPlayer: false
      });
      
      // 타이머 시작
      startTurnTimer(gameId);
    }
  });
  
  // 카드 제출
  socket.on('card:submit', (data) => {
    const { gameId, cardIndex } = data;
    console.log(`${socket.id} 카드 제출: 게임 ${gameId}, 카드 ${cardIndex}`);
    
    const result = gameManager.handleCardSubmit(gameId, socket.id, cardIndex);
    
    if (!result) {
      socket.emit('error', { message: '유효하지 않은 카드 제출' });
      return;
    }
    
    if (result.waiting) {
      // 상대방 대기 중
      socket.emit('turn:waiting');
    } else {
      // 배틀 결과 전송
      const game = gameManager.getGame(gameId);
      
      io.to(game.player1.socketId).emit('turn:result', {
        playerCard: result.player1Card,
        opponentCard: result.player2Card,
        winner: result.winner,
        newHP: { player: result.player1HP, opponent: result.player2HP }
      });
      
      io.to(game.player2.socketId).emit('turn:result', {
        playerCard: result.player2Card,
        opponentCard: result.player1Card,
        winner: result.winner === 1 ? 2 : (result.winner === 2 ? 1 : 0),
        newHP: { player: result.player2HP, opponent: result.player1HP }
      });
      
      // 게임 종료 확인
      if (result.gameEnded) {
        io.to(game.player1.socketId).emit('game:end', {
          winner: result.finalWinner,
          reason: 'hp_zero_or_max_turns',
          finalHP: { player: result.player1HP, opponent: result.player2HP }
        });
        
        io.to(game.player2.socketId).emit('game:end', {
          winner: result.finalWinner === 1 ? 2 : (result.finalWinner === 2 ? 1 : 0),
          reason: 'hp_zero_or_max_turns',
          finalHP: { player: result.player2HP, opponent: result.player1HP }
        });
        
        gameManager.deleteGame(gameId);
      } else {
        // 다음 턴 타이머 시작
        startTurnTimer(gameId);
      }
    }
  });
  
  // 이모티콘 전송
  socket.on('emoji:send', (data) => {
    const { gameId, emoji } = data;
    const ALLOWED_EMOJIS = ['👍', '😊', '😢', '😡', '🎉'];
    
    if (!ALLOWED_EMOJIS.includes(emoji)) {
      return;
    }
    
    const game = gameManager.getGame(gameId);
    if (game) {
      const opponentSocketId = game.player1.socketId === socket.id
        ? game.player2.socketId
        : game.player1.socketId;
      
      io.to(opponentSocketId).emit('emoji:received', { emoji });
    }
  });
  
  // 연결 끊김
  socket.on('disconnect', () => {
    console.log(`플레이어 연결 끊김: ${socket.id}`);
    
    // 매칭 큐에서 제거
    matchMaker.removePlayer(socket.id);
    
    // 진행 중인 게임 찾기
    const games = Array.from(gameManager.games || []);
    for (const [gameId, game] of games) {
      if (game.player1.socketId === socket.id || game.player2.socketId === socket.id) {
        const opponentSocketId = game.player1.socketId === socket.id
          ? game.player2.socketId
          : game.player1.socketId;
        
        io.to(opponentSocketId).emit('opponent:disconnected');
        gameManager.endGame(gameId, 'disconnect');
        gameManager.deleteGame(gameId);
      }
    }
  });
});

// 턴 타이머 시작
function startTurnTimer(gameId) {
  const game = gameManager.getGame(gameId);
  if (!game || game.status !== 'playing') return;
  
  let remainingTime = 10;
  
  const timer = setInterval(() => {
    remainingTime--;
    
    // 타이머 업데이트 전송
    io.to(game.player1.socketId).emit('timer:tick', { remainingTime });
    io.to(game.player2.socketId).emit('timer:tick', { remainingTime });
    
    if (remainingTime <= 0) {
      clearInterval(timer);
      
      // 타임아웃 처리: 제출하지 않은 플레이어의 랜덤 카드 자동 제출
      if (!game.player1.submittedCard && game.player1.hand.length > 0) {
        const randomIndex = Math.floor(Math.random() * game.player1.hand.length);
        gameManager.handleCardSubmit(gameId, game.player1.socketId, randomIndex);
      }
      if (!game.player2.submittedCard && game.player2.hand.length > 0) {
        const randomIndex = Math.floor(Math.random() * game.player2.hand.length);
        gameManager.handleCardSubmit(gameId, game.player2.socketId, randomIndex);
      }
    }
  }, 1000);
  
  game.turnTimer = timer;
}

// 서버 시작
server.listen(PORT, () => {
  const localIP = getLocalIP();
  console.log('='.repeat(50));
  console.log('🎮 Card Battle Server');
  console.log('='.repeat(50));
  console.log(`✅ 서버 시작됨`);
  console.log(`📡 로컬 접속: http://localhost:${PORT}`);
  console.log(`🌐 네트워크 접속: http://${localIP}:${PORT}`);
  console.log('='.repeat(50));
});
```

**Output**: `server/server.js` (~300-400 LOC)

**Stories**: 
- FR-2 (매칭 시스템 - 이벤트 핸들링)
- FR-3 (게임 규칙 - 이벤트 핸들링)
- FR-4 (턴 시간 제한 - 타이머)
- FR-5 (실시간 동기화 - 이벤트 브로드캐스트)
- FR-6 (연결 끊김 처리)
- FR-8 (채팅 기능 - 이모티콘 중계)
- NFR-4 (로컬 네트워크 - IP 감지)

---

### Step 6: Documentation Generation
**Description**: 서버 구현 요약 문서 생성

**Actions**:
- [x] Create `aidlc-docs/construction/unit-001-server/` directory
- [x] Create `aidlc-docs/construction/unit-001-server/code/` subdirectory
- [x] Generate `aidlc-docs/construction/unit-001-server/code/server-implementation-summary.md`:
  - 생성된 파일 목록
  - 각 모듈의 책임
  - WebSocket 이벤트 목록
  - 실행 방법
  - 테스트 지침

**Output**: `aidlc-docs/construction/unit-001-server/code/server-implementation-summary.md`

**Stories**: N/A (문서화)

---

## Summary

**Total Steps**: 6

**Estimated LOC**: ~650-900
- `server/match-maker.js`: ~50-100 LOC
- `server/game-manager.js`: ~300-400 LOC
- `server/server.js`: ~300-400 LOC
- `server/package.json`: ~20 LOC

**Stories Coverage**:
- ✅ FR-2: 매칭 시스템
- ✅ FR-3: 게임 규칙
- ✅ FR-4: 턴 시간 제한
- ✅ FR-5: 실시간 게임 동기화
- ✅ FR-6: 연결 끊김 처리
- ✅ FR-8: 채팅 기능 (이모티콘)

**Next Unit**: Unit 2 (Client Modification) - 서버 완료 후 진행
