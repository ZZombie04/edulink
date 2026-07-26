# EduLink Design QA

- 검수일: 2026-07-26
- 선택안: 1번 — 웜 아이보리 배경, 딥 포레스트 그린 포인트
- 기준 이미지:
  [`docs/design/edulink-selected-direction.png`](./docs/design/edulink-selected-direction.png)
- 최종 비교:
  [`docs/design/qa/reference-vs-implementation.png`](./docs/design/qa/reference-vs-implementation.png)

## 비교 이력

1. 기존 화면의 과도한 파란색, 큰 그라데이션, 중첩 카드, 역할별 정보
   혼재를 확인했다.
2. 선택한 1번 시안의 아이보리·딥그린 팔레트와 편집형 타이포그래피를
   공통 토큰, 공개 페이지, 인증 화면, 역할별 포털에 적용했다.
3. 기준 시안과 인재 상세 화면을 같은 1487px 폭으로 나란히 비교하고
   타이포 위계, 여백, 구분선, 버튼 밀도, 이미지 비율을 조정했다.
4. 모바일 390×844, 태블릿 768×1024, 데스크톱 1280×720에서 다시
   확인하고 내비게이션, 필터, 상세 패널, 폼의 넘침을 수정했다.

연령과 성별은 채용 편향 및 개인정보 노출을 줄이기 위해 기준 시안에서
의도적으로 제외했다. 작은 화면에서는 목록과 상세를 한 화면에 억지로
압축하지 않고 별도 상세 경로로 연결했다.

## 최종 화면

| 단계 | 화면 및 검수 내용 | 상태 | 결과물 |
| --- | --- | --- | --- |
| 1 | 공개 홈 — 핵심 가치, 역할별 진입, 채용 공고 | 통과 | [`home-desktop.png`](./docs/design/qa/home-desktop.png) |
| 2 | 공개 홈 모바일 — 로그인 접근성, CTA, 가로 넘침 | 통과 | [`home-mobile.png`](./docs/design/qa/home-mobile.png) |
| 3 | 학교 인재풀 — 검색, 상태 필터, 관심 인재, 상세 이동 | 통과 | [`pool-desktop.png`](./docs/design/qa/pool-desktop.png) |
| 4 | 인재 상세 — 프로필, 경력, 자격, 실제 채용 제안 폼 | 통과 | [`pool-detail-reference-size.png`](./docs/design/qa/pool-detail-reference-size.png) |
| 5 | 관리자 리뷰 — 관리자만 별점·리뷰 열람 | 통과 | [`admin-reviews-desktop.png`](./docs/design/qa/admin-reviews-desktop.png) |
| 6 | 교사 모바일 — 지원·제안 상태와 공개 범위 제어 | 통과 | [`teacher-mobile.png`](./docs/design/qa/teacher-mobile.png) |

## 브라우저 상호작용 검수

- 잘못된 로그인 오류와 역할별 로그인 후 올바른 포털 이동
- 로그아웃 및 보호 페이지의 로그인 복귀 경로
- 공고·인재 검색의 결과 없음 상태와 필터 초기화
- 학교 담당자의 관심 인재 저장 후 새로고침 유지
- 교사의 프로필 공개 일시 중지와 복구 후 새로고침 유지
- 교사 가입 약관 동의, 필수 생년월일 누락 오류
- 관리자 승인 목록, 리뷰 탭, 빈 필터 결과의 상세 패널 정리
- 모바일 역할별 내비게이션과 데스크톱 포털 전환

로컬 앱 범위의 브라우저 콘솔 오류와 경고가 없음을 확인했다. 입력
라벨, 키보드 포커스, 상태 텍스트, 색 대비, 모바일 터치 영역과
390px·768px 화면의 가로 넘침을 점검했다.

## 자동 검증

- ESLint: 통과
- TypeScript: 통과
- Vitest 단위·통합 테스트: 92개 통과
- Next.js production build: 통과
- 격리 PostgreSQL 실제 HTTP 흐름: 61개 통과
- 포함 흐름: 가입, 학교 승인·반려, 지원, 직접 제안, 면접, 채용,
  계약, 관리자 전용 리뷰, 세션 변조·만료, 역할 및 학교 간 데이터 격리

final result: passed
