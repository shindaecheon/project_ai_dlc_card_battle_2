# Unit of Work

## Overview
이 문서는 시스템을 2개의 독립적인 개발 유닛으로 분해하고 각 유닛의 책임과 범위를 정의합니다.

**Decomposition Strategy**: 클라이언트-서버 분리
- **Unit 1**: Server (서버 유닛)
- **Unit 2**: Client (클라이언트 유닛)

---

## Unit 1: Server Implementation

### 기본 정보
- **Unit ID**: UNIT-001
- **Unit Name**: Server Implementation
- **Type**: Backend Service
- **Language**: JavaScript (Node.js)
- **Framework**: Express.js + Socket.io

### 범위 (Scope)
**파일**:
- `server/server.js` - 메인 서버 (Express + Socket.io)
- `server/match-maker.js` - 매칭 시스템
- `server/game-manager.js` - 게임 로직
- `server/package.json` - 의존성 관리

**컴포넌트** (Application Design 참조):
- WebSocket Server
- Match Maker
- Game Manager

### 책임 (Responsibilities)
1. **WebSocket 서버 관리**
   - HTTP 서버 초기화 (Express)
   - Socket.io 서버 초기화
   - 클라이언트 연결/해제 관리
   - 이벤트 라우팅

2. **플레이어 매칭**
   - FIFO 매칭 큐 관리
   - 2명 플레이어 자동 매칭
   - 매칭 완료 시 게임 세션 생성

3. **게임 세션 관리**
   - 게임 생성 및 초기화
   - 카드 덱 생성 및 배분
   - 게임 상태 저장 (인메모리 Map)
   - 턴 관리 및 타이머

4. **게임 로직 실행**
   - 카드 제출 처리 및 검증
   - 배틀 판정 (카드 비교)
   - HP 계산 및 업데이트
   - 게임 종료 조건 확인

5. **실시간 동기화**
   - 게임 이벤트 브로드캐스트
   - 클라이언트 상태 동기화
   - 연결 끊김 처리

6. **이모티콘 전송**
   - 이모티콘 검증 및 전달

7. **로컬 네트워크 지원**
   - 로컬 IP 자동 감지
   - 접속 URL 콘솔 출력

### 주요 기능 (Features)
- ✅ WebSocket 연결 관리 (Socket.io)
- ✅ FIFO 매칭 큐
- ✅ 게임 세션 생성 및 관리
- ✅ 서버 사이드 게임 로직 검증
- ✅ 10초 턴 타이머
- ✅ 연결 끊김 감지 및 처리
- ✅ 이모티콘 중계
- ✅ 정적 파일 제공 (index.html)

### 데이터 모델
**Game State**:
```javascript
{
  gameId: string,
  player1: {
    socketId: string,
    hand: Array<Card>,
    hp: number,
    submittedCard: Card | null
  },
  player2: { ... },
  turn: number,
  currentPlayer: 1 | 2,
  turnTimer: Timeout | null,
  status: 'waiting' | 'playing' | 'ended'
}
```

**Matching Queue**:
```javascript
waitingQueue: Array<socketId>
```

### 의존성 (Dependencies)
**External**:
- `express` (^4.18.0) - HTTP 서버
- `socket.io` (^4.6.0) - WebSocket 서버

**Internal**:
- `match-maker.js` ← `server.js`
- `game-manager.js` ← `server.js`

### 진입점 (Entry Point)
```bash
node server/server.js
```

또는 (package.json scripts):
```bash
npm start
```

### 환경 설정
**Environment Variables** (선택 사항):
- `PORT`: 서버 포트 (기본값: 3000)

**Configuration**:
```javascript
const PORT = process.env.PORT || 3000;
const TURN_TIMEOUT = 10000; // 10초
const INITIAL_HP = 10;
const INITIAL_CARDS = 10;
```

### 디렉토리 구조
```
server/
├── server.js          (메인 서버, 300-400 LOC)
├── match-maker.js     (매칭 시스템, 50-100 LOC)
├── game-manager.js    (게임 로직, 300-400 LOC)
└── package.json       (의존성)
```

**Total LOC**: ~650-900

---

## Unit 2: Client Modification

### 기본 정보
- **Unit ID**: UNIT-002
- **Unit Name**: Client Modification
- **Type**: Frontend Application
- **Language**: HTML5, CSS3, Vanilla JavaScript
- **Framework**: None (Vanilla)

### 범위 (Scope)
**파일**:
- `index.html` - 기존 파일 수정 (WebSocket 통신 추가)

**컴포넌트** (Application Design 참조):
- Mode Selector (신규)
- WebSocket Client (신규)
- UI Renderer (기존 + 확장)
- Local AI (기존 유지)

### 책임 (Responsibilities)
1. **게임 모드 선택**
   - AI 대전 / 멀티플레이어 선택 UI
   - 모드에 따른 게임 플로우 분기

2. **WebSocket 통신**
   - Socket.io 클라이언트 초기화
   - 서버 연결 관리
   - 이벤트 송수신
   - 재연결 처리 (Socket.io 자동)

3. **서버 이벤트 처리**
   - `match:found` - 매칭 완료
   - `game:start` - 게임 시작
   - `turn:result` - 턴 결과
   - `game:end` - 게임 종료
   - `timer:tick` - 타이머 업데이트
   - `emoji:received` - 이모티콘 수신
   - `opponent:disconnected` - 상대방 연결 끊김

4. **UI 렌더링**
   - 모드 선택 화면 (신규)
   - 매칭 대기 화면 (신규)
   - 게임 화면 (기존 + 확장)
   - 턴 타이머 표시 (신규)
   - 이모티콘 UI (신규)
   - 게임 결과 화면 (기존)

5. **로컬 AI 모드**
   - 기존 AI 대전 기능 유지
   - 서버 접속 없이 로컬 게임

### 주요 기능 (Features)
- ✅ 모드 선택 (AI / 멀티플레이어)
- ✅ WebSocket 서버 연결
- ✅ 실시간 게임 상태 동기화
- ✅ 카드 제출 이벤트 전송
- ✅ 턴 타이머 UI
- ✅ 이모티콘 전송 및 수신
- ✅ 상대방 연결 상태 표시
- ✅ 기존 AI 모드 유지

### 데이터 모델
**Client State**:
```javascript
{
  gameMode: 'ai' | 'multiplayer',
  gameId: string | null,
  myHand: Array<Card>,
  myHp: number,
  opponentHp: number,
  turn: number,
  isMyTurn: boolean,
  remainingTime: number
}
```

### 의존성 (Dependencies)
**External**:
- `socket.io-client` (v4.x) - WebSocket 클라이언트
  - 서버에서 자동 제공: `/socket.io/socket.io.js`

**Internal**:
- 없음 (단일 파일)

### 진입점 (Entry Point)
브라우저에서 `index.html` 열기:
- 로컬: `http://localhost:3000`
- 네트워크: `http://<SERVER_IP>:3000`

### 환경 설정
**Server URL**:
```javascript
const SERVER_URL = window.location.origin; // 자동 감지
```

### 파일 구조
```
index.html
├── HTML 구조 (기존 + 모드 선택 UI)
├── CSS 스타일 (기존 + 신규 UI 스타일)
└── JavaScript
    ├── 상수 정의 (기존)
    ├── 게임 상태 변수 (기존 + 확장)
    ├── Mode Selector 함수 (신규)
    ├── WebSocket Client 함수 (신규)
    ├── 이벤트 핸들러 (신규)
    ├── UI Renderer 함수 (기존 + 확장)
    └── Local AI 함수 (기존 유지)
```

**기존 LOC**: ~485
**추가 LOC**: ~200-300 (WebSocket 통신 + UI)
**Total LOC**: ~685-785

---

## Unit Comparison

| Aspect | Unit 1: Server | Unit 2: Client |
|--------|----------------|----------------|
| **Language** | JavaScript (Node.js) | JavaScript (Browser) |
| **Runtime** | Server | Browser |
| **Files** | 4 files | 1 file (modified) |
| **LOC** | ~650-900 | ~685-785 |
| **Complexity** | Medium | Low-Medium |
| **Dependencies** | express, socket.io | socket.io-client |
| **Entry Point** | `node server/server.js` | Open `index.html` in browser |
| **Testing** | Unit test (mock Socket.io) | Browser test |

---

## Code Organization

### Project Structure
```
table-order/
├── server/                  (Unit 1: Server)
│   ├── server.js
│   ├── match-maker.js
│   ├── game-manager.js
│   └── package.json
├── index.html               (Unit 2: Client, 기존 수정)
├── CLAUDE.md
├── 제안사항.md
└── aidlc-docs/
```

**Rationale**:
- 명확한 서버/클라이언트 분리
- `server/` 디렉토리로 서버 코드 그룹화
- `index.html`은 루트에 유지 (기존 위치)

---

## Development Strategy

### Development Order
**병렬 개발 가능** (답변: Q4 - A)

**이유**:
- WebSocket 프로토콜이 사전 정의됨 (requirements.md TR-3)
- 각 유닛이 독립적으로 개발 가능
- 인터페이스 계약이 명확함

**권장 접근**:
1. **Phase 1**: 서버와 클라이언트 동시 개발
   - Server: WebSocket 서버 + 게임 로직 구현
   - Client: WebSocket 클라이언트 + UI 구현
2. **Phase 2**: 통합 테스트
   - 2개 브라우저로 E2E 테스트
   - 버그 수정 및 조정

---

## Testing Strategy

### Unit 1: Server Testing
**Unit Tests**:
- Match Maker: FIFO 큐 로직 테스트
- Game Manager: 게임 로직 (카드 비교, HP 계산) 테스트
- Mock: Socket.io 클라이언트 mock 사용

**Integration Tests**:
- Socket.io 클라이언트로 서버 이벤트 테스트
- 게임 플로우 E2E 테스트

**Manual Tests**:
- 서버 시작 후 로그 확인
- 로컬 IP 출력 확인

---

### Unit 2: Client Testing
**Browser Tests**:
- 모드 선택 UI 테스트
- WebSocket 연결 테스트
- 게임 화면 렌더링 테스트
- AI 모드 테스트 (기존 기능 유지 확인)

**Integration Tests**:
- 서버와 함께 실제 게임 플레이
- 2개 브라우저 (또는 다른 기기)로 동시 접속 테스트

**Manual Tests**:
- 다양한 브라우저 호환성 확인
- 모바일 브라우저 테스트 (선택 사항)

---

### Integration Testing (Both Units)
**Test Scenarios**:
1. ✅ 2명의 플레이어가 서버에 접속
2. ✅ 자동으로 매칭됨 (FIFO)
3. ✅ 게임 시작 (각 플레이어 10장 카드 수신)
4. ✅ 카드 제출 및 배틀 결과 동기화
5. ✅ 10초 턴 타이머 작동
6. ✅ 게임 종료 조건 (HP 0 또는 10턴)
7. ✅ 연결 끊김 처리
8. ✅ 이모티콘 전송 및 수신
9. ✅ AI 모드 정상 작동 (서버 없이)

**Test Environment**:
- 같은 Wi-Fi 네트워크
- 2개 디바이스 또는 2개 브라우저 탭

---

## Shared Code

### Approach: 중복 허용 (답변: Q8 - A)

**Rationale**:
- 프로토타입 수준
- 공유 코드가 매우 적음
- 단순성 우선

**Shared Definitions** (중복):
- 카드 상수: `SUITS`, `RANKS`, `RANK_VALUES`
- 이벤트 이름: `player:join`, `card:submit`, etc.

**Server**:
```javascript
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', ..., 'K'];
```

**Client**:
```javascript
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', ..., 'K'];
```

**Trade-off**:
- ✅ 단순한 구조
- ❌ 중복 코드 (하지만 양이 적음)

---

## Documentation

### Approach: 통합 문서만 (답변: Q9 - B 해석)

**Rationale**:
- 프로토타입 수준
- aidlc-docs/ 산출물로 충분
- 빠른 구현 우선

**Documentation**:
- ✅ `aidlc-docs/inception/application-design/` - 설계 문서
- ✅ `aidlc-docs/inception/requirements/` - 요구사항
- ✅ `aidlc-docs/construction/` - 구현 문서 (향후 생성)
- ❌ `server/README.md` - 유닛별 README 없음
- ❌ `client/README.md` - 유닛별 README 없음

**만약 유닛별 README가 필요하다면**:
- `server/README.md` - 서버 실행 방법
- 루트 `README.md` - 전체 프로젝트 개요

---

## Deployment

### Approach: 단일 배포 (답변: Q10 - A)

**Deployment Model**:
- 서버가 `index.html`을 정적 파일로 제공
- 클라이언트와 서버가 함께 배포됨

**Server Code**:
```javascript
// server.js
app.use(express.static('../')); // index.html 제공
```

**Deployment Steps**:
1. 서버 시작: `node server/server.js`
2. 로컬 IP 콘솔에서 확인
3. 다른 기기에서 브라우저로 접속

**Access**:
- 서버 기기: `http://localhost:3000`
- 다른 기기: `http://192.168.1.X:3000`

---

## Success Criteria

각 유닛의 완료 기준:

### Unit 1: Server
- [ ] Express 서버 시작
- [ ] Socket.io 서버 초기화
- [ ] 로컬 IP 자동 감지 및 콘솔 출력
- [ ] 매칭 큐 작동 (2명 자동 매칭)
- [ ] 게임 세션 생성 및 관리
- [ ] 카드 제출 처리 및 배틀 판정
- [ ] 10초 턴 타이머 작동
- [ ] 게임 종료 조건 확인
- [ ] 연결 끊김 처리
- [ ] 이모티콘 중계

### Unit 2: Client
- [ ] 모드 선택 UI 표시
- [ ] AI 모드 정상 작동 (기존 기능)
- [ ] 멀티플레이어 모드 선택 시 서버 연결
- [ ] 매칭 대기 화면 표시
- [ ] 게임 시작 이벤트 처리
- [ ] 카드 제출 이벤트 전송
- [ ] 배틀 결과 UI 업데이트
- [ ] 턴 타이머 표시 (카운트다운)
- [ ] 이모티콘 UI 및 애니메이션
- [ ] 상대방 연결 끊김 알림

### Integration
- [ ] 2개 클라이언트가 동시 접속 및 매칭
- [ ] 실시간 게임 플레이 정상 작동
- [ ] 모든 WebSocket 이벤트 정상 동작

---

## Notes

- 각 유닛은 독립적으로 개발 및 테스트 가능
- WebSocket 프로토콜이 명확히 정의되어 있어 인터페이스 계약 보장
- 프로토타입 수준이므로 단순성과 속도 우선
- 향후 확장 시 유닛을 더 세분화하거나 리팩토링 가능
