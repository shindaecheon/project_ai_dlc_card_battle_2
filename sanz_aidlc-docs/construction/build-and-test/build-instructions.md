# Build Instructions - Card Battle Multiplayer Game

## Overview
멀티플레이어 카드 배틀 게임 빌드 및 실행 지침

**프로젝트 구조**:
- **서버**: Node.js + Express + Socket.io (`server/` 디렉토리)
- **클라이언트**: HTML + Vanilla JavaScript (`index.html`)

---

## Prerequisites

### Required Software
- **Node.js**: v18.0.0 이상 (LTS 권장)
- **npm**: 9.0.0 이상 (Node.js와 함께 설치됨)

### Verify Installation
```bash
node --version  # v18.0.0 이상이어야 함
npm --version   # 9.0.0 이상이어야 함
```

---

## Installation

### Step 1: Navigate to Server Directory
```bash
cd /home/ec2-user/table-order/server
```

### Step 2: Install Dependencies
```bash
npm install
```

**설치되는 패키지**:
- `express` (^4.18.0) - HTTP 서버
- `socket.io` (^4.6.0) - WebSocket 서버
- `nodemon` (^3.0.0) - 개발 모드 자동 재시작 (dev dependency)

**예상 시간**: 30초 ~ 1분

**출력 예시**:
```
added 108 packages, and audited 109 packages in 15s
```

---

## Build Process

**빌드 단계 없음** ✅

이 프로젝트는 빌드 과정이 필요 없습니다:
- 서버: Node.js가 직접 실행
- 클라이언트: 브라우저가 직접 해석
- 번들링 불필요 (프로토타입)

---

## Running the Server

### Option 1: Production Mode (권장)
```bash
npm start
```

**실행 내용**:
- `node server.js` 실행
- 포트 3000에서 서버 시작

**출력 예시**:
```
============================================================
🎮  Card Battle Server - 멀티플레이어 카드 배틀 게임
============================================================
✅ 서버가 시작되었습니다!

📡 접속 주소:
   로컬:     http://localhost:3000
   네트워크: http://98.85.250.49:3000

💡 다른 기기에서 접속하려면 네트워크 주소를 사용하세요.
💡 같은 Wi-Fi 네트워크에 연결되어 있어야 합니다.
============================================================
```

---

### Option 2: Development Mode (개발 시)
```bash
npm run dev
```

**실행 내용**:
- `nodemon server.js` 실행
- 파일 변경 시 자동 재시작

**출력 예시**:
```
[nodemon] 3.0.1
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node server.js`
============================================================
🎮  Card Battle Server
...
```

---

## Stopping the Server

### Method 1: Keyboard Interrupt
서버가 실행 중인 터미널에서:
```
Ctrl + C
```

### Method 2: Kill Process (필요 시)
```bash
# PID 확인
ps aux | grep "node server.js"

# 프로세스 종료
kill <PID>
```

**예시**:
```bash
ps aux | grep "node server.js"
# ec2-user   95603  0.0  0.7 657576 56872 pts/4    Sl+  13:51   0:00 node server.js

kill 95603
```

---

## Server Restart (코드 변경 후)

### 현재 상황
- **기존 서버**: PID 95603, 구버전 코드 실행 중
- **새 코드**: index.html 멀티플레이어 기능 추가됨

### 재시작 절차

#### Step 1: 기존 서버 종료
서버가 실행 중인 터미널 찾기 (pts/4):
```bash
# Ctrl + C 입력
```

또는 다른 터미널에서:
```bash
kill 95603
```

#### Step 2: 새 서버 시작
```bash
cd /home/ec2-user/table-order/server
npm start
```

#### Step 3: 서버 정상 시작 확인
출력에서 다음 확인:
- ✅ "서버가 시작되었습니다!"
- ✅ 접속 주소 표시

---

## Accessing the Game

### Local Access (EC2 인스턴스 내부)
```
http://localhost:3000
```

### Network Access (외부 접속)
```
http://98.85.250.49:3000
```

**브라우저 요구사항**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Port Configuration

### Default Port
- **포트**: 3000
- **프로토콜**: HTTP

### Change Port (선택 사항)
```bash
PORT=8080 npm start
```

또는 `server/server.js` 수정:
```javascript
const PORT = process.env.PORT || 8080;
```

---

## Firewall Configuration (EC2)

### Required Inbound Rule
- **Type**: Custom TCP
- **Port**: 3000
- **Source**: 0.0.0.0/0 (또는 특정 IP)

### Check Firewall Status
```bash
# EC2 보안 그룹 확인 (AWS Console)
# 포트 3000이 열려 있어야 함
```

---

## Static File Serving

서버는 자동으로 정적 파일을 제공합니다:
- `index.html` - 게임 클라이언트
- `/socket.io/socket.io.js` - Socket.io 클라이언트 라이브러리

**설정** (`server/server.js`):
```javascript
app.use(express.static(path.join(__dirname, '..')));
```

---

## Environment Variables

### Supported Variables
- `PORT` - 서버 포트 (기본값: 3000)

### Example
```bash
PORT=8080 npm start
```

---

## Troubleshooting

### Issue 1: Port Already in Use
**Error**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**:
```bash
# 기존 프로세스 찾기
lsof -i :3000

# 프로세스 종료
kill <PID>
```

---

### Issue 2: Cannot Find Module
**Error**:
```
Error: Cannot find module 'express'
```

**Solution**:
```bash
cd /home/ec2-user/table-order/server
npm install
```

---

### Issue 3: Permission Denied
**Error**:
```
Error: listen EACCES: permission denied 0.0.0.0:80
```

**Solution**:
- 포트 80은 root 권한 필요
- 1024 이상 포트 사용 (예: 3000, 8080)

---

### Issue 4: Old Version Still Running
**Symptom**: 코드 변경이 반영되지 않음

**Solution**:
```bash
# 모든 node 프로세스 종료
pkill -f "node server.js"

# 서버 재시작
cd /home/ec2-user/table-order/server
npm start
```

---

## Verification Checklist

### Server Start
- [ ] 서버가 에러 없이 시작됨
- [ ] "서버가 시작되었습니다!" 메시지 표시
- [ ] 로컬 IP 주소 표시됨
- [ ] 포트 3000 리스닝 중

### Network Access
- [ ] `http://localhost:3000` 접속 가능
- [ ] `http://98.85.250.49:3000` 접속 가능 (외부)
- [ ] 모드 선택 화면 표시

### Static Files
- [ ] `index.html` 로드됨
- [ ] Socket.io 클라이언트 로드됨 (개발자 도구에서 확인)

---

## Build Summary

| Component | Build Required | Command | Output |
|-----------|----------------|---------|--------|
| Server | ❌ No | `npm start` | Running server |
| Client | ❌ No | N/A (served by server) | N/A |
| Dependencies | ✅ Yes | `npm install` | node_modules/ |

---

## Next Steps

After successful build and server start:
1. ✅ Verify server is running
2. ✅ Access game in browser
3. ✅ Proceed to testing (see `unit-test-instructions.md`, `integration-test-instructions.md`)

---

## Notes

- 이 프로젝트는 프로토타입 수준으로 빌드 과정이 단순합니다
- 프로덕션 배포 시 추가 고려사항:
  - HTTPS 설정
  - 프로세스 매니저 (PM2 등)
  - 로그 관리
  - 모니터링
- 현재는 EC2 환경에 최적화되어 있습니다
