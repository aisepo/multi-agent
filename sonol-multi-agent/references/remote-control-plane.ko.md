## 호스팅 플랜 정규화 확장 (Hosted Plan Normalizer Extension)

Sonol 공개/커뮤니티 에디션에는 로컬 클라이언트 구성 요소만 포함됩니다:

- 로컬 SQLite 상태
- 대시보드/런타임 접근용 로컬 루프백 브리지
- 원격 플랜 정규화 HTTP 클라이언트

호스팅 플랜 정규화 서비스 구현체는 비공개이며, 이 저장소에 포함되어 있지 않습니다.

## 공개 클라이언트 계약

표준 공개/커뮤니티 설치본은 아래 경로의 호스팅 Sonol 플래너 서비스를 사용합니다:

- `https://agent.zooo.kr/v1/planner/draft`
- `https://agent.zooo.kr/v1/planner/ticket`
- `https://agent.zooo.kr/sonol-dashboard/`

이 공개 기본 경로를 사용할 때는 별도의 플래너 환경 변수가 필요하지 않습니다.

호환되는 비공개 또는 자체 호스팅 플랜 정규화 서비스를 운영하는 경우, 아래 값들로 로컬 클라이언트를 덮어쓰세요:

- `SONOL_PLANNER_DRIVER=remote_http`
- `SONOL_REMOTE_PLAN_NORMALIZER_URL=https://your-planner.example/v1/planner/draft`
- `SONOL_REMOTE_PLAN_NORMALIZER_TICKET_URL=https://your-planner.example/v1/planner/ticket`
- `SONOL_REMOTE_PLAN_NORMALIZER_BEARER_TOKEN=<token>`
- `SONOL_REMOTE_DASHBOARD_BASE_URL=https://agent.example/sonol-dashboard/`

`SONOL_REMOTE_PLAN_NORMALIZER_BEARER_TOKEN`은 공개 기본 경로에서는 선택 사항이며, 대상 호스팅 서비스가 티켓 흐름 외에 베어러 인증을 추가로 요구할 때에만 필요합니다.

플랜, 런, 런타임 이벤트의 권위는 로컬 SQLite 데이터베이스에 그대로 남습니다. 호스팅 서비스는 로컬 AI가 작성한 크리에이티브 드래프트를 실행 가능한 Sonol 플랜으로 정규화하는 역할만 수행해야 합니다. 초기 드래프트를 작성하거나 로컬 런타임 저장소의 소유권을 가져가서는 안 됩니다.

호스팅 정규화기를 사용할 수 없거나 사용자 지정 오버라이드가 잘못 구성된 경우, 공개/커뮤니티 에디션은 계획 단계에서 즉시 실패(fail-fast)합니다. 로컬 폴백 드래프트를 생성하지는 않습니다.
