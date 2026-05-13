# System Architecture

## System Overview
현재 시스템은 클라이언트 사이드 전용 단일 플레이어 카드 배틀 게임입니다. 모든 로직과 UI가 단일 HTML 파일 내의 JavaScript로 구현되어 있으며, 서버 컴포넌트는 존재하지 않습니다. 게임 상태는 브라우저 메모리에서만 관리되며, AI 대전 상대는 클라이언트 사이드 로직으로 구현되어 있습니다.

## Architecture Diagram

```mermaid
flowchart TB
    subgraph Browser["브라우저 환경"]
        UI[UI Layer<br/>HTML + CSS]
        GameLogic[Game Logic<br/>JavaScript]
        AIEngine[AI Engine<br/>Card Selection Strategy]
        StateManager[State Manager<br/>HP, Hand, Turn]
    end
    
    User[사용자] -->|클릭/인터랙션| UI
    UI -->|카드 선택 이벤트| GameLogic
    GameLogic -->|상태 업데이트| StateManager
    GameLogic -->|AI 턴 실행| AIEngine
    AIEngine -->|카드 선택| GameLogic
    StateManager -->|상태 표시| UI
    
    style Browser fill:#e3f2fd
    style UI fill:#90caf9
    style GameLogic fill:#66bb6a
    style AIEngine fill:#ffa726
    style StateManager fill:#ab47bc
    style User fill:#4fc3f7
```

## Component Descriptions

### UI Layer (HTML + CSS)
- **Purpose**: 게임 화면 표시 및 사용자 인터랙션 처리
- **Responsibilities**: 
  - 상태 바 표시 (플레이어/AI HP, 턴 수)
  - 배틀 영역 표시 (제출된 카드)
  - 플레이어 패 표시 및 카드 선택 UI
  - 게임 결과 오버레이 표시
  - AI 남은 카드 시각화
- **Dependencies**: GameLogic (이벤트 핸들러 연결)
- **Type**: Presentation Layer

### Game Logic (JavaScript)
- **Purpose**: 게임 규칙 적용 및 게임 플로우 제어
- **Responsibilities**:
  - 덱 생성 및 셔플
  - 카드 배분
  - 배틀 판정 (카드 비교 및 HP 계산)
  - 게임 종료 조건 체크
  - 턴 진행 제어
- **Dependencies**: State Manager, AI Engine, UI Layer
- **Type**: Business Logic Layer

### AI Engine (JavaScript)
- **Purpose**: AI 플레이어의 카드 선택 전략 구현
- **Responsibilities**:
  - 현재 상황에 맞는 최적 카드 선택
  - 전략: 이길 수 있는 가장 낮은 카드, 없으면 가장 낮은 카드 버림
- **Dependencies**: State Manager (AI 패 정보)
- **Type**: Business Logic Layer

### State Manager (JavaScript Variables)
- **Purpose**: 게임 상태 관리
- **Responsibilities**:
  - 플레이어/AI HP 추적
  - 플레이어/AI 패 관리
  - 턴 수 추적
  - 게임 진행 상태 플래그 관리
- **Dependencies**: None
- **Type**: Data Layer

## Data Flow

```mermaid
sequenceDiagram
    participant User as 사용자
    participant UI as UI Layer
    participant Game as Game Logic
    participant AI as AI Engine
    participant State as State Manager

    User->>UI: 게임 시작 버튼 클릭
    UI->>Game: startGame()
    Game->>State: 덱 생성, 카드 배분, HP 초기화
    Game->>UI: updateUI()
    
    loop 매 턴 (최대 10턴)
        User->>UI: 카드 선택
        UI->>Game: playCard(index)
        Game->>State: 플레이어 카드 제거
        Game->>AI: chooseAiCard(playerCard)
        AI-->>Game: AI 카드 인덱스 반환
        Game->>State: AI 카드 제거
        Game->>Game: 배틀 판정 (카드 비교)
        Game->>State: HP 업데이트
        Game->>UI: 배틀 결과 표시
        Game->>UI: updateUI()
        
        alt HP가 0이거나 카드 소진
            Game->>UI: endGame()
            UI->>User: 게임 종료 오버레이 표시
        end
    end
```

## Integration Points

### External APIs
- 없음 (완전히 클라이언트 사이드 애플리케이션)

### Databases
- 없음 (브라우저 메모리에서만 상태 관리)

### Third-party Services
- 없음

## Infrastructure Components

### CDK Stacks
- 없음

### Deployment Model
- 정적 파일 호스팅 (HTTP 서버로 제공)
- 현재: Python HTTP 서버 (포트 8080)
- 프로덕션 가능: 모든 정적 파일 호스팅 서비스 (S3, Netlify, Vercel 등)

### Networking
- 로컬 HTTP 서버 또는 CDN을 통한 정적 파일 제공
- 클라이언트 사이드 전용 - 네트워크 통신 없음
