# Interaction Diagrams

## Overview
이 문서는 카드 배틀 게임의 주요 비즈니스 트랜잭션이 컴포넌트 간에 어떻게 구현되는지 시각화합니다.

---

## 1. 게임 시작 (Game Initialization)

### Sequence Diagram

```mermaid
sequenceDiagram
    participant User as 사용자
    participant UI as UI Layer<br/>(HTML/CSS)
    participant Game as Game Logic<br/>(startGame)
    participant Deck as Deck Manager<br/>(createDeck, shuffle)
    participant State as Game State<br/>(Variables)
    
    User->>UI: "다시 하기" 버튼 클릭 또는 페이지 로드
    UI->>Game: startGame() 호출
    
    Note over Game: 게임 오버 오버레이 숨김
    
    Game->>Deck: createDeck() 호출
    Deck-->>Game: 52장 덱 반환
    
    Game->>Deck: shuffle(deck) 호출
    Deck-->>Game: 섞인 덱 반환
    
    Note over Game: 카드 배분
    Game->>State: playerHand = deck[0:10]
    Game->>State: aiHand = deck[10:20]
    
    Note over Game: 게임 상태 초기화
    Game->>State: playerHp = 10
    Game->>State: aiHp = 10
    Game->>State: turn = 1
    Game->>State: isPlaying = true
    
    Game->>UI: updateUI() 호출
    UI->>State: 상태 읽기 (HP, 턴, 패)
    UI->>UI: renderPlayerHand()
    UI->>UI: renderAiCardsBack()
    UI->>UI: clearBattle()
    
    UI-->>User: 게임 화면 표시<br/>(플레이어 패 10장, AI 카드 뒷면)
```

### Component Flow

```mermaid
flowchart LR
    A[사용자 입력] --> B[UI 이벤트]
    B --> C[startGame 호출]
    C --> D[덱 생성 및 셔플]
    D --> E[카드 배분]
    E --> F[상태 초기화]
    F --> G[UI 업데이트]
    G --> H[게임 준비 완료]
    
    style A fill:#4fc3f7
    style C fill:#66bb6a
    style D fill:#ffa726
    style F fill:#ab47bc
    style H fill:#26a69a
```

---

## 2. 카드 제출 및 배틀 (Card Submission & Battle)

### Sequence Diagram

```mermaid
sequenceDiagram
    participant User as 사용자
    participant UI as UI Layer
    participant Game as Game Logic<br/>(playCard)
    participant AI as AI Engine<br/>(chooseAiCard)
    participant State as Game State
    
    Note over User: 플레이어 턴
    User->>UI: 카드 클릭
    UI->>Game: playCard(index) 호출
    
    Note over Game: 입력 차단
    Game->>State: isPlaying = false
    
    Note over Game: 플레이어 카드 처리
    Game->>State: playerCard = playerHand.splice(index, 1)[0]
    
    Note over Game: AI 카드 선택 요청
    Game->>AI: chooseAiCard(playerCard) 호출
    
    Note over AI: AI 전략 실행
    AI->>State: aiHand 읽기
    
    alt 이길 수 있는 카드 있음
        AI->>AI: 이길 수 있는 가장 낮은 카드 선택
    else 이길 수 없음
        AI->>AI: 가장 낮은 카드 버림
    end
    
    AI-->>Game: aiCardIndex 반환
    
    Game->>State: aiCard = aiHand.splice(aiCardIndex, 1)[0]
    
    Note over Game: 배틀 카드 표시
    Game->>UI: renderBattleCard(playerBattleCard, playerCard)
    Game->>UI: renderBattleCard(aiBattleCard, aiCard)
    
    Note over Game: 배틀 판정
    alt playerCard.value > aiCard.value
        Game->>State: aiHp -= 1
        Game->>UI: "승리! AI가 HP를 1 잃었습니다."
    else playerCard.value < aiCard.value
        Game->>State: playerHp -= 1
        Game->>UI: "패배! HP를 1 잃었습니다."
    else playerCard.value == aiCard.value
        Game->>UI: "무승부! 피해 없음."
    end
    
    Note over Game: 턴 증가
    Game->>State: turn += 1
    
    Game->>UI: updateUI() 호출
    UI-->>User: 배틀 결과 표시
    
    Note over Game: 게임 종료 조건 확인
    alt HP 0 또는 카드 소진
        Game->>Game: setTimeout(endGame, 1200)
    else 게임 계속
        Game->>Game: setTimeout(() => { isPlaying = true }, 1000)
        Game->>UI: renderPlayerHand() (카드 선택 가능)
    end
```

### Component Flow

```mermaid
flowchart TB
    A[카드 클릭] --> B[playCard 호출]
    B --> C[입력 차단]
    C --> D[플레이어 카드 제거]
    D --> E[AI 카드 선택 요청]
    E --> F{AI 전략}
    F -->|이길 수 있음| G[최소 승리 카드]
    F -->|이길 수 없음| H[최소 카드 버림]
    G --> I[AI 카드 제거]
    H --> I
    I --> J[배틀 영역 렌더링]
    J --> K{배틀 판정}
    K -->|플레이어 승리| L[AI HP -1]
    K -->|AI 승리| M[플레이어 HP -1]
    K -->|무승부| N[피해 없음]
    L --> O[턴 증가]
    M --> O
    N --> O
    O --> P{게임 종료?}
    P -->|Yes| Q[endGame]
    P -->|No| R[다음 턴 준비]
    
    style A fill:#4fc3f7
    style E fill:#ffa726
    style K fill:#ef5350
    style P fill:#ab47bc
    style Q fill:#26a69a
```

---

## 3. AI 카드 선택 전략 (AI Strategy Execution)

### Decision Flow

```mermaid
flowchart TB
    Start[AI 턴 시작] --> Input[플레이어 카드 값 입력]
    Input --> Filter[이길 수 있는 카드 필터링]
    Filter --> Check{이길 수 있는<br/>카드 있음?}
    
    Check -->|Yes| Sort1[오름차순 정렬]
    Sort1 --> Select1[첫 번째 선택<br/>가장 낮은 승리 카드]
    
    Check -->|No| Sort2[전체 패 오름차순 정렬]
    Sort2 --> Select2[첫 번째 선택<br/>가장 낮은 카드]
    
    Select1 --> Return[카드 인덱스 반환]
    Select2 --> Return
    
    style Start fill:#4fc3f7
    style Check fill:#ffa726
    style Select1 fill:#66bb6a
    style Select2 fill:#ef5350
    style Return fill:#ab47bc
```

### Strategy Logic Breakdown

```mermaid
graph TB
    subgraph "Strategy: Minimize Loss"
        A[플레이어 카드: 7] --> B{AI 패 확인}
        B --> C[8, 9, 10, K]
        B --> D[2, 3, 4, 5]
        
        C --> E{이길 수 있음}
        E --> F[승리 카드: 8, 9, 10, K]
        F --> G[선택: 8<br/>최소 승리 카드]
        
        D --> H{이길 수 없음}
        H --> I[전체: 2, 3, 4, 5]
        I --> J[선택: 2<br/>최소 손실]
    end
    
    style A fill:#4fc3f7
    style G fill:#66bb6a
    style J fill:#ef5350
```

---

## 4. 게임 종료 (Game End)

### Sequence Diagram

```mermaid
sequenceDiagram
    participant Game as Game Logic
    participant State as Game State
    participant UI as UI Layer
    participant User as 사용자
    
    Note over Game: 게임 종료 조건 감지
    alt playerHp <= 0
        Game->>Game: endGame() 호출
    else aiHp <= 0
        Game->>Game: endGame() 호출
    else playerHand.length == 0
        Game->>Game: endGame() 호출
    end
    
    Game->>UI: 게임 오버 오버레이 표시
    
    Note over Game: 승패 판정
    Game->>State: playerHp, aiHp 읽기
    
    alt playerHp <= 0 && aiHp <= 0
        Game->>UI: "무승부!"
    else aiHp <= 0
        Game->>UI: "승리!" (파란색)
    else playerHp <= 0
        Game->>UI: "패배..." (빨간색)
    else playerHp > aiHp
        Game->>UI: "승리!" (파란색)
    else playerHp < aiHp
        Game->>UI: "패배..." (빨간색)
    else playerHp == aiHp
        Game->>UI: "무승부!"
    end
    
    Game->>UI: 최종 점수 표시<br/>"최종 HP — 플레이어: X / AI: Y"
    
    UI-->>User: 게임 오버 화면<br/>"다시 하기" 버튼 표시
    
    User->>UI: "다시 하기" 클릭 (optional)
    UI->>Game: startGame() 호출
```

### End Condition Decision Tree

```mermaid
flowchart TB
    Start[턴 종료] --> Check1{HP 확인}
    Check1 -->|playerHp <= 0| End1[게임 종료]
    Check1 -->|aiHp <= 0| End2[게임 종료]
    Check1 -->|Both > 0| Check2{카드 확인}
    
    Check2 -->|playerHand 비어있음| End3[게임 종료]
    Check2 -->|aiHand 비어있음| End4[게임 종료]
    Check2 -->|Both 있음| Continue[다음 턴 계속]
    
    End1 --> Judge[승패 판정]
    End2 --> Judge
    End3 --> Judge
    End4 --> Judge
    
    Judge --> Result{최종 HP 비교}
    Result -->|playerHp > aiHp| Win[플레이어 승리]
    Result -->|playerHp < aiHp| Lose[플레이어 패배]
    Result -->|playerHp == aiHp| Draw[무승부]
    
    style Start fill:#4fc3f7
    style Check1 fill:#ffa726
    style Check2 fill:#ffa726
    style Judge fill:#ab47bc
    style Win fill:#66bb6a
    style Lose fill:#ef5350
    style Draw fill:#ffd54f
```

---

## 5. UI 업데이트 플로우 (UI Update Flow)

### Data Flow Diagram

```mermaid
flowchart LR
    subgraph State["Game State (Memory)"]
        S1[playerHand]
        S2[aiHand]
        S3[playerHp]
        S4[aiHp]
        S5[turn]
        S6[isPlaying]
    end
    
    subgraph Logic["Game Logic"]
        L1[updateUI]
        L2[renderPlayerHand]
        L3[renderAiCardsBack]
        L4[renderBattleCard]
    end
    
    subgraph Display["UI Display (DOM)"]
        D1[플레이어 HP 표시]
        D2[AI HP 표시]
        D3[턴 표시]
        D4[플레이어 패 카드]
        D5[AI 카드 뒷면]
        D6[배틀 영역]
    end
    
    S3 -->|읽기| L1
    S4 -->|읽기| L1
    S5 -->|읽기| L1
    S2 -->|읽기| L1
    
    L1 -->|업데이트| D1
    L1 -->|업데이트| D2
    L1 -->|업데이트| D3
    
    S1 -->|읽기| L2
    S6 -->|읽기| L2
    L2 -->|렌더링| D4
    
    S2 -->|길이 읽기| L3
    L3 -->|렌더링| D5
    
    L4 -->|렌더링| D6
    
    style State fill:#ab47bc
    style Logic fill:#66bb6a
    style Display fill:#4fc3f7
```

---

## 6. 전체 게임 플로우 (Complete Game Flow)

### High-Level State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle: 페이지 로드
    
    Idle --> GameStart: startGame() 호출
    
    GameStart --> PlayerTurn: 게임 초기화 완료
    
    PlayerTurn --> BattlePhase: 플레이어 카드 선택
    
    BattlePhase --> AITurn: 배틀 판정 중
    
    AITurn --> ResultDisplay: AI 카드 선택 및 비교
    
    ResultDisplay --> CheckEnd: 1초 대기
    
    CheckEnd --> GameOver: HP 0 또는 카드 소진
    CheckEnd --> PlayerTurn: 게임 계속
    
    GameOver --> Idle: "다시 하기" 클릭
    
    note right of GameStart
        - 덱 생성 및 셔플
        - 카드 배분 (각 10장)
        - HP 초기화 (각 10)
        - 턴 1로 설정
    end note
    
    note right of BattlePhase
        - 플레이어 카드 제거
        - AI 전략 실행
        - AI 카드 제거
        - 배틀 영역 렌더링
    end note
    
    note right of ResultDisplay
        - 카드 비교
        - HP 업데이트
        - 결과 메시지 표시
        - 턴 증가
    end note
```

---

## 7. 멀티플레이어 전환 시 예상 플로우 (Future Multiplayer Flow)

### Proposed Multiplayer Sequence

```mermaid
sequenceDiagram
    participant P1 as 플레이어 1<br/>(브라우저)
    participant Server as WebSocket Server
    participant MM as Match Maker
    participant GM as Game Manager
    participant P2 as 플레이어 2<br/>(브라우저)
    
    Note over P1,P2: 매칭 단계
    P1->>Server: player:join 이벤트
    Server->>MM: addPlayerToQueue(p1)
    P2->>Server: player:join 이벤트
    Server->>MM: addPlayerToQueue(p2)
    
    MM->>GM: createGame(p1, p2)
    GM-->>Server: gameId 생성
    
    Server->>P1: match:found 이벤트
    Server->>P2: match:found 이벤트
    
    Note over P1,P2: 게임 시작
    GM->>GM: 덱 생성 및 배분
    Server->>P1: game:start { hand: [...] }
    Server->>P2: game:start { hand: [...] }
    
    Note over P1,P2: 게임 플레이
    loop 매 턴
        P1->>Server: card:submit { cardIndex }
        Server->>GM: validateCard(p1, cardIndex)
        
        Note over Server: P2 대기 중...
        
        P2->>Server: card:submit { cardIndex }
        Server->>GM: validateCard(p2, cardIndex)
        
        GM->>GM: 배틀 판정
        GM-->>Server: 턴 결과
        
        Server->>P1: turn:result { ... }
        Server->>P2: turn:result { ... }
    end
    
    Note over P1,P2: 게임 종료
    GM->>GM: 게임 종료 조건 확인
    Server->>P1: game:end { winner: ... }
    Server->>P2: game:end { winner: ... }
```

### Multiplayer Component Interaction

```mermaid
flowchart TB
    subgraph Client1["클라이언트 1"]
        C1UI[UI]
        C1Socket[Socket Handler]
    end
    
    subgraph Server["서버"]
        SocketIO[Socket.io Server]
        MM[Match Maker]
        GM[Game Manager]
        GL[Game Logic]
    end
    
    subgraph Client2["클라이언트 2"]
        C2UI[UI]
        C2Socket[Socket Handler]
    end
    
    C1UI -->|카드 선택| C1Socket
    C1Socket <-->|WebSocket| SocketIO
    
    C2UI -->|카드 선택| C2Socket
    C2Socket <-->|WebSocket| SocketIO
    
    SocketIO --> MM
    MM --> GM
    GM --> GL
    GL -->|판정 결과| GM
    GM -->|상태 업데이트| SocketIO
    
    SocketIO -->|turn:result| C1Socket
    SocketIO -->|turn:result| C2Socket
    
    C1Socket -->|UI 업데이트| C1UI
    C2Socket -->|UI 업데이트| C2UI
    
    style Server fill:#66bb6a
    style Client1 fill:#4fc3f7
    style Client2 fill:#ef5350
```

---

## Summary

이 문서는 다음 비즈니스 트랜잭션의 구현 방식을 시각화했습니다:

1. ✅ **게임 시작**: 덱 생성 → 카드 배분 → 상태 초기화 → UI 렌더링
2. ✅ **카드 제출 및 배틀**: 플레이어 선택 → AI 전략 → 배틀 판정 → 결과 표시
3. ✅ **AI 전략**: 승리 가능성 확인 → 최적 카드 선택
4. ✅ **게임 종료**: 종료 조건 확인 → 승패 판정 → 결과 화면
5. ✅ **UI 업데이트**: 상태 읽기 → DOM 업데이트
6. ✅ **전체 플로우**: 상태 머신으로 게임 흐름 정의
7. 📋 **멀티플레이어 예상 플로우**: 향후 구현 시 참고용
