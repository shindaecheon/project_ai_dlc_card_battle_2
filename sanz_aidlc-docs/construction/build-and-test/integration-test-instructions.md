# Integration Test Instructions - Card Battle Multiplayer Game

## Overview
Unit 1 (Server) + Unit 2 (Client) 통합 테스트 지침

**목적**: 서버와 클라이언트가 함께 정상 작동하는지 검증

---

## Prerequisites

### Server Status
- ✅ 서버 실행 중 (`npm start`)
- ✅ 포트 3000 리스닝
- ✅ 새 코드 반영됨 (멀티플레이어 기능)

### Test Environment
- **브라우저**: Chrome, Firefox, Safari, Edge (최신 버전)
- **네트워크**: 인터넷 연결 (EC2 배포)
- **테스트 기기**: 최소 1개 (AI 모드), 2개 권장 (멀티플레이어)

---

## Test Scenarios

### Scenario 1: AI Mode (Single Player) ✅

**목적**: 기존 AI 모드가 정상 작동하는지 확인

#### Step 1: 접속
1. 브라우저에서 `http://98.85.250.49:3000` 접속
2. 모드 선택 화면 표시 확인
   - ✅ "🎮 카드 배틀" 제목
   - ✅ "🤖 AI 대전" 버튼
   - ✅ "🌐 멀티플레이어" 버튼

#### Step 2: AI 모드 시작
1. "🤖 AI 대전" 버튼 클릭
2. 게임 화면 표시 확인
   - ✅ 플레이어 HP: 10
   - ✅ 상대 HP: 10
   - ✅ 턴: 1 / 10
   - ✅ 플레이어 패: 10장 카드
   - ✅ 상대 남은 카드: 10장 (뒷면)

#### Step 3: 게임 플레이
1. 카드 1장 클릭
2. 배틀 결과 확인
   - ✅ 플레이어 카드 표시
   - ✅ 상대 카드 표시
   - ✅ 결과 메시지 ("승리!" / "패배!" / "무승부!")
   - ✅ HP 변화 정확
3. 계속 플레이 (10턴 또는 HP 0까지)

#### Step 4: 게임 종료
1. 게임 오버 화면 표시 확인
   - ✅ 승리/패배/무승부 표시
   - ✅ 최종 HP 표시
   - ✅ "메인 메뉴로" 버튼
2. "메인 메뉴로" 클릭
3. 모드 선택 화면으로 복귀 확인

**Expected Result**: ✅ 모든 단계 정상 작동

---

### Scenario 2: Multiplayer Mode (Two Players) ✅

**목적**: 멀티플레이어 모드가 정상 작동하는지 확인

#### Preparation
- **기기 1**: 브라우저 1 (Player 1)
- **기기 2**: 브라우저 2 또는 다른 기기 (Player 2)
- 두 브라우저 모두 `http://98.85.250.49:3000` 접속

---

#### Step 1: 매칭 시작

**브라우저 1 (Player 1)**:
1. "🌐 멀티플레이어" 버튼 클릭
2. 매칭 대기 화면 표시 확인
   - ✅ "매칭 중..." 메시지
   - ✅ "상대방을 찾고 있습니다" 메시지

**브라우저 2 (Player 2)**:
1. "🌐 멀티플레이어" 버튼 클릭
2. 매칭 대기 화면 표시 확인

---

#### Step 2: 매칭 완료 및 게임 시작

**자동 매칭** (2명이 큐에 진입하면 즉시 매칭):
- ✅ 양쪽 브라우저에서 매칭 대기 화면 사라짐
- ✅ 양쪽 브라우저에서 게임 화면 표시

**게임 화면 확인** (양쪽):
- ✅ 플레이어 HP: 10
- ✅ 상대 HP: 10
- ✅ 턴: 1 / 10
- ✅ 내 패: 10장 (각자 다른 카드)
- ✅ 타이머 표시: "남은 시간: 10초"
- ✅ 이모티콘 버튼 5개 표시

---

#### Step 3: Turn 1 - 카드 제출

**Player 1**:
1. 카드 1장 선택 및 클릭
2. 카드가 손패에서 사라짐 확인

**Player 2**:
1. 카드 1장 선택 및 클릭
2. 카드가 손패에서 사라짐 확인

**자동 배틀 판정** (양쪽 플레이어 카드 제출 완료 시):
- ✅ 양쪽 브라우저에 배틀 결과 표시
  - Player 1 카드
  - Player 2 카드
  - 승자 결정
- ✅ 결과 메시지 표시
  - 승리 시: "승리! 상대가 HP를 1 잃었습니다."
  - 패배 시: "패배! HP를 1 잃었습니다."
  - 무승부 시: "무승부! 피해 없음."
- ✅ HP 업데이트
  - 패자 HP -1
- ✅ 턴 증가: 2 / 10

---

#### Step 4: Timer Test

**Player 1**:
1. 다음 턴에서 카드를 클릭하지 않음
2. 타이머 카운트다운 확인
   - ✅ 10 → 9 → 8 → ... → 1
   - ✅ 3초 이하일 때 빨간색 + 깜박임

**Player 2**:
1. 카드 1장 클릭

**타임아웃 처리** (10초 경과 시):
- ✅ Player 1의 카드가 자동으로 랜덤 제출됨
- ✅ 배틀 결과 정상 표시

---

#### Step 5: Emoji Test

**Player 1**:
1. 이모티콘 버튼 클릭 (예: 👍)

**Player 2**:
1. 이모티콘 팝업 표시 확인
   - ✅ 화면 중앙에 큰 이모티콘 (👍)
   - ✅ 3초 후 자동으로 사라짐

**Player 2**:
1. 다른 이모티콘 클릭 (예: 😊)

**Player 1**:
1. 이모티콘 팝업 확인

---

#### Step 6: 게임 완료

**계속 플레이**:
- 10턴 완료 또는 한쪽 HP 0까지

**게임 종료** (양쪽 브라우저):
- ✅ 게임 오버 화면 표시
  - 승자: "승리!" (파란색)
  - 패자: "패배..." (빨간색)
  - 무승부: "무승부!" (노란색)
- ✅ 최종 HP 표시
- ✅ "메인 메뉴로" 버튼

**메인 메뉴로 복귀**:
1. 양쪽에서 "메인 메뉴로" 클릭
2. 모드 선택 화면 표시 확인

**Expected Result**: ✅ 모든 단계 정상 작동

---

### Scenario 3: Disconnection Handling ✅

**목적**: 연결 끊김 처리가 정상 작동하는지 확인

#### Setup
1. 두 브라우저에서 멀티플레이어 게임 시작
2. 게임 진행 중 (턴 3~5)

#### Test
**Player 1**:
1. 브라우저 탭 닫기 또는 F5 새로고침

**Player 2**:
1. 알림 메시지 표시 확인
   - ✅ "상대방의 연결이 끊어졌습니다. 게임이 종료됩니다."
2. 모드 선택 화면으로 자동 복귀 확인

**Expected Result**: ✅ 연결 끊김 감지 및 정상 처리

---

### Scenario 4: Concurrent Games ✅

**목적**: 여러 게임이 동시에 진행 가능한지 확인

#### Setup
- 4개 브라우저 탭/기기 준비

#### Test
**Game 1**:
1. 브라우저 1, 2에서 멀티플레이어 선택
2. 매칭 완료 및 게임 시작

**Game 2**:
1. 브라우저 3, 4에서 멀티플레이어 선택
2. 매칭 완료 및 게임 시작

**Verification**:
- ✅ 두 게임이 독립적으로 진행됨
- ✅ 각 게임의 카드/HP가 혼동되지 않음
- ✅ 타이머가 독립적으로 작동

**Expected Result**: ✅ 다중 게임 동시 지원

---

## Test Checklist

### Pre-Test
- [ ] 서버 실행 중 (`ps aux | grep "node server.js"`)
- [ ] 포트 3000 리스닝 중
- [ ] 새 코드 반영 확인 (모드 선택 화면 있음)

### AI Mode
- [ ] 모드 선택 화면 표시
- [ ] AI 대전 버튼 작동
- [ ] 게임 화면 정상 렌더링
- [ ] 카드 제출 작동
- [ ] AI 카드 선택 작동
- [ ] 배틀 판정 정확
- [ ] HP 계산 정확
- [ ] 게임 종료 조건 정확
- [ ] 메인 메뉴 복귀 작동

### Multiplayer Mode
- [ ] 멀티플레이어 버튼 작동
- [ ] 매칭 대기 화면 표시
- [ ] 2명 자동 매칭
- [ ] 게임 시작 및 패 배분
- [ ] 카드 제출 실시간 동기화
- [ ] 배틀 결과 동기화
- [ ] HP 동기화
- [ ] 타이머 표시 및 카운트다운
- [ ] 타임아웃 자동 카드 제출
- [ ] 이모티콘 전송/수신
- [ ] 게임 종료 동기화
- [ ] 연결 끊김 처리

### Edge Cases
- [ ] 3명 접속 시 (2명 매칭, 1명 대기)
- [ ] 타임아웃 + 동시 제출
- [ ] 빠른 연속 이모티콘 전송
- [ ] 게임 중 새로고침

---

## Browser Console Check

### Open Developer Tools
- Chrome/Edge: `F12` 또는 `Ctrl+Shift+I`
- Firefox: `F12`
- Safari: `Cmd+Option+I`

### Console Tab
서버 연결 로그 확인:
```
서버 연결됨
매칭 완료: {gameId: "game-1715614800123"}
게임 시작: {gameId: "...", hand: [...], isFirstPlayer: true}
턴 결과: {playerCard: {...}, opponentCard: {...}, ...}
```

### Network Tab
WebSocket 연결 확인:
- ✅ `socket.io` 연결 (WebSocket)
- ✅ Status: 101 Switching Protocols

---

## Server Console Check

서버 터미널에서 로그 확인:
```
[Server] 플레이어 연결: abc123xyz
[MatchMaker] 플레이어 큐 진입: abc123xyz (대기: 1명)
[MatchMaker] 플레이어 큐 진입: def456uvw (대기: 2명)
[MatchMaker] 매칭 성공: abc123xyz vs def456uvw
[GameManager] 게임 생성: game-1715614800123
[GameManager] 플레이어 1 카드 제출: 5♥
[GameManager] 플레이어 2 카드 제출: 9♠
[GameManager] 플레이어 2 승리 (9♠ > 5♥)
```

---

## Common Issues

### Issue 1: 모드 선택 화면이 안 보임
**Cause**: 구버전 index.html이 캐시됨

**Solution**:
```
브라우저에서 Ctrl+Shift+R (강력 새로고침)
또는 Ctrl+F5
```

---

### Issue 2: 매칭이 안 됨
**Cause**: 서버 미실행 또는 WebSocket 연결 실패

**Solution**:
1. 서버 실행 확인: `ps aux | grep "node server.js"`
2. 브라우저 콘솔 확인: WebSocket 에러 체크
3. 방화벽 확인: 포트 3000 개방 확인

---

### Issue 3: 카드 제출이 안 됨
**Cause**: WebSocket 연결 끊김

**Solution**:
1. 브라우저 콘솔 확인: "서버 연결 끊김" 메시지 체크
2. 페이지 새로고침
3. 서버 재시작

---

### Issue 4: 타이머가 표시 안 됨
**Cause**: AI 모드에서는 타이머가 표시되지 않음 (정상)

**Solution**:
- 멀티플레이어 모드에서만 타이머 표시됨

---

## Test Results Template

### Test Execution Log
```
Date: 2026-05-13
Tester: [Your Name]
Server: http://98.85.250.49:3000

Scenario 1: AI Mode
- Status: PASS / FAIL
- Notes: 

Scenario 2: Multiplayer Mode
- Status: PASS / FAIL
- Notes: 

Scenario 3: Disconnection Handling
- Status: PASS / FAIL
- Notes: 

Scenario 4: Concurrent Games
- Status: PASS / FAIL
- Notes: 

Overall: PASS / FAIL
```

---

## Expected Test Duration

- **Scenario 1 (AI Mode)**: 5분
- **Scenario 2 (Multiplayer)**: 10분
- **Scenario 3 (Disconnection)**: 3분
- **Scenario 4 (Concurrent)**: 5분

**Total**: ~25분

---

## Success Criteria

통합 테스트 성공 조건:
- ✅ 모든 시나리오 PASS
- ✅ 브라우저 콘솔에 에러 없음
- ✅ 서버 콘솔에 치명적 에러 없음
- ✅ 게임 플레이가 자연스러움

---

## Next Steps

통합 테스트 성공 후:
1. ✅ 성능 테스트 (선택 사항)
2. ✅ 사용자 인수 테스트
3. ✅ 프로젝트 완료

---

## Notes

- 이 테스트는 수동 테스트입니다 (자동화 없음, 프로토타입)
- 실제 네트워크 환경에서 테스트하므로 지연 시간이 발생할 수 있습니다
- 모든 시나리오를 최소 1회 이상 테스트하는 것을 권장합니다
