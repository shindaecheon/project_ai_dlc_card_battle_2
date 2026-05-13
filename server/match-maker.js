/**
 * Match Maker Module
 * FIFO 방식의 매칭 큐 관리
 */

const waitingQueue = [];

/**
 * 플레이어를 매칭 큐에 추가
 * @param {string} socketId - 플레이어의 Socket ID
 */
function addPlayer(socketId) {
  if (!waitingQueue.includes(socketId)) {
    waitingQueue.push(socketId);
    console.log(`[MatchMaker] 플레이어 큐 진입: ${socketId} (대기: ${waitingQueue.length}명)`);
  }
}

/**
 * 매칭 확인 및 생성 (2명 이상일 때 자동 매칭)
 * @returns {Object|null} { player1, player2 } 또는 null
 */
function checkMatch() {
  if (waitingQueue.length >= 2) {
    const player1 = waitingQueue.shift();
    const player2 = waitingQueue.shift();
    console.log(`[MatchMaker] 매칭 성공: ${player1} vs ${player2}`);
    return { player1, player2 };
  }
  return null;
}

/**
 * 플레이어를 매칭 큐에서 제거 (연결 끊김 시)
 * @param {string} socketId - 플레이어의 Socket ID
 */
function removePlayer(socketId) {
  const index = waitingQueue.indexOf(socketId);
  if (index !== -1) {
    waitingQueue.splice(index, 1);
    console.log(`[MatchMaker] 플레이어 큐 제거: ${socketId} (대기: ${waitingQueue.length}명)`);
  }
}

/**
 * 현재 대기 중인 플레이어 수 조회
 * @returns {number} 대기 중인 플레이어 수
 */
function getQueueSize() {
  return waitingQueue.length;
}

module.exports = {
  addPlayer,
  checkMatch,
  removePlayer,
  getQueueSize
};
