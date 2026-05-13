# Technology Stack

## Current Technology Stack

### Programming Languages
- **JavaScript** - ES6+ - 클라이언트 사이드 게임 로직
- **HTML5** - 5 - 마크업 및 구조
- **CSS3** - 3 - 스타일링 및 레이아웃

### Frameworks
- **없음** - 순수 Vanilla JavaScript로 구현

### Runtime Environment
- **브라우저** - 모든 모던 브라우저 (Chrome, Firefox, Safari, Edge)

### Infrastructure
- **Python HTTP Server** - 3.x - 개발 환경 정적 파일 서버 (포트 8080)

### Build Tools
- **없음** - 빌드 프로세스 없음

### Testing Tools
- **없음** - 테스트 코드 없음

### Version Control
- **Git** - 소스 코드 버전 관리

---

## Proposed Technology Stack (멀티플레이어 구현)

### Backend (Server)

#### Programming Language
- **Node.js** - v18+ (LTS) - 서버 사이드 런타임
  - **선택 이유**: JavaScript 풀스택, 비동기 I/O, WebSocket 지원 우수

#### Web Framework
- **Express.js** - v4.x - HTTP 서버 프레임워크
  - **선택 이유**: 간단하고 널리 사용됨, Socket.io와 통합 용이

#### WebSocket Library
- **Socket.io** - v4.x - 실시간 양방향 통신
  - **Server**: socket.io (서버 라이브러리)
  - **Client**: socket.io-client (클라이언트 라이브러리)
  - **선택 이유**: 
    - 자동 재연결
    - 방(Room) 기능으로 1:1 매칭 구현 용이
    - 이벤트 기반 통신
    - Fallback 지원 (WebSocket 실패 시 Long Polling)

#### Process Management (Optional)
- **PM2** - v5.x - Node.js 프로세스 관리
  - **선택 이유**: 무중단 재시작, 로그 관리, 클러스터링

### Frontend (Client)

#### 기존 유지
- **HTML5** - 마크업
- **CSS3** - 스타일링
- **Vanilla JavaScript** - 클라이언트 로직

#### 추가
- **Socket.io-client** - v4.x - WebSocket 클라이언트

### Data Storage (Optional - 향후 확장)

#### In-Memory (현재 제안)
- **JavaScript Objects** - 게임 세션 상태 저장
  - **장점**: 빠른 성능, 구현 간단
  - **단점**: 서버 재시작 시 데이터 손실

#### Persistent Storage (향후)
- **Redis** - v7.x - 인메모리 데이터베이스
  - **용도**: 세션 관리, 매칭 큐, 게임 상태 캐싱
- **PostgreSQL** 또는 **MongoDB** - 사용자 통계, 게임 기록 저장
  - **용도**: 사용자 프로필, 승패 기록, 리더보드

### Development Tools

#### Package Manager
- **npm** 또는 **yarn** - 의존성 관리

#### Code Quality
- **ESLint** - JavaScript 린팅
- **Prettier** - 코드 포매팅

#### Testing (향후)
- **Jest** - 유닛 테스트
- **Supertest** - API 테스트
- **Socket.io-client** (테스트용) - WebSocket 테스트

### Deployment Options

#### Option 1: Simple Deployment
- **서버**: AWS EC2, DigitalOcean Droplet, Heroku
- **클라이언트**: 정적 파일을 서버와 함께 호스팅

#### Option 2: Separate Deployment
- **서버**: AWS EC2/ECS, Heroku, Railway
- **클라이언트**: AWS S3 + CloudFront, Netlify, Vercel
- **장점**: 정적 파일 CDN 캐싱, 서버 부하 감소

#### Option 3: Serverless (향후 고려)
- **AWS Lambda + API Gateway + WebSocket API**
- **장점**: 자동 스케일링, 비용 효율적
- **단점**: 상태 관리 복잡도 증가

### Monitoring & Logging (향후)

#### Logging
- **Winston** 또는 **Pino** - 구조화된 로그
- **Morgan** - HTTP 요청 로깅

#### Monitoring
- **PM2 Plus** - 애플리케이션 모니터링
- **New Relic** 또는 **Datadog** - APM (Application Performance Monitoring)

---

## Technology Stack Comparison

| Category | Current | Proposed (MVP) | Future Expansion |
|----------|---------|----------------|------------------|
| **Frontend** | Vanilla JS | Vanilla JS + Socket.io-client | React/Vue (optional) |
| **Backend** | 없음 | Node.js + Express + Socket.io | + Redis + DB |
| **Storage** | 브라우저 메모리 | 서버 메모리 (JS Objects) | Redis + PostgreSQL |
| **Deployment** | Python HTTP | Node.js Server | Docker + K8s |
| **Testing** | 없음 | 없음 (MVP) | Jest + Supertest |
| **Monitoring** | 없음 | Console Logs | Winston + PM2 Plus |

---

## Dependencies Overview (멀티플레이어 MVP)

### Server Dependencies (`package.json`)
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "socket.io": "^4.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

### Client Dependencies
- **Socket.io-client** - CDN 또는 npm으로 제공
  ```html
  <script src="/socket.io/socket.io.js"></script>
  ```
  (Socket.io 서버가 자동으로 클라이언트 라이브러리 제공)

---

## Browser Compatibility

### Current Support
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Future Support (WebSocket)
- ✅ Chrome 16+ (WebSocket 지원)
- ✅ Firefox 11+
- ✅ Safari 7+
- ✅ Edge 12+
- 📱 모바일 브라우저 대부분 지원
