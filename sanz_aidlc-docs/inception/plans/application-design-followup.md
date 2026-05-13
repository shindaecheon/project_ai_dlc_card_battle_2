# Application Design Follow-up Questions

## Q5 Follow-up: 클라이언트 WebSocket 통신 구조

**원래 답변**: B) 별도 JS 파일 - socket-client.js 파일 분리

**명확화 필요**: Q5에서 "B) 별도 JS 파일"을 선택하셨는데, 이는 요구사항의 "최소 변경" 및 "코드 구조: 최소 변경 — 기존 index.html 유지" 방침과 차이가 있습니다.

다음 중 어떤 접근을 원하시나요?

A) **별도 JS 파일 생성** - socket-client.js를 새로 만들고 index.html에서 `<script src="socket-client.js"></script>`로 로드
   - 장점: 코드 분리, 가독성 향상
   - 단점: 파일 추가 (최소 변경 원칙에서 벗어남)

B) **index.html 내부에 통합** - 기존 `<script>` 태그 안에 WebSocket 코드 추가
   - 장점: 최소 변경 유지, 단일 파일
   - 단점: 파일이 더 길어짐

C) **하이브리드** - 별도 JS 파일 생성하되, 프로토타입이므로 간단하게만 분리

[Answer]: B

---

**답변 후 "답변 완료"라고 알려주세요.**
