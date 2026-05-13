/**
 * Card Battle Server
 * Express + Socket.io 기반 멀티플레이어 카드 배틀 게임 서버
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');

const matchMaker = require('./match-maker');
const gameManager = require('./game-manager');

// Express 앱 및 HTTP 서버 생성
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 서버 설정
const PORT = process.env.PORT || 3000;
const TURN_TIMEOUT = 30000; // 30초

// 정적 파일 제공 (index.html 및 관련 파일)
app.use(express.static(path.join(__dirname, '..')));

/**
 * 로컬 네트워크 IP 주소 감지
 * @returns {string} 로컬 IP 주소
 */
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // IPv4이고 내부 주소가 아닌 경우
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

/**
 * 턴 타이머 시작
 * @param {string} gameId - 게임 ID
 */
function startTurnTimer(gameId) {
  const game = gameManager.getGame(gameId);
  if (!game || game.status !== 'playing') return;

  let remainingTime = 30;

  const timer = setInterval(() => {
    remainingTime--;

    // 타이머 업데이트를 양쪽 플레이어에게 전송
    io.to(game.player1.socketId).emit('timer:tick', { remainingTime });
    io.to(game.player2.socketId).emit('timer:tick', { remainingTime });

    if (remainingTime <= 0) {
      clearInterval(timer);

      // 타임아웃 처리: 제출하지 않은 플레이어의 랜덤 카드 자동 제출
      if (!game.player1.submittedCard && game.player1.hand.length > 0) {
        const randomIndex = Math.floor(Math.random() * game.player1.hand.length);
        console.log(`[Server] 플레이어 1 타임아웃 - 자동 카드 제출 (인덱스 ${randomIndex})`);
        const result = gameManager.handleCardSubmit(gameId, game.player1.socketId, randomIndex);
        if (result && !result.waiting) {
          sendBattleResult(gameId, result);
        }
      }

      if (!game.player2.submittedCard && game.player2.hand.length > 0) {
        const randomIndex = Math.floor(Math.random() * game.player2.hand.length);
        console.log(`[Server] 플레이어 2 타임아웃 - 자동 카드 제출 (인덱스 ${randomIndex})`);
        const result = gameManager.handleCardSubmit(gameId, game.player2.socketId, randomIndex);
        if (result && !result.waiting) {
          sendBattleResult(gameId, result);
        }
      }
    }
  }, 1000);

  game.turnTimer = timer;
}

/**
 * 배틀 결과를 양쪽 플레이어에게 전송
 * @param {string} gameId - 게임 ID
 * @param {Object} result - 배틀 결과
 */
function sendBattleResult(gameId, result) {
  console.log(`[Server] sendBattleResult 호출 - gameId: ${gameId}`);
  const game = gameManager.getGame(gameId);
  if (!game) {
    console.log(`[Server] sendBattleResult - 게임을 찾을 수 없음: ${gameId}`);
    return;
  }

  console.log(`[Server] turn:result 전송 준비 - 승자: ${result.winner}, P1Gold: ${result.player1Gold}, P2Gold: ${result.player2Gold}`);

  // 플레이어 1에게 결과 전송
  io.to(game.player1.socketId).emit('turn:result', {
    playerCard: result.player1Card,
    opponentCard: result.player2Card,
    winner: result.winner,
    player1Gold: result.player1Gold,
    player2Gold: result.player2Gold,
    abilities: result.abilities,
    newHP: { player: result.player1HP, opponent: result.player2HP }
  });

  console.log(`[Server] turn:result 전송 완료 → Player1: ${game.player1.socketId}`);

  // 플레이어 2에게 결과 전송 (승자 번호 반전)
  io.to(game.player2.socketId).emit('turn:result', {
    playerCard: result.player2Card,
    opponentCard: result.player1Card,
    winner: result.winner === 1 ? 2 : (result.winner === 2 ? 1 : 0),
    player1Gold: result.player1Gold,
    player2Gold: result.player2Gold,
    abilities: result.abilities,
    newHP: { player: result.player2HP, opponent: result.player1HP }
  });

  console.log(`[Server] turn:result 전송 완료 → Player2: ${game.player2.socketId}`);

  // 게임 종료 확인
  if (result.gameEnded) {
    // 플레이어 1에게 게임 종료 알림
    io.to(game.player1.socketId).emit('game:end', {
      winner: result.finalWinner,
      reason: 'hp_zero_or_max_turns',
      finalHP: { player: result.player1HP, opponent: result.player2HP }
    });

    // 플레이어 2에게 게임 종료 알림 (승자 번호 반전)
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

// WebSocket 연결 처리
io.on('connection', (socket) => {
  console.log(`[Server] 플레이어 연결: ${socket.id}`);

  // 매칭 큐 진입
  socket.on('player:join', () => {
    console.log(`[Server] ${socket.id} 매칭 큐 진입 요청`);
    matchMaker.addPlayer(socket.id);

    // 매칭 확인
    const match = matchMaker.checkMatch();
    if (match) {
      const gameId = `game-${Date.now()}`;
      console.log(`[Server] 매칭 완료: ${match.player1} vs ${match.player2}`);

      // 게임 생성
      const game = gameManager.createGame(gameId, match.player1, match.player2);

      // 양쪽 플레이어에게 매칭 완료 알림
      io.to(match.player1).emit('match:found', { gameId });
      io.to(match.player2).emit('match:found', { gameId });

      // 게임 시작 이벤트 전송
      io.to(match.player1).emit('game:start', {
        gameId,
        hand: game.player1.hand,
        gold: game.player1.gold,
        isFirstPlayer: true
      });
      io.to(match.player2).emit('game:start', {
        gameId,
        hand: game.player2.hand,
        gold: game.player2.gold,
        isFirstPlayer: false
      });

      // 첫 턴 타이머 시작
      startTurnTimer(gameId);
    }
  });

  // 배팅 선택
  socket.on('bet:select', (data) => {
    const { gameId, betAmount } = data;
    console.log(`[Server] ${socket.id} 배팅: ${betAmount}G`);

    const game = gameManager.getGame(gameId);
    if (!game || !game.bettingPhase) return;

    // 플레이어 식별
    const isPlayer1 = game.player1.socketId === socket.id;
    const playerNum = isPlayer1 ? 1 : 2;
    const player = isPlayer1 ? game.player1 : game.player2;
    const opponent = isPlayer1 ? game.player2 : game.player1;

    // 차례 체크
    if (game.currentBetter !== playerNum) {
      socket.emit('error', { message: '상대방의 차례입니다' });
      return;
    }

    // 골드 부족 체크
    if (player.gold < betAmount) {
      socket.emit('error', { message: '골드가 부족합니다' });
      return;
    }

    // 상대 배팅보다 낮으면 안 됨 (레이즈만 가능)
    if (opponent.currentBet > 0 && betAmount < opponent.currentBet) {
      socket.emit('error', { message: `최소 ${opponent.currentBet}G 이상 배팅해야 합니다` });
      return;
    }

    // 배팅 저장
    player.currentBet = betAmount;
    player.betReady = true;

    console.log(`[Server] 플레이어 ${playerNum} 배팅: ${betAmount}G`);

    // 상대에게 배팅 정보 전송
    const opponentSocketId = opponent.socketId;
    io.to(opponentSocketId).emit('opponent:bet', { betAmount });
    console.log(`[Server] opponent:bet 전송 → ${opponentSocketId}: ${betAmount}G`);

    // 양쪽 배팅 완료 체크
    if (player.currentBet === opponent.currentBet && opponent.betReady) {
      // 배팅 라운드 종료
      game.bettingPhase = false;

      io.to(game.player1.socketId).emit('betting:complete', {
        playerBet: game.player1.currentBet,
        opponentBet: game.player2.currentBet
      });
      io.to(game.player2.socketId).emit('betting:complete', {
        playerBet: game.player2.currentBet,
        opponentBet: game.player1.currentBet
      });

      console.log(`[Server] betting:complete 전송 → 플레이어1: ${game.player1.currentBet}G, 플레이어2: ${game.player2.currentBet}G`);

      // 턴 타이머 시작
      startTurnTimer(gameId);
    } else {
      // 상대 차례로 전환
      game.currentBetter = playerNum === 1 ? 2 : 1;
      socket.emit('bet:confirmed', { betAmount });
      console.log(`[Server] bet:confirmed 전송 → ${socket.id}: ${betAmount}G, 다음 차례: 플레이어${game.currentBetter}`);
    }
  });

  // 카드 제출
  socket.on('card:submit', (data) => {
    const { gameId, cardIndex } = data;
    console.log(`[Server] ${socket.id} 카드 제출: 게임 ${gameId}, 카드 인덱스 ${cardIndex}`);

    const result = gameManager.handleCardSubmit(gameId, socket.id, cardIndex);

    if (!result) {
      socket.emit('error', { message: '유효하지 않은 카드 제출' });
      return;
    }

    if (result.waiting) {
      // 상대방 대기 중
      socket.emit('turn:waiting');
      console.log(`[Server] ${socket.id} 상대방 카드 제출 대기 중`);
    } else {
      // 배틀 결과 전송
      sendBattleResult(gameId, result);
    }
  });

  // 이모티콘 전송
  socket.on('emoji:send', (data) => {
    const { gameId, emoji } = data;
    const ALLOWED_EMOJIS = ['👍', '😊', '😢', '😡', '🎉'];

    // 이모티콘 검증
    if (!ALLOWED_EMOJIS.includes(emoji)) {
      console.log(`[Server] 유효하지 않은 이모티콘: ${emoji}`);
      return;
    }

    const game = gameManager.getGame(gameId);
    if (game) {
      // 상대방 Socket ID 찾기
      const opponentSocketId = game.player1.socketId === socket.id
        ? game.player2.socketId
        : game.player1.socketId;

      // 상대방에게 이모티콘 전송
      io.to(opponentSocketId).emit('emoji:received', { emoji });
      console.log(`[Server] 이모티콘 전송: ${socket.id} → ${opponentSocketId} (${emoji})`);
    }
  });

  // 연결 끊김 처리
  socket.on('disconnect', () => {
    console.log(`[Server] 플레이어 연결 끊김: ${socket.id}`);

    // 매칭 큐에서 제거
    matchMaker.removePlayer(socket.id);

    // 진행 중인 게임 찾기
    const allGames = gameManager.getAllGames();
    for (const [gameId, game] of allGames) {
      if (game.player1.socketId === socket.id || game.player2.socketId === socket.id) {
        // 상대방 Socket ID 찾기
        const opponentSocketId = game.player1.socketId === socket.id
          ? game.player2.socketId
          : game.player1.socketId;

        // 상대방에게 연결 끊김 알림
        io.to(opponentSocketId).emit('opponent:disconnected');
        console.log(`[Server] 상대방 연결 끊김 알림: ${opponentSocketId}`);

        // 게임 종료 및 삭제
        gameManager.endGame(gameId, 'disconnect');
        gameManager.deleteGame(gameId);
      }
    }
  });
});

// 서버 시작
server.listen(PORT, () => {
  const localIP = getLocalIP();
  console.log('='.repeat(60));
  console.log('🎮  Card Battle Server - 멀티플레이어 카드 배틀 게임');
  console.log('='.repeat(60));
  console.log('✅ 서버가 시작되었습니다!');
  console.log('');
  console.log('📡 접속 주소:');
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://${localIP}:${PORT}`);
  console.log('');
  console.log('='.repeat(60));
});
