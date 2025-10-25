# 🔥 Firebase 설정 가이드

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `srl-chatbot` (또는 원하는 이름)
4. Google Analytics 활성화 (선택사항)
5. 프로젝트 생성 완료

## 2. Firestore 데이터베이스 설정

1. Firebase Console에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. 보안 규칙: **테스트 모드로 시작** (개발용)
4. 위치: `asia-northeast3` (서울) 또는 `us-central1` 선택

## 3. 웹 앱 등록

1. Firebase Console에서 "웹" 아이콘 클릭
2. 앱 닉네임: `srl-chatbot-web`
3. "Firebase Hosting도 설정" 체크 해제
4. 앱 등록 완료

## 4. 환경변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

## 5. Firebase 설정 값 찾기

Firebase Console > 프로젝트 설정 > 일반 탭에서:

- **API 키**: `NEXT_PUBLIC_FIREBASE_API_KEY`
- **프로젝트 ID**: `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- **앱 ID**: `NEXT_PUBLIC_FIREBASE_APP_ID`
- **메시징 발신자 ID**: `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`

## 6. Firestore 보안 규칙 (프로덕션용)

개발 완료 후 다음 규칙으로 변경:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 세션 데이터는 읽기/쓰기 허용
    match /sessions/{sessionId} {
      allow read, write: if true;
    }
    
    // 아카이브 데이터는 읽기만 허용
    match /archives/{archiveId} {
      allow read: if true;
      allow write: if false; // API를 통해서만 작성
    }
    
    // 응답 데이터는 읽기/쓰기 허용
    match /responses/{responseId} {
      allow read, write: if true;
    }
  }
}
```

## 7. 테스트

1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 `http://localhost:3000` 접속
3. 챗봇 사용 후 `/data` 페이지에서 데이터 확인
4. `/admin` 페이지에서 대시보드 확인

## 8. Vercel 배포 시 환경변수 설정

1. Vercel 대시보드 > 프로젝트 > Settings > Environment Variables
2. 위의 모든 환경변수 추가
3. Production, Preview, Development 환경 모두 설정

## 🎯 완료!

이제 Firebase가 완전히 연동되어:
- ✅ 학생 응답이 실시간으로 저장
- ✅ 데이터가 영구 보존
- ✅ 관리자 대시보드에서 모니터링 가능
- ✅ Vercel 배포 시에도 데이터 유지

## 📊 무료 한도

- **저장공간**: 1GB (1000명 학생 충분)
- **읽기**: 월 50,000회
- **쓰기**: 월 20,000회
- **삭제**: 월 10,000회

연구 목적으로는 무료 한도로 충분합니다!
