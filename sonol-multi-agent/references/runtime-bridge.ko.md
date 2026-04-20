# 런타임 브리지 (Runtime Bridge)

`sonol-multi-agent`는 환경이 명시적으로 오버라이드하지 않는 한 현재 Codex 어댑터를 기본으로 사용하지만, 런타임 브리지는 어댑터 기반 Sonol 오케스트레이션으로 취급해야 합니다.
서브에이전트는 자체 상태 프로토콜을 발명해선 안 됩니다.

이 브리지는 공개된 서브에이전트 제어 표면만 가정합니다. 프롬프트 패킷, 공유 아티팩트, 런타임 이벤트에 의존하며, 직접적인 스레드 핸들이나 터미널 주입에 대한 공개된 저수준 API가 존재한다고 가정하지 않습니다.
권장 보고 경로는 생성된 패킷에서 지정됩니다. `script_commands`가 일반 기본값이며, 패킷이 명시하는 경우 `json_ingest`가 어댑터 중립 폴백 또는 프로바이더별 선호 모드가 됩니다.

Sonol이 호스팅 플랜 정규화기를 사용할 때, 분담을 좁게 유지하세요: 로컬 Codex/Claude 세션이 크리에이티브 드래프트를 작성하고, 호스팅 서비스는 정규화와 바인딩만 수행하며, 런타임 이벤트 소유권은 명시적인 전송 업그레이드가 도입되지 않는 한 로컬 SQLite 기반 Sonol 워크플로에 남습니다.

## 서브에이전트에게 전달되어야 하는 지침

각 서브에이전트에게 다음을 알려야 합니다:

1. 현재 Sonol 런타임 보고 헬퍼를 로드하거나 생성된 JSON ingest 경로를 사용할 것.
2. 제공된 제어 프로파일을 존중할 것:
   - `purpose`
   - `provider_agent_type`
   - 필요한 경우 현재 어댑터별 별칭 필드
   - `custom_agent_name`
   - `custom_config_file`
   - `developer_instructions`
   - `model`
   - `model_reasoning_effort`
   - `sandbox_mode`
   - `mcp_servers`
   - `skills_config`
   - `approval_mode`
   - `communication_mode`
   - `read_paths`
   - `write_paths`
   - `deny_paths`
   - `operational_constraints`
   - `depends_on`
   - `reporting_contract`
3. v1에서는 자식 서브에이전트를 생성하지 말 것.
4. 숨겨진 피어(peer) 간 메시징 대신 Main 에이전트 중재를 사용할 것.
5. 후속 지시는 임의의 외부 스레드 주입이 아니라 메인 대화 또는 `/agent`를 통해서만 기대할 것.
6. 생성된 패킷에 명시된 전송을 사용할 것.
   패킷이 `preferred_mode=json_ingest`라고 말하면 생성된 JSON ingest 경로를 먼저 사용하세요. `preferred_mode=script_commands`라고 말하면 `report-*` 헬퍼 스크립트를 통한 직접 기록을 먼저 사용하세요.
7. 긴 설정 지침을 반복하지 말고, 생성된 런타임 컨텍스트 파일을 읽을 것.
8. 작업 시작 시점과 의미 있는 마일스톤마다 `progress_event`를 보고할 것.
9. 점검할 가치가 있는 결과물을 만들었다면 `artifact_event`를 보고할 것.
10. 작업 완료 시 `completion_event`를 보고할 것.
11. 블록 또는 유휴 상태가 되면 `session_updated`를 보고할 것. 정상 최종 성공/실패는 `session_updated completed`가 아니라 `completion_event`를 사용하세요.
12. 이벤트 텍스트는 짧고 사실 중심으로 유지할 것.
13. `build-subagent-prompt.mjs`가 생성한 구체적인 프롬프트 패킷을 수신할 것.
14. 런이 이미 존재하는데 임시 자유 형식 역할 프롬프트를 받아선 안 됨.
15. 프롬프트 패킷은 현재 런과 정확히 계획된 `agent_id`에서 생성되어야 함.
16. 위임 텍스트가 활성 런과 정확히 일치하도록 `<runtime_root>/<run_id>/prompts/<agent_id>.txt` 아래의 런 범위 프롬프트 파일을 선호할 것.
17. `<runtime_root>/<run_id>/prompts/<agent_id>.txt`를 권위 있는 런타임 프롬프트 경로로 취급할 것.
    구체적인 런 프롬프트가 존재한 뒤에는 변경 가능한 플랜 수준의 별칭으로 폴백하지 마세요.
17.5. 매니페스트 전용 어댑터에서는 그 파일을 새 자유 형식 프로바이더 프롬프트로 대체하지 말 것. 런 범위 프롬프트 텍스트를 있는 그대로 복사하거나 전달하세요.
18. 위임된 모든 서브에이전트는 해당 패킷의 `plan_id`, `run_id`, `agent_id`를 모든 `report-*` 호출에서 그대로 재사용해야 함.
19. 패킷에 `assistant_launch_recipe`가 포함된 경우, 호스트 표면이 실제로 강제할 수 있는 필드에 대해서는 그것을 정확한 런치 레시피로 사용하세요. 경로 정책, MCP 표면, 헬퍼 스킬 정책 같은 다른 Sonol 제어는 호스트 표면이 네이티브로 강제하지 않는 한 조정 규칙으로 남습니다.
20. 매니페스트 전용 어댑터에서 `fork_context=false`는 런치 불변값(invariant)입니다. 오래된 상위 컨텍스트를 상속하는 방식으로 런치를 재구성하지 마세요.

프롬프트 패킷은 아래 항목들을 명시해야 합니다:

- `provider_agent_type`
- 필요한 경우 현재 어댑터별 베이스 타입 별칭
- `purpose`
- 기대 산출물
- 의존성 및 대기 정책
- 모델과 리즈닝 강도
- 샌드박스 모드
- 허용된 MCP 및 스킬 표면
- Sonol 경로 및 운영 정책

## 필수 식별자

모든 서브에이전트 프롬프트에는 다음이 포함되어야 합니다:

- `run_id`
- `agent_id`
- 현재 `task_id`
- `purpose`
- `depends_on`
- `approval_mode`
- `communication_mode`
- 경로 및 보고에 대한 제어 제한
- `schema_version` — 현재는 `1.0.0`
- 해당 이벤트 계열이 필요로 하는 필드가 있다면, 정확한 현재 `plan_id`, `run_id`, `agent_id`, `task_id`를 담은 명시적 `report-progress`, `report-session`, `report-completion` 명령

## 최소 보고 패턴

1. 작업 시작 시 progress 전송
2. 주요 단계가 끝날 때마다 progress 전송
3. 파일이나 요약이 준비되면 artifact 전송
4. 블록이거나 다음 단위를 유휴 상태로 기다릴 때 `session_updated` 전송
5. 종료 시 `completion_event` 전송

서브에이전트가 활성 런과 다른 런으로 보고하는 경우, Sonol은 이를 유효한 대시보드 보고가 아닌 조정 실패로 간주해야 합니다.
런타임 보고 경로는 그 오래된 run id를 거부하고, 현재 안내되는 복구 프롬프트 경로로 운영자를 안내해야 합니다. 현재 구현에서 오래된 런 힌트는 `<runtime_root>/<run_id>/prompts/<agent_id>.txt` 아래의 런 범위 프롬프트 파일로 해석됩니다.
진단은 이를 `reports_written_to_other_run`으로 플래그해야 합니다.

## 지원되지 않는 가정

- 대시보드에서 멀티 에이전트 런을 직접 런치하는 것
- 기존 터미널 세션에 텍스트를 직접 주입하는 것
- 문서화되지 않은 `spawn`, `wait`, `list`, `terminate`, `send_input` 제어
- v1에서의 중첩 자율 자식 에이전트 트리

## 대체 패턴

- Main 에이전트 또는 `/agent`를 통해 서브에이전트의 방향을 조정
- `developer_instructions`로 제어를 더 엄격하게 만들기
- `sandbox_mode`, `mcp_servers`, `skills_config`를 축소
- 서브에이전트를 직접 제어하는 대신 가시성을 위해 런타임 이벤트 사용
- 사람 또는 Main 에이전트가 실제 프로바이더 서브에이전트를 런치해야 할 때 `show-run-launch-manifest.mjs` 또는 `/api/runs/<run_id>/launch-manifest`로 정확한 런치용 패킷을 얻기
- 사용 가능하면 도구 호출을 수동으로 재구성하지 말고 패킷이 방출한 `assistant_launch_recipe.tool_args`를 그대로 사용
- 호스트 런치 표면이 네이티브로 강제하지 않는 한, 샌드박스 모드, MCP 표면, 헬퍼 스킬 요구 사항, 경로 정책을 Sonol 조정 제약으로 취급
