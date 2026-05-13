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
const INITIAL_GOLD = 1000;

// 문양 우선순위
const SUIT_PRIORITY = { '♠': 4, '♦': 3, '♥': 2, '♣': 1 };
const SUIT_PRIORITY_REVERSED = { '♠': 1, '♦': 2, '♥': 3, '♣': 4 };

// 특수 능력
const ABILITIES = {
  '♠J': { name: '선제공격', desc: '내 카드 숫자 +3' },
  '♠Q': { name: '증폭', desc: '승리 시 배당금 2배' },
  '♠K': { name: '압도', desc: '무조건 승리' },
  '♦J': { name: '도둑', desc: '승리 시 1.5배' },
  '♦Q': { name: '절약', desc: '무료 승부' },
  '♦K': { name: '위엄', desc: '배당 2배 적용' },
  '♥J': { name: '회피', desc: '패배 시 골드 보호' },
  '♥Q': { name: '치유', desc: '+100G 회복' },
  '♥K': { name: '처형', desc: '상대 골드≤300 즉시 파산' },
  '♣J': { name: '반격', desc: '패배 시 손실 50% 회수' },
  '♣Q': { name: '혼란', desc: '문양 우선순위 역전' },
  '♣K': { name: '봉쇄', desc: '상대 능력 봉인' }
};

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
      gold: INITIAL_GOLD,
      currentBet: 0,
      betReady: false,
      submittedCard: null
    },
    player2: {
      socketId: player2SocketId,
      hand: deck.slice(INITIAL_CARDS, INITIAL_CARDS * 2),
      hp: INITIAL_HP,
      gold: INITIAL_GOLD,
      currentBet: 0,
      betReady: false,
      submittedCard: null
    },
    turn: 1,
    turnTimer: null,
    bettingPhase: true,
    currentBetter: 1, // 1 또는 2
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
 * 카드 능력 조회
 * @param {Object} card - 카드 객체
 * @returns {Object|null} 능력 정보 또는 null
 */
function getAbility(card) {
  const key = `${card.suit}${card.rank}`;
  return ABILITIES[key] || null;
}

/**
 * 두 카드 비교
 * @param {Object} card1 - 플레이어 1의 카드
 * @param {Object} card2 - 플레이어 2의 카드
 * @param {Object} context - 배틀 컨텍스트 (능력 적용용)
 * @returns {number} 승자 (1, 2, 또는 0=무승부)
 */
function compareCards(card1, card2, context = {}) {
  let value1 = card1.value;
  let value2 = card2.value;

  const ability1 = getAbility(card1);
  const ability2 = getAbility(card2);

  // ♠K 압도: 무조건 승리
  if (card1.suit === '♠' && card1.rank === 'K' && !context.ability1Blocked) {
    return 1;
  }
  if (card2.suit === '♠' && card2.rank === 'K' && !context.ability2Blocked) {
    return 2;
  }

  // ♠J 선제공격: +3
  if (card1.suit === '♠' && card1.rank === 'J' && !context.ability1Blocked) {
    value1 += 3;
  }
  if (card2.suit === '♠' && card2.rank === 'J' && !context.ability2Blocked) {
    value2 += 3;
  }

  // 숫자 비교
  if (value1 > value2) return 1;
  if (value1 < value2) return 2;

  // 숫자 같으면 문양 우선순위로 비교
  // ♣Q 혼란: 우선순위 역전
  const reversed = (card1.suit === '♣' && card1.rank === 'Q' && !context.ability1Blocked) ||
                   (card2.suit === '♣' && card2.rank === 'Q' && !context.ability2Blocked);

  const priority = reversed ? SUIT_PRIORITY_REVERSED : SUIT_PRIORITY;

  if (priority[card1.suit] > priority[card2.suit]) return 1;
  if (priority[card1.suit] < priority[card2.suit]) return 2;

  return 0; // 완전 무승부 (숫자와 문양 모두 동일 - 불가능한 경우)
}

/**
 * 배틀 판정 및 결과 계산
 * @param {string} gameId - 게임 ID
 * @returns {Object} 배틀 결과
 */
function resolveBattle(gameId) {
  const game = games.get(gameId);

  const card1 = game.player1.submittedCard;
  const card2 = game.player2.submittedCard;
  const ability1 = getAbility(card1);
  const ability2 = getAbility(card2);

  // ♣K 봉쇄 체크
  const ability1Blocked = card2.suit === '♣' && card2.rank === 'K';
  const ability2Blocked = card1.suit === '♣' && card1.rank === 'K';

  const context = { ability1Blocked, ability2Blocked };
  const winner = compareCards(card1, card2, context);

  // 배팅 금액 (기본값 50)
  let bet1 = game.player1.currentBet || 50;
  let bet2 = game.player2.currentBet || 50;

  // ♦Q 절약: 무료 승부
  if (card1.suit === '♦' && card1.rank === 'Q' && !ability1Blocked) bet1 = 0;
  if (card2.suit === '♦' && card2.rank === 'Q' && !ability2Blocked) bet2 = 0;

  // ♦K 위엄: 배당 2배
  if (card1.suit === '♦' && card1.rank === 'K' && !ability1Blocked) bet1 *= 2;
  if (card2.suit === '♦' && card2.rank === 'K' && !ability2Blocked) bet2 *= 2;

  let goldChange1 = 0;
  let goldChange2 = 0;
  const abilities = [];

  // ♥Q 치유: +100G 즉시 회복
  if (card1.suit === '♥' && card1.rank === 'Q' && !ability1Blocked) {
    game.player1.gold += 100;
    abilities.push({ player: 1, ability: ability1.name, desc: '+100G 회복' });
  }
  if (card2.suit === '♥' && card2.rank === 'Q' && !ability2Blocked) {
    game.player2.gold += 100;
    abilities.push({ player: 2, ability: ability2.name, desc: '+100G 회복' });
  }

  // ♥K 처형: 상대 골드 ≤ 300 시 즉시 파산
  if (card1.suit === '♥' && card1.rank === 'K' && !ability1Blocked && game.player2.gold <= 300) {
    game.player2.gold = 0;
    abilities.push({ player: 1, ability: ability1.name, desc: '상대 파산!' });
  }
  if (card2.suit === '♥' && card2.rank === 'K' && !ability2Blocked && game.player1.gold <= 300) {
    game.player1.gold = 0;
    abilities.push({ player: 2, ability: ability2.name, desc: '상대 파산!' });
  }

  // 승부 결과에 따른 골드 증감
  if (winner === 1) {
    game.player2.hp -= 1;

    // ♠Q 증폭: 승리 시 2배
    let winAmount = bet1;
    if (card1.suit === '♠' && card1.rank === 'Q' && !ability1Blocked) {
      winAmount *= 2;
      abilities.push({ player: 1, ability: ability1.name, desc: '배당금 2배' });
    }

    // ♦J 도둑: 승리 시 1.5배
    if (card1.suit === '♦' && card1.rank === 'J' && !ability1Blocked) {
      winAmount *= 1.5;
      abilities.push({ player: 1, ability: ability1.name, desc: '배당금 1.5배' });
    }

    goldChange1 = winAmount;
    goldChange2 = -bet2;

    game.player1.gold += winAmount;
    game.player2.gold -= bet2;

    console.log(`[GameManager] 플레이어 1 승리 (${card1.rank}${card1.suit} > ${card2.rank}${card2.suit}) +${winAmount}G / -${bet2}G`);
  } else if (winner === 2) {
    game.player1.hp -= 1;

    // ♠Q 증폭: 승리 시 2배
    let winAmount = bet2;
    if (card2.suit === '♠' && card2.rank === 'Q' && !ability2Blocked) {
      winAmount *= 2;
      abilities.push({ player: 2, ability: ability2.name, desc: '배당금 2배' });
    }

    // ♦J 도둑: 승리 시 1.5배
    if (card2.suit === '♦' && card2.rank === 'J' && !ability2Blocked) {
      winAmount *= 1.5;
      abilities.push({ player: 2, ability: ability2.name, desc: '배당금 1.5배' });
    }

    goldChange1 = -bet1;
    goldChange2 = winAmount;

    game.player2.gold += winAmount;
    game.player1.gold -= bet1;

    console.log(`[GameManager] 플레이어 2 승리 (${card2.rank}${card2.suit} > ${card1.rank}${card1.suit}) +${winAmount}G / -${bet1}G`);
  } else {
    // 무승부: 골드 변동 없음
    console.log(`[GameManager] 무승부 (${card1.rank}${card1.suit} = ${card2.rank}${card2.suit})`);
  }

  // 패배 시 능력 (♥J 회피, ♣J 반격)
  if (winner === 2) {
    // 플레이어 1 패배
    if (card1.suit === '♥' && card1.rank === 'J' && !ability1Blocked) {
      // 회피: 패배해도 골드 보호 (이미 차감된 골드 복구)
      game.player1.gold += bet1;
      goldChange1 = 0;
      abilities.push({ player: 1, ability: ability1.name, desc: '골드 보호' });
    }
    if (card1.suit === '♣' && card1.rank === 'J' && !ability1Blocked) {
      // 반격: 손실 50% 회수
      const recovery = Math.floor(bet1 * 0.5);
      game.player1.gold += recovery;
      goldChange1 += recovery;
      abilities.push({ player: 1, ability: ability1.name, desc: `${recovery}G 회수` });
    }
  } else if (winner === 1) {
    // 플레이어 2 패배
    if (card2.suit === '♥' && card2.rank === 'J' && !ability2Blocked) {
      game.player2.gold += bet2;
      goldChange2 = 0;
      abilities.push({ player: 2, ability: ability2.name, desc: '골드 보호' });
    }
    if (card2.suit === '♣' && card2.rank === 'J' && !ability2Blocked) {
      const recovery = Math.floor(bet2 * 0.5);
      game.player2.gold += recovery;
      goldChange2 += recovery;
      abilities.push({ player: 2, ability: ability2.name, desc: `${recovery}G 회수` });
    }
  }

  const result = {
    player1Card: game.player1.submittedCard,
    player2Card: game.player2.submittedCard,
    winner,
    player1HP: game.player1.hp,
    player2HP: game.player2.hp,
    player1Gold: game.player1.gold,
    player2Gold: game.player2.gold,
    abilities: abilities, // 발동된 능력 목록
    ability1: ability1,
    ability2: ability2
  };

  // 배팅 및 제출된 카드 초기화
  game.player1.currentBet = 0;
  game.player2.currentBet = 0;
  game.player1.betReady = false;
  game.player2.betReady = false;
  game.player1.submittedCard = null;
  game.player2.submittedCard = null;
  game.bettingPhase = true;
  game.currentBetter = 1;

  // 게임 종료 조건 확인 (HP 0 이하 또는 골드 0 이하 또는 최대 턴)
  if (game.player1.hp <= 0 || game.player2.hp <= 0 ||
      game.player1.gold <= 0 || game.player2.gold <= 0 ||
      game.turn >= MAX_TURNS) {
    game.status = 'ended';
    result.gameEnded = true;

    // 최종 승자 결정
    if (game.player1.gold <= 0 && game.player2.gold > 0) {
      result.finalWinner = 2; // 플레이어 1 파산
    } else if (game.player2.gold <= 0 && game.player1.gold > 0) {
      result.finalWinner = 1; // 플레이어 2 파산
    } else if (game.player1.hp > game.player2.hp) {
      result.finalWinner = 1;
    } else if (game.player2.hp > game.player1.hp) {
      result.finalWinner = 2;
    } else if (game.player1.gold > game.player2.gold) {
      result.finalWinner = 1;
    } else if (game.player2.gold > game.player1.gold) {
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
