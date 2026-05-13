/**
 * Game Manager Module
 * 게임 세션 관리 및 게임 로직 실행
 */

// 게임 상수
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RANK_VALUES = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13
};
const INITIAL_HP = 10;
const INITIAL_CARDS = 10;
const MAX_TURNS = 10;

// 게임 상태 저장 (인메모리 Map)
const games = new Map();

/**
 * 52장 카드 덱 생성
 * @returns {Array} 카드 배열
 */
function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        value: RANK_VALUES[rank]
      });
    }
  }
  return deck;
}

/**
 * Fisher-Yates 셔플 알고리즘
 * @param {Array} deck - 카드 덱
 * @returns {Array} 셔플된 카드 덱
 */
function shuffle(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 새 게임 생성
 * @param {string} gameId - 게임 ID
 * @param {string} player1SocketId - 플레이어 1의 Socket ID
 * @param {string} player2SocketId - 플레이어 2의 Socket ID
 * @returns {Object} 생성된 게임 객체
 */
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
    turnTimer: null,
    status: 'playing'
  };

  games.set(gameId, game);
  console.log(`[GameManager] 게임 생성: ${gameId}`);

  return game;
}

/**
 * 카드 제출 처리
 * @param {string} gameId - 게임 ID
 * @param {string} socketId - 플레이어의 Socket ID
 * @param {number} cardIndex - 제출할 카드 인덱스
 * @returns {Object|null} 배틀 결과 또는 대기 상태
 */
function handleCardSubmit(gameId, socketId, cardIndex) {
  const game = games.get(gameId);
  if (!game || game.status !== 'playing') {
    return null;
  }

  // 플레이어 식별
  const isPlayer1 = game.player1.socketId === socketId;
  const player = isPlayer1 ? game.player1 : game.player2;
  const playerNumber = isPlayer1 ? 1 : 2;

  // 카드 유효성 검증
  if (cardIndex < 0 || cardIndex >= player.hand.length) {
    console.log(`[GameManager] 유효하지 않은 카드 인덱스: ${cardIndex}`);
    return null;
  }

  // 이미 제출했는지 확인
  if (player.submittedCard) {
    console.log(`[GameManager] 플레이어 ${playerNumber}가 이미 카드 제출함`);
    return null;
  }

  // 카드 제출
  player.submittedCard = player.hand.splice(cardIndex, 1)[0];
  console.log(`[GameManager] 플레이어 ${playerNumber} 카드 제출: ${player.submittedCard.rank}${player.submittedCard.suit}`);

  // 타이머 취소
  if (game.turnTimer) {
    clearInterval(game.turnTimer);
    game.turnTimer = null;
  }

  // 두 플레이어 모두 카드 제출했는지 확인
  if (game.player1.submittedCard && game.player2.submittedCard) {
    return resolveBattle(gameId);
  }

  return { waiting: true };
}

/**
 * 두 카드 비교
 * @param {Object} card1 - 플레이어 1의 카드
 * @param {Object} card2 - 플레이어 2의 카드
 * @returns {number} 승자 (1, 2, 또는 0=무승부)
 */
function compareCards(card1, card2) {
  if (card1.value > card2.value) return 1;
  if (card1.value < card2.value) return 2;
  return 0; // 무승부
}

/**
 * 배틀 판정 및 결과 계산
 * @param {string} gameId - 게임 ID
 * @returns {Object} 배틀 결과
 */
function resolveBattle(gameId) {
  const game = games.get(gameId);

  const winner = compareCards(game.player1.submittedCard, game.player2.submittedCard);

  // HP 계산
  if (winner === 1) {
    game.player2.hp -= 1;
    console.log(`[GameManager] 플레이어 1 승리 (${game.player1.submittedCard.rank}${game.player1.submittedCard.suit} > ${game.player2.submittedCard.rank}${game.player2.submittedCard.suit})`);
  } else if (winner === 2) {
    game.player1.hp -= 1;
    console.log(`[GameManager] 플레이어 2 승리 (${game.player2.submittedCard.rank}${game.player2.submittedCard.suit} > ${game.player1.submittedCard.rank}${game.player1.submittedCard.suit})`);
  } else {
    console.log(`[GameManager] 무승부 (${game.player1.submittedCard.rank}${game.player1.submittedCard.suit} = ${game.player2.submittedCard.rank}${game.player2.submittedCard.suit})`);
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
  if (game.player1.hp <= 0 || game.player2.hp <= 0 || game.turn >= MAX_TURNS) {
    game.status = 'ended';
    result.gameEnded = true;

    // 최종 승자 결정
    if (game.player1.hp > game.player2.hp) {
      result.finalWinner = 1;
    } else if (game.player2.hp > game.player1.hp) {
      result.finalWinner = 2;
    } else {
      result.finalWinner = 0; // 무승부
    }

    console.log(`[GameManager] 게임 종료: ${gameId} (승자: ${result.finalWinner === 0 ? '무승부' : '플레이어 ' + result.finalWinner})`);
  } else {
    game.turn += 1;
    console.log(`[GameManager] 턴 ${game.turn} 시작`);
  }

  return result;
}

/**
 * 게임 강제 종료
 * @param {string} gameId - 게임 ID
 * @param {string} reason - 종료 사유
 */
function endGame(gameId, reason) {
  const game = games.get(gameId);
  if (game) {
    game.status = 'ended';
    if (game.turnTimer) {
      clearInterval(game.turnTimer);
      game.turnTimer = null;
    }
    console.log(`[GameManager] 게임 강제 종료: ${gameId} (사유: ${reason})`);
  }
}

/**
 * 게임 상태 조회
 * @param {string} gameId - 게임 ID
 * @returns {Object|undefined} 게임 객체
 */
function getGame(gameId) {
  return games.get(gameId);
}

/**
 * 게임 삭제
 * @param {string} gameId - 게임 ID
 */
function deleteGame(gameId) {
  const game = games.get(gameId);
  if (game) {
    if (game.turnTimer) {
      clearInterval(game.turnTimer);
    }
    games.delete(gameId);
    console.log(`[GameManager] 게임 삭제: ${gameId}`);
  }
}

/**
 * 모든 게임 목록 조회 (연결 끊김 처리용)
 * @returns {Map} 게임 Map
 */
function getAllGames() {
  return games;
}

module.exports = {
  createGame,
  handleCardSubmit,
  endGame,
  getGame,
  deleteGame,
  getAllGames
};
