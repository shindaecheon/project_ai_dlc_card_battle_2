# 브라우저 캐시 문제 해결 가이드

## 현재 상황
- ✅ 서버: 최신 코드 실행 중
- ✅ 코드: 버그 수정 완료
- ❌ 브라우저: 오래된 캐시 버전 사용 중

## 해결 방법

### 방법 1: 강력 새로고침 (권장) ⭐

#### Chrome / Edge
```
Ctrl + Shift + R
또는
Ctrl + F5
```

#### Firefox
```
Ctrl + Shift + R
또는
Ctrl + F5
```

#### Safari (Mac)
```
Cmd + Option + R
```

---

### 방법 2: 캐시 완전 삭제

#### Chrome / Edge
1. **F12** (개발자 도구 열기)
2. **Network** 탭 클릭
3. **Disable cache** 체크박스 선택
4. **페이지 새로고침** (F5)

또는:

1. **Ctrl + Shift + Delete** (캐시 삭제 메뉴)
2. **Cached images and files** 선택
3. **Clear data** 클릭
4. **페이지 새로고침**

#### Firefox
1. **F12** (개발자 도구 열기)
2. **Network** 탭 클릭
3. **우클릭** → **Clear browser cache**
4. **페이지 새로고침**

---

### 방법 3: 시크릿 모드 (빠른 테스트)

#### Chrome / Edge
```
Ctrl + Shift + N
```

#### Firefox
```
Ctrl + Shift + P
```

그런 다음:
```
https://d74vqxd2u3lh.cloudfront.net/proxy/3000/
```
접속

**장점**: 캐시 없이 새로 시작
**단점**: 임시 방편 (다음에 다시 캐시 문제 발생 가능)

---

### 방법 4: 다른 브라우저 사용

현재 사용 중인 브라우저 외 다른 브라우저로 테스트:
- Chrome
- Firefox
- Edge
- Safari

---

## CloudFront 캐시 문제

CloudFront가 오래된 버전을 캐싱하고 있을 수 있습니다.

### 임시 해결: 직접 접속

CloudFront 우회하고 직접 접속:
```
http://98.85.250.49:3000
```

**주의**: HTTP (HTTPS 아님)

---

## 버튼 작동 확인 방법

### 1. 브라우저 콘솔 열기
```
F12 → Console 탭
```

### 2. 버튼 존재 확인
콘솔에 입력:
```javascript
document.getElementById('multiplayer-mode-btn')
```

**예상 결과**:
```html
<button id="multiplayer-mode-btn">🌐 멀티플레이어</button>
```

**❌ 만약 `null`이면**: 페이지가 제대로 로드되지 않음

---

### 3. 이벤트 핸들러 확인
콘솔에 입력:
```javascript
document.getElementById('multiplayer-mode-btn').onclick
```

**예상 결과**:
```javascript
ƒ startMultiplayerMode() { ... }
```

**❌ 만약 `null`이면**: 이벤트 핸들러가 연결되지 않음 (캐시 문제)

---

### 4. 수동 함수 실행
콘솔에 입력:
```javascript
startMultiplayerMode()
```

**예상 결과**: 매칭 대기 화면 표시

**❌ 에러 발생하면**: 콘솔 에러 메시지 확인

---

## 완전한 해결 방법

### Step 1: 캐시 완전 삭제
```
Chrome: Ctrl + Shift + Delete
→ Cached images and files 선택
→ Clear data
```

### Step 2: 개발자 도구로 캐시 비활성화
```
F12 → Network 탭
→ Disable cache 체크
```

### Step 3: 강력 새로고침
```
Ctrl + Shift + R
```

### Step 4: 버튼 클릭 테스트
```
멀티플레이어 버튼 클릭
→ 매칭 대기 화면 표시되어야 함
```

---

## 에러 디버깅

### 에러 1: "startMultiplayerMode is not defined"

**원인**: 오래된 캐시 버전

**해결**:
1. Ctrl + Shift + R (강력 새로고침)
2. 시크릿 모드로 재접속

---

### 에러 2: "Cannot read properties of null"

**원인**: 버튼을 찾을 수 없음

**해결**:
1. 페이지 소스 확인 (Ctrl + U)
2. "multiplayer-mode-btn" 검색
3. 없으면 캐시 문제

---

### 에러 3: "io is not defined"

**원인**: Socket.io 라이브러리 로드 실패

**해결**:
1. Network 탭에서 `/socket.io/socket.io.js` 확인
2. 404 에러면 서버 문제
3. 200 OK면 실행 순서 문제

---

## 확실한 테스트 방법

### 시크릿 모드 + 직접 접속

1. **시크릿 모드 열기**: `Ctrl + Shift + N`
2. **직접 접속**: `http://98.85.250.49:3000`
3. **버튼 클릭 테스트**

**이 방법으로 작동하면**: 캐시 문제 확정
**이 방법으로도 안 되면**: 코드 문제 (추가 디버깅 필요)

---

## 현재 서버 정보

**서버 실행 중**: ✅
**포트**: 3000
**접속 URL**:
- 로컬: `http://localhost:3000`
- 내부: `http://10.0.0.243:3000`
- 외부: `http://98.85.250.49:3000` (포트 개방 필요)
- CloudFront: `https://d74vqxd2u3lh.cloudfront.net/proxy/3000/`

---

## 권장 순서

1. ✅ **시크릿 모드** (`Ctrl + Shift + N`)
2. ✅ **직접 접속** (`http://98.85.250.49:3000`)
3. ✅ **F12 콘솔** 열어서 에러 확인
4. ✅ **버튼 클릭**

이 방법으로 작동하면 → 정상, 일반 모드에서 캐시만 삭제하면 됨
이 방법으로 안 되면 → 추가 디버깅 필요
