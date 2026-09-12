# EduLink

EduLink는 학교와 기간제교사·시간강사를 연결하는 역할 기반 채용
플랫폼입니다. 교사는 공고에 지원하거나 학교의 직접 제안을 받을 수
있고, 학교 담당자는 인재풀과 지원자 파이프라인을 운영합니다. 교육청 및
시스템 관리자는 학교 가입 승인과 채용 후 평가를 별도의 비공개 화면에서
관리합니다.

## 주요 사용자 흐름

- 교사: 실제 계정 가입 → 프로필·자격·희망 조건 등록 → 공고 지원 →
  면접 일정 확인 → 채용 결과 확인
- 학교 담당자: 가입 신청 → 관리자 승인 → 공고 등록 → 지원자 검토 또는
  인재풀 직접 제안 → 면접 → 채용 확정
- 관리자: 학교 가입 승인·반려 → 사용자 현황 확인 → 관리자 전용
  별점·리뷰 확인

리뷰와 별점은 완료된 채용 관계를 근거로 저장되며 일반 방문자, 교사,
학교 담당자용 상태 API에는 포함되지 않습니다.

## 기술 스택

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS, Base UI, Lucide
- Prisma 7, PostgreSQL
- Vitest

## 로컬 실행

```bash
cp .env.example .env
npm ci
npx prisma migrate deploy
npm run dev
```

`.env`에는 다음 값이 필요합니다.

```dotenv
DATABASE_URL="postgresql://..."
EDULINK_SESSION_SECRET="48자 이상의 예측 불가능한 무작위 문자열"
EDULINK_ENABLE_DEMO_SEED="false"
```

개발 환경에서는 세션 키의 로컬 기본값을 사용할 수 있지만, 운영
환경에서는 `EDULINK_SESSION_SECRET` 또는 호환 가능한 인증 비밀키를
반드시 48자 이상으로 설정해야 합니다. 예제 문자열을 그대로 사용하면
안 됩니다.

## 데이터베이스 마이그레이션

새 EduLink 전용 데이터베이스에는 다음 명령만 실행합니다.

```bash
npx prisma migrate deploy
npx prisma migrate status
npx prisma migrate diff \
  --from-config-datasource \
  --to-schema prisma/schema.prisma \
  --exit-code
```

`20260726000000_baseline`은 기존 EduLink 스키마를 기록한 기준선이고,
`20260726001000_edulink_security_hiring_upgrade`가 이번 가입 동의,
계약 연결, 관리자 전용 리뷰 변경을 적용합니다.

이미 `prisma db push`로 생성되어 데이터가 있는 EduLink 운영 DB에는
baseline SQL을 다시 실행하면 안 됩니다. 다음 절차를 모두 통과한
경우에만 baseline을 적용된 것으로 기록합니다.

1. 운영 DB 백업 또는 제공업체 스냅샷을 만들고 복구 가능 여부를
   확인합니다.
2. `DATABASE_URL`의 호스트·DB·스키마가 EduLink 전용인지 확인합니다.
   다른 제품 테이블이 함께 보이면 즉시 중단합니다.
3. baseline 생성 기준 스키마와 운영 DB가 완전히 같은지 읽기 전용
   diff로 확인합니다.

   ```bash
   git show 0eb75f8:prisma/schema.prisma > /tmp/edulink-baseline.prisma
   npx prisma migrate diff \
     --from-config-datasource \
     --to-schema /tmp/edulink-baseline.prisma \
     --exit-code
   ```

   종료 코드가 `0`이 아니거나 차이가 출력되면 baseline 처리나
   배포를 진행하지 않습니다.
4. 위 검증을 통과한 동일 DB에서만 다음을 실행합니다.

   ```bash
   npx prisma migrate resolve \
     --applied 20260726000000_baseline
   npx prisma migrate deploy
   npx prisma migrate status
   npx prisma migrate diff \
     --from-config-datasource \
     --to-schema prisma/schema.prisma \
     --exit-code
   ```

공유 개발 DB나 다른 서비스의 테이블이 있는 DB에는 `prisma db push`,
`--accept-data-loss`, baseline resolve를 실행하지 않습니다.

## 데모 계정

| 역할 | 이메일 | 비밀번호 |
| --- | --- | --- |
| 교사 | `teacher@email.com` | `edulink123!` |
| 학교 담당자 | `hr@school.go.kr` | `edulink123!` |
| 관리자 | `admin@edulink.kr` | `edulink123!` |

데모 데이터는 개발·테스트 환경에서만 최초 상태 조회 또는 로그인 시
idempotent upsert로 준비됩니다. `EDULINK_ENABLE_DEMO_SEED=false`로
비활성화할 수 있으며, 운영 환경에서는 이 설정과 무관하게 항상
비활성화되고 알려진 데모 계정 로그인도 거부됩니다.

최초 운영 관리자는 데모 계정을 쓰지 않고 다음 환경 변수를 설정한 뒤
1회 생성합니다. 스크립트는 `.env`를 읽으며 기존 이메일 계정을
덮어쓰지 않습니다.

```bash
EDULINK_BOOTSTRAP_ADMIN_EMAIL="admin@example.kr" \
EDULINK_BOOTSTRAP_ADMIN_PASSWORD="원하는 비밀번호" \
EDULINK_BOOTSTRAP_ADMIN_NAME="운영 관리자" \
EDULINK_BOOTSTRAP_ADMIN_PHONE="010-1234-5678" \
EDULINK_BOOTSTRAP_CONFIRM="CREATE_EDULINK_SUPER_ADMIN" \
npm run admin:bootstrap
```

이 스크립트와 아래 배포 자동 생성 경로는 최소 길이·복잡도 제한이
없습니다(빈 값만 아니면 됩니다). 실제 교사·학교 담당자 회원가입
비밀번호 정책(8자 이상, 영문+숫자 포함)과는 별개이며 그쪽은 그대로
유지됩니다.

### 배포 시 자동 관리자 생성

호스팅 플랫폼(예: Railway)의 환경 변수 화면에 아래 값을 등록해 두면
`npm start`가 실행될 때마다 `scripts/deploy-bootstrap.mjs`가 먼저
실행되어 최초 1회만 SUPER_ADMIN 계정을 생성합니다. 이미 해당 이메일의
계정이 있으면 아무 것도 하지 않고 건너뛰며, 값이 없거나 형식이
잘못되면 경고만 남기고 앱 시작을 막지 않습니다.

```dotenv
EDULINK_AUTO_BOOTSTRAP_ADMIN="true"
EDULINK_BOOTSTRAP_ADMIN_EMAIL="admin@example.kr"
EDULINK_BOOTSTRAP_ADMIN_PASSWORD="원하는 비밀번호"
EDULINK_BOOTSTRAP_ADMIN_NAME="운영 관리자"
EDULINK_BOOTSTRAP_ADMIN_PHONE="010-1234-5678"
```

`EDULINK_AUTO_BOOTSTRAP_ADMIN`이 `"true"`가 아니면 이 단계는 완전히
비활성 상태이므로 기존 배포 환경에는 영향이 없습니다.

## 여러 학교·교사 샘플 데이터

파일럿 시연이나 운영 가능성 점검을 위해 여러 학교(학교 담당자
계정)와 여러 교사, 채용 공고·지원·직접 제안·계약·평가까지 한 번에
채워 넣는 스크립트입니다. 내장 데모 시드(`EDULINK_ENABLE_DEMO_SEED`)와
별개로 동작하며, 재실행해도 같은 레코드를 갱신할 뿐 중복 생성되지
않습니다. 계정 이메일은 실제 가입과 절대 겹치지 않도록
`*.dummy.edulink.local` 도메인을 사용합니다.

```bash
DATABASE_URL="postgresql://..." \
EDULINK_SEED_CONFIRM="SEED_EDULINK_DUMMY_DATA" \
npm run seed:dummy
```

- 운영 DB(`NODE_ENV=production`)에 실행하려면
  `EDULINK_SEED_ALLOW_PRODUCTION="true"`를 함께 지정해야 합니다.
- 모든 더미 계정은 같은 비밀번호를 사용하며, 기본값은
  `Edulink2026!Demo!`입니다. `EDULINK_DUMMY_PASSWORD`로 바꿀 수
  있습니다.
- 생성되는 계정 목록은 스크립트 실행 로그에 출력됩니다.

### 배포할 때 자동으로 채워 넣기

호스팅 플랫폼에 `EDULINK_AUTO_SEED_DUMMY_DATA="true"`를 등록해 두면
위 관리자 자동 생성과 같은 타이밍(`npm start`)에
`scripts/seed-dummy-data.mjs`가 자동으로 실행되어, 연결된 실제
Postgres에 샘플 학교·교사 데이터가 들어가고 프론트엔드에도 바로
반영됩니다. 이미 들어있는 레코드는 갱신만 하고 중복 생성하지
않으므로 배포/재시작마다 실행돼도 안전합니다. 값이 없으면 이 단계는
완전히 비활성 상태입니다.

```dotenv
EDULINK_AUTO_SEED_DUMMY_DATA="true"
EDULINK_DUMMY_PASSWORD="공유 비밀번호(선택, 기본값 Edulink2026!Demo!)"
```

## 검증

정적 품질 게이트는 다음 명령으로 한 번에 실행합니다.

```bash
npm run verify
```

실제 가입·승인·지원·제안·채용·관리자 전용 리뷰 API 흐름은 반드시
폐기 가능한 EduLink 전용 테스트 DB에서 확인합니다. 이 검증은 테스트
레코드를 생성하므로 운영 DB나 공유 DB에는 실행하지 않습니다.

```bash
# 터미널 1
npm run db:deploy
EDULINK_ENABLE_DEMO_SEED=true \
  npm run dev -- --hostname 127.0.0.1 --port 3208

# 터미널 2
EDULINK_VERIFY_BASE_URL=http://127.0.0.1:3208 npm run test:live
```

테스트는 세션 변조·만료, 안전한 로그인 복귀 경로, 역할별 mutation
권한, 지원서 상태 전환, 학교 직접 제안 상태 전환을 표 기반 시나리오로
검증합니다. GitHub Actions는 PostgreSQL 16 서비스에 migration을
적용한 뒤 lint, typecheck, unit test, production build, 개발 서버 기반
live API workflow를 같은 순서로 실행합니다. 최종 UI 검수 결과는
[`design-qa.md`](./design-qa.md)에 기록합니다.

현재 검증 기준은 단위·통합 테스트 92개와 격리 PostgreSQL을 사용하는
실제 HTTP 사용자 흐름 61개입니다.

## 보안 원칙

- 세션 쿠키는 서명되며 `httpOnly`, `sameSite=lax`로 설정됩니다.
- 화면의 숨김 여부가 아니라 서버에서 역할과 리소스 소유권을 검사합니다.
- 공개 상태 응답에는 지원서, 직접 제안, 연락처, 내부 리뷰가 포함되지
  않습니다.
- 학교 간 공고·지원자 데이터는 소유 학교 기준으로 격리됩니다.
- `.env`는 Git에서 제외합니다. 이미 공유된 실제 자격 증명이 있었다면
  별도로 회전해야 합니다.

## 디자인 기준

선택된 방향은 따뜻한 아이보리 바탕과 딥그린 강조색을 사용하는 상업용
채용 제품 스타일입니다. 과도한 파란 그라데이션과 중첩 카드를 제거하고,
리스트·구분선·명확한 상태 텍스트를 중심으로 교사, 학교 담당자, 관리자
각 역할의 작업 순서를 분리했습니다.

선택된 디자인 기준 이미지는
[`docs/design/edulink-selected-direction.png`](./docs/design/edulink-selected-direction.png)
에서 확인할 수 있습니다.
