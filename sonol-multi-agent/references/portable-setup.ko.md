# Sonol 포터블 설치

Sonol을 다른 컴퓨터로 옮길 때 이 체크리스트를 사용하세요.

## 요구 사항

- Node.js `>=22`
- 아래 중 하나로 쓰기 가능한 Sonol 디렉터리:
  - `SONOL_HOME_DIR`
  - `SONOL_DATA_DIR`
  - `SONOL_RUNTIME_ROOT`
  - `~/.local/state/sonol` 같은 사용자 홈 상태 디렉터리
- 아래 내용을 이미 포함하는 Sonol 포터블 번들:
  - `skills/sonol-multi-agent`
  - `skills/sonol-agent-runtime`
  - `skills/sonol-multi-agent/node_modules`에 번들된 런타임 의존성
  - `skills/sonol-multi-agent/internal/dashboard/dist`에 번들된 대시보드 자산

## 권장 설치 절차

1. 이미 준비된 Sonol 설치본에서 포터블 번들을 내보냅니다:
   - `node $SONOL_INSTALL_ROOT/skills/sonol-multi-agent/scripts/export-portable-bundle.mjs`
   - 선택적 목적지: `node $SONOL_INSTALL_ROOT/skills/sonol-multi-agent/scripts/export-portable-bundle.mjs --output-dir /abs/output`
   - GitHub나 기타 공개 공유용으로는 원본 작업 폴더를 공개하지 말고 `scripts/export-public-release.mjs`를 사용하세요.
2. 대상 머신에서 `SONOL_INSTALL_ROOT`를 포터블 번들 루트로 내보냅니다.
3. `$SONOL_INSTALL_ROOT/skills/sonol-multi-agent`와 `$SONOL_INSTALL_ROOT/skills/sonol-agent-runtime`이 대상 머신에 존재하도록 포터블 번들을 복사합니다.
4. 기본값이 적절하지 않다면 환경 변수를 내보냅니다:
   - `SONOL_HOME_DIR`
   - `SONOL_DB_PATH`
   - `SONOL_RUNTIME_ROOT`
   - `SONOL_WORKSPACE_ROOT`
   - `SONOL_DASHBOARD_HOST`
   - `SONOL_CODEX_SESSIONS_ROOT`
   - `SONOL_CLAUDE_PROJECTS_ROOT`
   - `SONOL_DEFAULT_ADAPTER_TYPE`
   - `SONOL_DEFAULT_ADAPTER_BACKEND`
   - `SONOL_MAIN_PROVIDER_SESSION_THREAD_ID`
   - `SONOL_MAIN_PROVIDER_SESSION_ID`
   - `SONOL_MAIN_PROVIDER_SESSION_FILE`
5. 의도적으로 필요한 경우에만 사용하는 고급 오버라이드:
   - `SONOL_DASHBOARD_PORT`
   - `SONOL_DASHBOARD_URL`
   - `SONOL_PLANNER_DRIVER`
   - `SONOL_PLANNER_MODEL`
   - `SONOL_REMOTE_PLAN_NORMALIZER_URL`
   - `SONOL_REMOTE_PLAN_NORMALIZER_TICKET_URL`
   - `SONOL_REMOTE_PLAN_NORMALIZER_BEARER_TOKEN`
   - `SONOL_REMOTE_PLAN_NORMALIZER_ALLOW_UNSIGNED`
   - `SONOL_REMOTE_DASHBOARD_BASE_URL`
6. 대시보드를 시작합니다:
   - `node $SONOL_INSTALL_ROOT/skills/sonol-multi-agent/scripts/start-dashboard.mjs`
   - 선택: `node $SONOL_INSTALL_ROOT/skills/sonol-multi-agent/scripts/start-dashboard.mjs --workspace-root /abs/workspace --db /abs/sonol.sqlite`
   - 선택적 명시적 URL 오버라이드: `node $SONOL_INSTALL_ROOT/skills/sonol-multi-agent/scripts/start-dashboard.mjs --workspace-root /abs/workspace --db /abs/sonol.sqlite --dashboard-url http://127.0.0.1:18081`
7. 포터블 스모크 테스트를 실행합니다:
   - `node $SONOL_INSTALL_ROOT/skills/sonol-multi-agent/scripts/portable-smoke-test.mjs`

## 포터블 관련 참고 사항

- 런타임 명령 파일은 `.sh`, `.cmd`, `.ps1`로 생성됩니다.
- 현재 플랫폼에 따라 주 런처 파일 하나가 선택되지만, 다른 런처 파일도 함께 생성됩니다.
- 플랜 및 런 상태는 동일한 DB 경로와 런타임 루트를 의도적으로 공유하지 않는 한, 머신 로컬로 취급해야 합니다.
- `export-portable-bundle.mjs`는 `skills/sonol-multi-agent`, `skills/sonol-agent-runtime`, 최상위 `README.md`, `SONOL_PORTABLE_BUNDLE.json`만 포함하는 번들 디렉터리를 작성합니다.
- `export-public-release.mjs`는 `sonol-multi-agent/`와 `sonol-agent-runtime/`만 포함하는 퍼블리시 루트를 작성하며, 비공개 배포 전용 산출물은 제거합니다.
- 기본적으로 내보내기 스크립트는 내보내기 직후 복사된 번들의 `portable-smoke-test.mjs`를 즉시 실행합니다. 이 스모크 테스트는 두 스킬, 번들된 런타임 의존성, 번들된 대시보드 자산을 모두 검증합니다. 내보내기 후 검증 없이 원본 복사만 원할 때에만 `--skip-validate`를 사용하세요.
- `skills/sonol-multi-agent/internal/dashboard/dist`에 번들된 `dist` 자산이 없으면, 대시보드 서버는 시작될 수 있어도 UI가 정상적으로 렌더링되지 않습니다.
- WSL 스타일의 `/mnt/<drive>/...` 마운트에서는, Sonol이 SQLite를 여는 시점에 워크스페이스, DB, 런타임 경로를 소문자로 정규화합니다. 이는 Node 파일 API는 경로를 볼 수 있지만 `node:sqlite`는 열지 못하는 문제를 피하기 위함입니다.
- Sonol은 이제 기본적으로 `workspace_root`에서 안정적인 로컬 대시보드 포트를 도출합니다. 별도 설정 없이도 서로 다른 워크스페이스가 일반적으로 서로 다른 로컬 대시보드 URL을 갖게 됩니다.
- `SONOL_DASHBOARD_PORT`와 `SONOL_DASHBOARD_URL`은 일반 기본값이 아니라 명시적 오버라이드로 취급하세요. 의도적으로 모든 워크스페이스에 전역 오버라이드를 적용할 경우가 아니라면, 하나의 전역 대시보드 URL이나 포트를 내보내지 마세요.
- `present-proposal.mjs`는 권장 오케스트레이션 진입점입니다. 플랜의 `authoritative_db_path`를 결정하고, 로컬 루프백 브리지를 시작/재바인딩한 뒤, 운영자가 검토해야 할 정확한 원격 대시보드 URL을 출력합니다.
- 해당 원격 리뷰 URL은 같은 컴퓨터에서만 유효한 세션 링크이며, 컴퓨터 간 영구 링크가 아닙니다. 그 워크스페이스의 로컬 루프백 브리지가 동일 머신에서 살아 있는 동안에만 작동합니다.
- `#bridge=...` 프래그먼트를 포함한 원본 리뷰 URL을 그대로 유지하세요. 해당 프래그먼트가 없는 단순 대시보드 주소만으로는 새 탭이나 브라우저에서 로컬 브리지를 다시 부트스트랩할 수 없습니다.
- 대시보드 탭이 이미 열려 있다면, `#bridge=...` 프래그먼트가 포함된 원본 리뷰 URL을 그 탭에 다시 붙여 넣어 새 브리지에 대한 대시보드를 재초기화할 수 있습니다. 단순 대시보드 주소만으로는 여전히 부족합니다.
- 기동 직후에 첫 브라우저 로드가 일어나면 로컬 브리지가 아직 준비 중일 수 있습니다. 수동으로 `start-dashboard.mjs` 명령으로 되돌아가기 전에, 몇 초 뒤에 같은 원본 리뷰 URL로 재시도하세요.
- 공개/커뮤니티 에디션 계획 단계는 로컬 AI가 작성한 크리에이티브 드래프트 + 호스팅 정규화기를 사용합니다. 표준 설치는 기본적으로 `https://agent.zooo.kr/v1/planner/draft`, `https://agent.zooo.kr/v1/planner/ticket`, `https://agent.zooo.kr/sonol-dashboard/`를 사용하며, 추가 플래너 환경 변수가 필요하지 않습니다.
- 공개 기본값을 비공개/자체 호스팅 컨트롤 플레인으로 오버라이드할 때에만 `SONOL_REMOTE_PLAN_NORMALIZER_URL`, `SONOL_REMOTE_PLAN_NORMALIZER_TICKET_URL`, 선택적으로 `SONOL_REMOTE_PLAN_NORMALIZER_BEARER_TOKEN`을 설정하세요.
- 크리에이티브 드래프트는 `--creative-draft-file /abs/draft.json` 또는 `SONOL_CREATIVE_DRAFT_FILE=/abs/draft.json`으로 전달합니다. 호스팅 서비스가 로컬 AI 세션을 대신해 초기 드래프트를 작성해서는 안 됩니다.
- 드래프트는 표준 계약 및 예시에 따라 작성하세요:
  `references/creative-draft-contract.md`,
  `references/creative-draft.example.ko.json`,
  `references/creative-draft.example.en.json`
- Sonol은 이제 플래너 락과 DB 상태를 변경하기 전에 크리에이티브 드래프트를 먼저 검증합니다. 따라서 유효하지 않은 드래프트는 보류 상태의 플래너 상태를 남기지 않고 즉시 실패합니다.
- Codex CLI와 Claude Code는 플래너 백엔드 선택이 아니라 승인 이후의 어댑터/런타임 세션 처리 방식에서 차이가 있습니다.
- 기본이 아닌 DB 위치를 사용할 때는, `present-proposal.mjs`와 `start-dashboard.mjs` 양쪽 모두에 동일한 `--workspace-root` 및 `--db` 쌍을 전달하여 드래프트 플랜, 루프백 브리지 헬스, 터미널 확정이 모두 같은 권위 DB로 해석되도록 하세요.
- `confirm-plan.mjs`는 일반적으로 `--workspace-root`와 함께 명시적인 `--db` 없이 호출해야 합니다. 그 모드에서는 오래된 로컬 가정 대신 대시보드 헬스 응답과 플랜의 `authoritative_db_path`를 따를 수 있습니다.
- Claude Code 터미널에서는 명령별로 다른 어댑터를 의도적으로 고정하지 않는 한 `SONOL_DEFAULT_ADAPTER_TYPE=claude-code-subagent`와 `SONOL_DEFAULT_ADAPTER_BACKEND=claude-code-manual`을 선호하세요.
- Codex/Claude 세션 트랜스크립트 탐색은 더 이상 `/root/...` 경로를 가정하지 않습니다. 호스트가 다른 경로에 트랜스크립트를 저장한다면 `SONOL_CODEX_SESSIONS_ROOT`와 `SONOL_CLAUDE_PROJECTS_ROOT`로 탐색 루트를 오버라이드하세요.
