# Requirement Verification Questions

**Purpose**: 요구사항을 명확히 하고 프로젝트 범위를 정의하기 위한 질문입니다.

**Instructions**: 각 질문에 대해 [Answer]: 태그 뒤에 선택한 옵션의 문자(A, B, C, D, X)를 기입하세요. "X) Other"를 선택한 경우 구체적인 설명을 추가하세요.

---

## Section 1: 기능 요구사항 (Functional Requirements)

### Question 1.1: 게임 모드
멀티플레이어 추가 시 기존 AI 모드는 어떻게 할까요?

A) AI 모드 유지 — 게임 시작 시 "AI 대전" 또는 "멀티플레이어" 선택 가능
B) 멀티플레이어만 — AI 모드 완전히 제거
C) 멀티플레이어 전용 — AI 모드는 나중에 다시 추가 고려
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 1.2: 매칭 시스템 세부사항
매칭 큐에 대한 구체적인 요구사항이 있나요?

A) 간단한 FIFO 큐 — 접속 순서대로 자동 매칭 (대기 시간 표시 없음)
B) FIFO 큐 + 대기 UI — 현재 대기 중인 플레이어 수 표시, 매칭 대기 화면
C) 고급 매칭 — 플레이어가 방을 생성하거나 특정 방에 입장 가능
D) 랜덤 매칭 + 재매칭 — 매칭 후 상대방 수락/거부 가능
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 1.3: 게임 규칙 변경
현재 게임 규칙(10장 카드, 10 HP, 10턴 최대)을 멀티플레이어에서도 유지할까요?

A) 현재 규칙 유지 — 10장 카드, 10 HP, 10턴 동일
B) 규칙 조정 필요 — 카드 수/HP/턴 수 변경 제안 있음 (아래 설명)
X) Other (please describe after [Answer]: tag below)

[Answer]: 아마 계속 규칙이 바뀔건데, 현재 규칙 기준으로 구현해보자. 나중에 확장될거야.

---

### Question 1.4: 턴 시간 제한
플레이어의 카드 선택 시간에 제한을 둘까요?

A) 무제한 — 플레이어가 원하는 만큼 대기 가능 (상대방은 기다림)
B) 시간 제한 있음 — 턴당 30초 제한, 초과 시 자동으로 랜덤 카드 제출
C) 시간 제한 있음 + 경고 — 턴당 60초 제한, 10초 전 경고 표시
D) 짧은 시간 제한 — 턴당 15초로 빠른 게임 진행
X) Other (please describe after [Answer]: tag below)

[Answer]: 10초

---

### Question 1.5: 연결 끊김 처리
플레이어 연결이 끊겼을 때 어떻게 처리할까요?

A) 즉시 게임 종료 — 연결이 끊긴 플레이어는 패배 처리
B) 재연결 허용 — 30초간 재연결 대기, 실패 시 패배
C) 재연결 + AI 대체 — 재연결 전까지 AI가 임시로 플레이 (선택 사항)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 1.6: 게임 기록 및 통계
게임 결과를 저장하고 통계를 제공할까요?

A) 저장 안 함 — 게임 종료 시 데이터 소멸, 통계 없음
B) 간단한 통계 — 브라우저 로컬 스토리지에 승/패 기록만 저장
C) 서버 저장 — 서버에 게임 기록 저장, 사용자별 승률 제공 (인증 필요)
D) 리더보드 — 전체 플레이어 랭킹 표시
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 1.7: 채팅 기능
게임 중 플레이어 간 소통 기능이 필요한가요?

A) 채팅 불필요 — 게임 플레이만 집중
B) 간단한 이모티콘 — 정해진 이모티콘(👍, 😊, 😢 등)만 전송 가능
C) 텍스트 채팅 — 자유로운 텍스트 메시지 전송 (욕설 필터 필요)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Section 2: 비기능 요구사항 (Non-Functional Requirements)

### Question 2.1: 예상 동시 사용자 수
예상되는 동시 접속자 또는 동시 게임 수는?

A) 소규모 — 10명 미만 (친구들과 테스트)
B) 중규모 — 50~100명 (소규모 커뮤니티)
C) 대규모 — 1000명 이상 (공개 서비스)
D) 모름 — 일단 작게 시작하고 나중에 확장
X) Other (please describe after [Answer]: tag below)

[Answer]: D

---

### Question 2.2: 응답 시간 (네트워크 지연)
카드 제출 후 결과 표시까지 허용 가능한 지연 시간은?

A) 매우 빠름 — 100ms 이내 (실시간 게임 느낌)
B) 빠름 — 500ms 이내 (충분히 빠름)
C) 보통 — 1초 이내 (허용 가능)
D) 상관없음 — 2~3초도 괜찮음
X) Other (please describe after [Answer]: tag below)

[Answer]: D

---

### Question 2.3: 보안 수준
어느 정도의 보안 강화가 필요한가요?

A) 최소 보안 — 기본적인 서버 검증만 (치팅 방지)
B) 표준 보안 — 입력 검증, Rate Limiting, HTTPS
C) 높은 보안 — 사용자 인증, 토큰 기반 세션, 보안 감사 로그
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 2.4: 배포 환경
서버를 어디에 배포할 계획인가요?

A) 로컬 개발만 — 외부 배포 없음
B) 개인 서버 — 자체 서버 또는 VPS (AWS EC2, DigitalOcean 등)
C) 클라우드 플랫폼 — Heroku, Railway, Vercel 등 간편 배포
D) 아직 미정 — 나중에 결정
X) Other (please describe after [Answer]: tag below)

[Answer]: 로컬인데 동일한 와이파이 환경에서 구현 가능하게 가능?

---

## Section 3: 기술 선호도 (Technical Preferences)

### Question 3.1: 서버 기술 스택
어떤 서버 기술 스택을 선호하시나요?

A) Node.js + Socket.io (제안된 스택, JavaScript 풀스택)
B) Python + Flask/FastAPI + WebSocket
C) 다른 기술 스택 선호 (아래 설명)
D) 상관없음 — AI 추천대로
X) Other (please describe after [Answer]: tag below)

[Answer]: D

---

### Question 3.2: 코드 구조
기존 코드를 어떻게 재구성할까요?

A) 최소 변경 — 기존 index.html 유지, WebSocket 통신만 추가
B) 모듈화 — HTML/CSS/JS 분리, 클라이언트 코드 재구성
C) 완전 재작성 — 클린 아키텍처로 처음부터 다시 설계
D) 점진적 개선 — 일단 작동하게 만들고 나중에 리팩토링
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 3.3: 테스트 코드
테스트 코드 작성이 필요한가요?

A) 불필요 — 수동 테스트로 충분
B) 서버 로직만 — 서버 사이드 게임 로직에 대한 유닛 테스트
C) 통합 테스트 — 서버-클라이언트 통신 테스트 포함
D) 포괄적 테스트 — 유닛 + 통합 + E2E 테스트
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Section 4: 프로젝트 제약사항 (Project Constraints)

### Question 4.1: 개발 기간
프로젝트 완료 목표 시점은?

A) 빠르게 — 1~3일 (MVP, 핵심 기능만)
B) 여유 있게 — 1~2주 (전체 기능 + 테스트)
C) 천천히 — 1개월 이상 (높은 품질, 완벽한 구현)
D) 제한 없음 — 필요한 만큼
X) Other (please describe after [Answer]: tag below)

[Answer]: 지금 즉시. 프로토 타입 수준으로도 충분.

---

### Question 4.2: 우선순위
가장 중요한 우선순위는?

A) 빠른 구현 — 일단 작동하게 만들기
B) 코드 품질 — 유지보수 가능한 깔끔한 코드
C) 성능 — 빠른 응답 시간, 낮은 지연
D) 확장성 — 미래에 기능 추가 용이
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Section 5: Extension 설정

### Question 5.1: Security Extensions
이 프로젝트에 보안 확장 규칙을 적용할까요?

A) Yes — 모든 SECURITY 규칙을 차단 제약조건으로 적용 (프로덕션급 애플리케이션 권장)
B) No — 모든 SECURITY 규칙 생략 (PoC, 프로토타입, 실험 프로젝트에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 5.2: Property-Based Testing Extension
이 프로젝트에 속성 기반 테스트(PBT) 규칙을 적용할까요?

A) Yes — 모든 PBT 규칙을 차단 제약조건으로 적용 (비즈니스 로직, 데이터 변환, 직렬화, 상태 관리 컴포넌트가 있는 프로젝트 권장)
B) Partial — 순수 함수 및 직렬화 라운드트립에만 PBT 규칙 적용 (알고리즘 복잡도가 제한적인 프로젝트에 적합)
C) No — 모든 PBT 규칙 생략 (단순 CRUD 애플리케이션, UI 전용 프로젝트, 중요한 비즈니스 로직이 없는 얇은 통합 레이어에 적합)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Instructions for Completion

1. 위 모든 질문에 대해 [Answer]: 태그 뒤에 선택한 옵션(A, B, C, D, X)을 기입하세요
2. "X) Other"를 선택한 경우, 구체적인 설명을 추가하세요
3. 파일을 저장하고 완료되었음을 알려주세요
4. 모든 답변이 명확하지 않은 경우, 추가 질문이 제공될 수 있습니다

---

**작성 완료 후 "답변 완료" 또는 "질문 답변 완료했습니다"라고 알려주세요.**
