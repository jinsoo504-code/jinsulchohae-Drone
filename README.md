# mobile-drone-app

농가와 드론방제팀이 함께 사용하는 모바일 필지관리 앱의 1차 MVP 작업 폴더입니다.

현재 작업 진행 상태는 [`WORK_STATUS.md`](./WORK_STATUS.md)에서 확인합니다.

## 현재 범위

- Expo 기반 React Native 모바일 앱 분리
- Supabase Auth, Database, Realtime, Storage 연동 골격
- 지도 polygon 표시 구조
- 작업 상태 변경 구조
- 방제 완료 사진 업로드 서비스 구조
- 내비게이션 앱 연결 구조

## 현재 상태

- 기존 Windows 앱과 분리된 `mobile-drone-app` 폴더 생성 완료
- `.env` 대신 `.env.example`만 생성 완료
- Supabase anon key만 사용하는 클라이언트 구조 반영
- 지도 공급자 교체를 고려한 `MapAdapter` 구조 반영
- MVP 화면 뼈대 작성 완료
- 작업 목록에 오늘/상태별 필터, 현장 요약, 상세 화면 진입 흐름 반영
- 필지 등록 시 농가 생성, 필지 생성, 기본 방제 예정 작업 생성을 한 번에 처리
- 패키지 설치 및 TypeScript 타입검사 통과
- Expo Doctor 18개 항목 통과
- Supabase 환경변수 미설정 상태에서도 샘플 데이터 화면으로 안전하게 진입
- 로그인 화면에서 Supabase 연결 전 샘플 데이터 둘러보기 가능
- 샘플 모드에서 작업 상태 변경이 대시보드/목록/상세에 유지됨
- 샘플 모드에서 사진 선택 후 완료 사진 목록/썸네일 확인 가능
- Android/iOS는 실제 지도, 웹은 목록형 지도 미리보기로 분리
- Expo 웹 번들 생성 확인 완료
- Expo 웹 서버 실행 및 `localhost` 응답 확인 완료
- 반복 검증 명령 `npm run check`, `npm run web:export` 추가
- 필지 상세에서 작업 예정일, 메모, 완료 사진 목록 확인 가능
- 필지 등록에서 기존 농가 검색/선택 후 중복 생성 없이 작업 등록 가능
- 필지 등록에서 담당 방제팀을 선택해 작업에 바로 배정 가능
- 관리자 화면에서 방제팀 생성 가능
- 관리자 화면에서 방제팀 목록 확인 및 담당자/연락처 수정 가능
- 관리자 화면에서 Supabase 환경변수 및 핵심 테이블 연결 점검 가능
- 갤럭시 실기기 점검표에서 주요 MVP 흐름 완료 여부를 로컬 저장 가능
- 필지 등록에서 현재 위치로 중심 좌표 입력 및 반경 기반 임시 polygon 생성 가능
- 실제 Expo 실행과 실기기 테스트는 아직 미진행

## 실행 준비

1. `mobile-drone-app` 폴더로 이동
2. `.env.example`를 참고해 `.env`를 직접 생성
3. Supabase URL과 anon key 입력
4. 패키지 설치: `npm install`
5. 갤럭시에서 Expo Go로 실행: `npm start`
6. Android 네이티브 빌드가 필요하면: `npm run android`

## 환경 변수

`.env.example`

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_NAVER_MAP_CLIENT_ID=
EXPO_PUBLIC_KAKAO_MAP_APP_KEY=
```

## Supabase 권장 사항

- 클라이언트에는 `service_role` key를 넣지 않습니다.
- 모든 읽기/쓰기 정책은 RLS 기준으로 설계합니다.
- `spray-photos` Storage 버킷과 `spray_photos` 테이블 권한을 따로 점검해야 합니다.
- 실시간 반영은 `spray_jobs`, `fields` 변경 구독부터 시작하는 구조입니다.

## 화면 구성

- `app/login.tsx`: 로그인
- `app/(tabs)/dashboard.tsx`: 대시보드
- `app/(tabs)/map.tsx`: 지도
- `app/(tabs)/jobs.tsx`: 작업 목록
- `app/(tabs)/admin.tsx`: 관리자 시작 화면
- `app/field/[id].tsx`: 필지 상세
- `app/field/new.tsx`: 필지 등록

## 다음 작업 우선순위

1. 실제 Expo 구동 확인
2. Supabase SQL 실행 및 실제 프로젝트 연결
3. 갤럭시 Expo Go 실행 점검
4. 갤럭시 실기기에서 로그인, 지도, 상태 변경, 사진 업로드 점검

## 예상 진척률

- 현재 기준 약 `78%`
- 이유: 화면 골격, Supabase API, Realtime 구독, 사진 업로드, SQL/RLS 준비 파일에 더해 패키지 설치, 타입검사, Expo Doctor 통과, 웹 번들 확인, Expo 웹 서버 응답 확인, 반복 검증 명령, Supabase 연결 점검, 갤럭시 실기기 점검표, 작업 목록 현장 필터, 농가 검색/선택, 방제팀 생성/목록/수정/배정, 농가-필지-작업 동시 등록, 현재 위치 기반 좌표 입력, 임시 polygon 생성, 상세 화면 사진 확인, 로그인 샘플 모드, 샘플 상태 변경 유지, 샘플 사진 선택/목록 확인, 환경변수 미설정 안전 진입이 완료됐고 실제 기기에서 최종 흐름 확인이 남아 있습니다.

## 예상 소요

- 갤럭시 우선 1차 MVP 마감: 추가 `10~18시간`
- 갤럭시 + 아이폰 동시 1차 MVP 마감: 추가 `22~32시간`
