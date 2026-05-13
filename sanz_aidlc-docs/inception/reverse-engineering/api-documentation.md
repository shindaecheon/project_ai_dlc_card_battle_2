# API Documentation

## Current State: No APIs
현재 시스템은 완전히 클라이언트 사이드 애플리케이션으로, 외부 API나 네트워크 통신이 존재하지 않습니다.

## Internal APIs (JavaScript Functions)

### Game Management APIs

#### `startGame()`
- **Purpose**: 새 게임을 시작하거나 재시작
- **Parameters**: 없음
- **Returns**: void
- **Side Effects**:
  - 52장의 카드 덱 생성 및 셔플
  - 플레이어와 AI에게 각각 10장 배분
  - HP를 10으로 초기화
  - 턴을 1로 초기화
  - 게임 상태를 활성화
  - UI 업데이트
  - 게임 오버 오버레이 숨김

#### `playCard(index: number)`
- **Purpose**: 플레이어가 선택한 카드로 한 턴 진행
- **Parameters**:
  - `index`: 플레이어 패에서 선택한 카드의 인덱스 (0-based)
- **Returns**: void
- **Preconditions**: `isPlaying === true`
- **Side Effects**:
  - 플레이어 패에서 카드 제거
  - AI 카드 선택 및 제거
  - 배틀 영역에 카드 표시
  - 승패 판정 및 HP 업데이트
  - 결과 메시지 표시
  - 턴 증가
  - UI 업데이트
  - 게임 종료 조건 확인 (HP 0 또는 카드 소진)
  - 1초 후 다음 턴 준비 또는 게임 종료

#### `endGame()`
- **Purpose**: 게임 종료 및 최종 결과 표시
- **Parameters**: 없음
- **Returns**: void
- **Logic**:
  - 양쪽 HP 비교하여 승패 판정
  - 게임 오버 오버레이 표시
  - 최종 점수 표시

### AI APIs

#### `chooseAiCard(playerCard: Card): number`
- **Purpose**: AI의 카드 선택 전략 실행
- **Parameters**:
  - `playerCard`: 플레이어가 제출한 카드 객체 `{ suit, rank, value }`
- **Returns**: AI 패에서 선택한 카드의 인덱스 (number)
- **Strategy**:
  1. 플레이어 카드를 이길 수 있는 카드 필터링
  2. 이길 수 있는 카드 중 가장 낮은 값 선택
  3. 이길 수 없다면 가장 낮은 카드 버림

### UI Rendering APIs

#### `updateUI()`
- **Purpose**: 게임 상태를 화면에 반영
- **Parameters**: 없음
- **Returns**: void
- **Updates**:
  - 플레이어 HP 표시
  - AI HP 표시
  - 현재 턴 표시
  - AI 남은 카드 수 표시
  - 플레이어 패 렌더링
  - AI 카드 뒷면 렌더링

#### `renderPlayerHand()`
- **Purpose**: 플레이어의 카드 패를 화면에 렌더링
- **Parameters**: 없음
- **Returns**: void
- **Logic**:
  - 플레이어 패 배열을 순회
  - 각 카드를 HTML 요소로 생성
  - 카드 색상 적용 (빨강/검정)
  - 클릭 이벤트 리스너 추가 (isPlaying이 true일 때만)
  - DOM에 추가

#### `renderAiCardsBack()`
- **Purpose**: AI의 남은 카드를 뒷면으로 표시
- **Parameters**: 없음
- **Returns**: void
- **Logic**:
  - AI 패 개수만큼 카드 뒷면 요소 생성
  - DOM에 추가

#### `renderBattleCard(element: HTMLElement, card: Card)`
- **Purpose**: 배틀 영역에 제출된 카드 렌더링
- **Parameters**:
  - `element`: 렌더링할 DOM 요소
  - `card`: 표시할 카드 객체 `{ suit, rank, value }`
- **Returns**: void
- **Logic**:
  - 카드 무늬에 따른 색상 적용
  - 카드 등급(rank)과 무늬(suit) 표시

#### `clearBattle()`
- **Purpose**: 배틀 영역 초기화
- **Parameters**: 없음
- **Returns**: void
- **Logic**:
  - 플레이어 배틀 카드를 빈 상태로 변경
  - AI 배틀 카드를 빈 상태로 변경

### Utility APIs

#### `createDeck(): Array<Card>`
- **Purpose**: 52장의 표준 카드 덱 생성
- **Parameters**: 없음
- **Returns**: 카드 객체 배열 `Array<{ suit, rank, value }>`
- **Logic**:
  - 4개 무늬 × 13개 등급 = 52장
  - 각 카드는 `{ suit, rank, value }` 형태

#### `shuffle(array: Array): Array`
- **Purpose**: 배열을 무작위로 섞음 (Fisher-Yates 알고리즘)
- **Parameters**:
  - `array`: 섞을 배열
- **Returns**: 섞인 배열 (원본 수정)
- **Algorithm**: Fisher-Yates shuffle

## Data Models

### Card
```typescript
interface Card {
  suit: string;      // '♠', '♥', '♦', '♣'
  rank: string;      // 'A', '2'-'10', 'J', 'Q', 'K'
  value: number;     // 1-13
}
```

### Game State
```typescript
interface GameState {
  playerHand: Card[];     // 플레이어 카드 패 (0-10장)
  aiHand: Card[];         // AI 카드 패 (0-10장)
  playerHp: number;       // 플레이어 HP (0-10)
  aiHp: number;           // AI HP (0-10)
  turn: number;           // 현재 턴 (1-10)
  isPlaying: boolean;     // 게임 진행 중 여부
}
```

## Future API Requirements (멀티플레이어)

멀티플레이어 전환 시 필요한 서버 API:

### WebSocket Events (Client → Server)

#### `player:join`
- **Purpose**: 플레이어가 게임 매칭 큐에 진입
- **Payload**: `{ playerId: string }`

#### `player:ready`
- **Purpose**: 매칭된 게임에서 플레이어 준비 완료 신호
- **Payload**: `{ gameId: string, playerId: string }`

#### `card:submit`
- **Purpose**: 플레이어가 카드 제출
- **Payload**: `{ gameId: string, playerId: string, cardIndex: number }`

#### `game:quit`
- **Purpose**: 게임 중도 포기
- **Payload**: `{ gameId: string, playerId: string }`

### WebSocket Events (Server → Client)

#### `match:found`
- **Purpose**: 매칭 완료 알림
- **Payload**: `{ gameId: string, opponentId: string, initialState: GameState }`

#### `game:start`
- **Purpose**: 게임 시작 신호
- **Payload**: `{ gameId: string, playerHand: Card[], turn: 1 }`

#### `turn:result`
- **Purpose**: 턴 결과 전송
- **Payload**: `{ gameId: string, playerCard: Card, opponentCard: Card, winner: string, newState: GameState }`

#### `game:end`
- **Purpose**: 게임 종료 알림
- **Payload**: `{ gameId: string, winner: string, reason: string, finalState: GameState }`

#### `opponent:disconnected`
- **Purpose**: 상대방 연결 끊김 알림
- **Payload**: `{ gameId: string }`
