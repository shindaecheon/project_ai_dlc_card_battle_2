# Unit of Work Dependency Matrix

## Overview
이 문서는 2개 유닛 간의 의존성 관계, 통신 인터페이스, 개발 순서를 정의합니다.

**Units**:
- **Unit 1**: Server Implementation (UNIT-001)
- **Unit 2**: Client Modification (UNIT-002)

---

## Dependency Matrix

| From / To | Unit 1: Server | Unit 2: Client |
|-----------|----------------|----------------|
| **Unit 1: Server** | - | Provides WebSocket API, serves index.html |
| **Unit 2: Client** | Consumes WebSocket API | - |

**Legend**:
- **-**: No dependency (same unit)
- **Provides**: Unit provides services to another unit
- **Consumes**: Unit depends on services from another unit

---

## Dependency Analysis

### Unit 1 → Unit 2 (Server → Client)

**Dependency Type**: Service Provider

**Provided Services**:
1. **WebSocket API** - 실시간 통신 프로토콜
   - Server → Client 이벤트: `match:found`, `game:start`, `turn:result`, `game:end`, `timer:tick`, `emoji:received`, `opponent:disconnected`
   - Client → Server 이벤트: `player:join`, `card:submit`, `emoji:send`

2. **Static File Serving** - HTTP 서버
   - `index.html` 정적 파일 제공
   - `socket.io-client` 라이브러리 제공 (`/socket.io/socket.io.js`)

**Interface Contract**:
- WebSocket 프로토콜 (requirements.md TR-3에 명시)
- 서버는 클라이언트의 구현 세부사항을 알 필요 없음
- 클라이언트가 정의된 이벤트를 전송하면 서버가 응답

**Coupling Level**: Low (프로토콜 기반 통신)

---

### Unit 2 → Unit 1 (Client → Server)

**Dependency Type**: Service Consumer

**Consumed Services**:
1. **WebSocket Connection** - 서버에 연결
   - URL: `window.location.origin` (자동 감지)
   - 프로토콜: WebSocket (Socket.io)

2. **WebSocket Events** - 서버 이벤트 수신 및 처리
   - 클라이언트는 서버가 정의한 이벤트 형식에 의존

**Interface Contract**:
- Socket.io-client 라이브러리 사용
- 서버가 제공하는 이벤트 형식을 따름
- 서버 응답을 신뢰 (Single Source of Truth)

**Coupling Level**: Low (프로토콜 기반 통신)

---

## Interface Definition

### WebSocket Protocol (requirements.md TR-3)

**Client → Server Events**:

1. **`player:join`**
   - **Direction**: Client → Server
   - **Payload**: 없음
   - **Purpose**: 매칭 큐 진입
   - **Response**: `match:found` (매칭 완료 시)

2. **`card:submit`**
   - **Direction**: Client → Server
   - **Payload**: `{ gameId: string, cardIndex: number }`
   - **Purpose**: 카드 제출
   - **Response**: `turn:result` (배틀 결과)

3. **`emoji:send`**
   - **Direction**: Client → Server
   - **Payload**: `{ gameId: string, emoji: string }`
   - **Purpose**: 이모티콘 전송
   - **Response**: `emoji:received` (상대방에게 전달)

---

**Server → Client Events**:

1. **`match:found`**
   - **Direction**: Server → Client
   - **Payload**: `{ gameId: string }`
   - **Purpose**: 매칭 완료 알림
   - **Next Step**: `game:start` 이벤트 대기

2. **`game:start`**
   - **Direction**: Server → Client
   - **Payload**: `{ gameId: string, hand: Array<Card>, isFirstPlayer: boolean }`
   - **Purpose**: 게임 시작, 초기 패 전달
   - **Next Step**: 첫 턴 시작

3. **`turn:result`**
   - **Direction**: Server → Client
   - **Payload**: `{ playerCard: Card, opponentCard: Card, winner: 1|2|'draw', newHP: { player: number, opponent: number } }`
   - **Purpose**: 배틀 결과 전달
   - **Next Step**: 다음 턴 또는 `game:end`

4. **`game:end`**
   - **Direction**: Server → Client
   - **Payload**: `{ winner: 1|2|'draw', reason: string, finalHP: { player: number, opponent: number } }`
   - **Purpose**: 게임 종료
   - **Next Step**: 초기 화면으로 이동

5. **`timer:tick`**
   - **Direction**: Server → Client
   - **Payload**: `{ remainingTime: number }`
   - **Purpose**: 타이머 업데이트 (1초마다)
   - **Next Step**: 시간 초과 시 자동 카드 제출

6. **`emoji:received`**
   - **Direction**: Server → Client
   - **Payload**: `{ emoji: string }`
   - **Purpose**: 상대방이 보낸 이모티콘 수신
   - **Next Step**: 화면에 3초간 표시

7. **`opponent:disconnected`**
   - **Direction**: Server → Client
   - **Payload**: 없음
   - **Purpose**: 상대방 연결 끊김 알림
   - **Next Step**: 게임 종료

---

## Data Models (Shared Definitions)

### Card
```javascript
{
  suit: '♠' | '♥' | '♦' | '♣',
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K',
  value: number // A=1, 2-10=face, J=11, Q=12, K=13
}
```

**Note**: 서버와 클라이언트 모두에서 동일하게 정의됨 (중복 허용)

---

### Constants (Shared Definitions)

**Server** (`server/game-manager.js`):
```javascript
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RANK_VALUES = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5,
  '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13
};
```

**Client** (`index.html`):
```javascript
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RANK_VALUES = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5,
  '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13
};
```

**Rationale**: 중복 허용 (프로토타입 수준, Q8 답변 참조)

---

## Development Order

### Strategy: 병렬 개발 (답변: Q4 - A)

**Rationale**:
- WebSocket 프로토콜이 사전 정의됨 (requirements.md TR-3)
- 인터페이스 계약이 명확함
- 각 유닛이 독립적으로 개발 가능

---

### Phase 1: 병렬 개발 (독립 작업)

**Unit 1: Server** (병렬 개발 가능)
1. Express 서버 설정
2. Socket.io 서버 초기화
3. Match Maker 구현 (FIFO 큐)
4. Game Manager 구현 (게임 로직)
5. WebSocket 이벤트 핸들러 구현
6. 타이머 기능 구현
7. 로컬 IP 감지 및 출력

**Unit 2: Client** (병렬 개발 가능)
1. Socket.io-client 스크립트 추가
2. 모드 선택 UI 구현
3. WebSocket 연결 코드 작성
4. 서버 이벤트 핸들러 구현
5. 멀티플레이어 UI 렌더링 (매칭 대기, 게임 화면)
6. 타이머 UI 추가
7. 이모티콘 UI 추가
8. 기존 AI 모드 유지

**병렬 작업 가능 이유**:
- 서버 개발자는 프로토콜만 따르면 됨
- 클라이언트 개발자는 프로토콜만 따르면 됨
- 두 유닛이 서로의 구현 세부사항을 알 필요 없음

---

### Phase 2: 통합 테스트 (순차 작업)

**Prerequisites**:
- Unit 1 완료
- Unit 2 완료

**Integration Steps**:
1. 서버 시작 (`node server/server.js`)
2. 브라우저 1에서 클라이언트 접속
3. 브라우저 2에서 클라이언트 접속
4. 매칭 확인
5. 게임 플레이 테스트
6. 모든 시나리오 테스트 (unit-of-work.md 참조)

**Test Scenarios** (unit-of-work.md 참조):
- ✅ 2명의 플레이어가 서버에 접속
- ✅ 자동으로 매칭됨 (FIFO)
- ✅ 게임 시작 (각 플레이어 10장 카드 수신)
- ✅ 카드 제출 및 배틀 결과 동기화
- ✅ 10초 턴 타이머 작동
- ✅ 게임 종료 조건 (HP 0 또는 10턴)
- ✅ 연결 끊김 처리
- ✅ 이모티콘 전송 및 수신
- ✅ AI 모드 정상 작동 (서버 없이)

---

### Phase 3: 버그 수정 및 최적화 (순차 작업)

**Focus**:
- 통합 테스트 중 발견된 버그 수정
- 동기화 이슈 해결
- 타이밍 조정

---

## Integration Points

### Integration Point 1: Server Serves Client
**Location**: `server/server.js`

```javascript
app.use(express.static('../')); // index.html 제공
```

**Purpose**: 서버가 클라이언트 HTML 파일을 정적 파일로 제공

**Dependency**: Unit 1 → Unit 2 (서버가 클라이언트 파일을 제공)

---

### Integration Point 2: Client Connects to Server
**Location**: `index.html` (WebSocket Client 코드)

```javascript
const socket = io(window.location.origin);
```

**Purpose**: 클라이언트가 서버에 WebSocket 연결

**Dependency**: Unit 2 → Unit 1 (클라이언트가 서버 API 소비)

---

### Integration Point 3: WebSocket Event Exchange
**Location**: 양방향

**Client → Server**:
```javascript
socket.emit('player:join');
socket.emit('card:submit', { gameId, cardIndex });
socket.emit('emoji:send', { gameId, emoji });
```

**Server → Client**:
```javascript
socket.on('match:found', (data) => { ... });
socket.on('game:start', (data) => { ... });
socket.on('turn:result', (data) => { ... });
// ...
```

**Purpose**: 실시간 양방향 통신

**Dependency**: 양방향 (프로토콜 기반)

---

## Deployment Dependencies

### Deployment Order

1. **Deploy Unit 1 (Server)** - 먼저 서버 시작
   ```bash
   cd server
   npm install
   node server.js
   ```

2. **Access Unit 2 (Client)** - 브라우저에서 접속
   ```
   http://localhost:3000  (로컬)
   http://192.168.1.X:3000  (네트워크)
   ```

**Dependency**: Unit 2는 Unit 1이 실행 중이어야 함

**Note**: 단일 배포 (Q10 답변 참조) - 서버가 클라이언트를 함께 제공

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| **프로토콜 불일치** | High | WebSocket 이벤트를 requirements.md에 명시, 문서화 |
| **동시성 버그** | Medium | 서버 사이드 게임 상태 관리, 서버가 Single Source of Truth |
| **네트워크 지연** | Low | 허용 가능한 지연 시간 설정 (2~3초) |
| **타이머 동기화** | Medium | 서버 사이드 타이머 사용, 클라이언트는 표시만 |

---

## Coupling Metrics

### Coupling Level: Low ✅

**Indicators**:
- ✅ 프로토콜 기반 통신 (WebSocket)
- ✅ 명확한 인터페이스 계약
- ✅ 독립적인 개발 가능
- ✅ 독립적인 테스트 가능
- ✅ 최소한의 공유 코드 (카드 상수만)

**Tight Coupling 회피**:
- ❌ 함수 호출 없음 (별도 런타임)
- ❌ 공유 라이브러리 없음
- ❌ 직접적인 데이터 접근 없음

---

## Success Criteria

유닛 간 통합이 다음 조건을 만족하면 성공:

- [ ] 서버와 클라이언트가 WebSocket으로 정상 연결
- [ ] 모든 서버 이벤트가 클라이언트에서 정상 처리
- [ ] 모든 클라이언트 이벤트가 서버에서 정상 처리
- [ ] 2개 클라이언트가 동시 접속 및 게임 플레이 가능
- [ ] 실시간 동기화 정상 작동
- [ ] 서버가 클라이언트 HTML을 정상 제공
- [ ] 로컬 네트워크에서 다른 기기 접속 가능

---

## Notes

- 유닛 간 의존성이 낮아 병렬 개발 및 독립적인 테스트가 가능
- WebSocket 프로토콜이 명확히 정의되어 있어 인터페이스 계약 보장
- 서버가 Single Source of Truth로 동작하여 클라이언트 간 동기화 보장
- 프로토타입 수준이므로 복잡한 의존성 관리 불필요
