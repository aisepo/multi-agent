# 에이전트 선정 (Agent Selection)

에이전트 구성을 결정할 때 이 규칙들을 사용하세요.

## 고정 규칙

- 총 에이전트 수: `1..6`
- Main 에이전트: 항상 `1`개이지만, 크리에이티브 드래프트에서는 암묵적으로 존재합니다.
- 서브에이전트: `0..5`개
- 실효 동시성(effective concurrency)은 Sonol 정책, Codex `agents.max_threads`, 운영자 오버라이드 중 가장 낮은 값 이내로 유지되어야 합니다.
- 실효 깊이(effective depth)는 v1에서는 `1`로 유지됩니다.
- v1에서는 서브에이전트가 자식 서브에이전트를 생성해서는 안 됩니다.

## 핵심 정책

- 에이전트 선정은 `고정 역할 묶음 우선(fixed-role-bundle-first)`이 아니라 `워크스트림 우선(workstream-first)`입니다.
- `Main`만이 유일한 필수 역할입니다.
- 그 외 모든 에이전트는 선택 사항이며, 요청 자체에서 도출되어야 합니다.
- 역할 이름은 자유 형식 문자열입니다.
- 역할이 중복되어도 무방합니다.
- `execution_class`는 안정적인 내부 라우팅 필드입니다.
- `role_label`은 사용자에게 보여지는 표시용 이름입니다.

## 크리에이티브 드래프트 vs. 정규화된 플랜

- 로컬 크리에이티브 드래프트는 입력 계약이지, 저장되는 정규화된 플랜이 아닙니다.
- 크리에이티브 드래프트는 `references/creative-draft-contract.md`의 계약에 맞춰 작성하세요.
- 크리에이티브 드래프트에서 배열의 키는 `subagents`입니다.
- 크리에이티브 드래프트에서 각 서브에이전트는 `slot_id`와 `role_label`을 사용합니다.
- Main 에이전트 정책은 암묵적이며, 크리에이티브 드래프트의 `subagents`에 등장하지 않습니다.
- 새 드래프트를 작성하기 전에 체크인된 예시를 먼저 확인하세요:
  `references/creative-draft.example.ko.json`
  그리고
  `references/creative-draft.example.en.json`

## 워크스트림 흐름

1. 요청을 의미 있는 문장 단위 또는 책임 군집(cluster)으로 나눕니다.
2. 각 군집을 하나의 실행 클래스로 분류합니다.
3. 워크스트림마다 서브에이전트를 하나씩 만듭니다.
4. 플래너/검증자/리뷰어 트랙은 요청이 필요를 분명히 드러낼 때에만 추가합니다.
5. 결과 구성이 프로바이더의 제한을 초과하면, 고정 묶음으로 되돌리지 말고 유사한 워크스트림을 병합하세요.

## 실행 클래스

- `lead`
- `planner`
- `research`
- `implementer`
- `verifier`
- `reviewer`
- `docs`
- `refactor`
- `ops`
- `general`

`Planner`, `Research`, `Code` 같은 레거시 역할 이름은 호환성을 위해 그대로 읽을 수 있지만, 새로 만드는 추천 구성은 `execution_class` 기반이어야 합니다.

## 기본 프로바이더 베이스 타입 매핑

- `lead` -> `default`
- `planner` -> `default`
- `research` -> `explorer`
- `implementer` -> `worker`
- `verifier` -> `worker`
- `reviewer` -> `explorer`
- `docs` -> `default`
- `refactor` -> `worker`
- `ops` -> `worker`
- `general` -> `default`

이 값들은 정책 기본값일 뿐, 엄격한 요구 사항은 아닙니다.

## 기본 제어 프로파일

- `lead`
  - model: `gpt-5.4`
  - reasoning: `high`
  - sandbox: `workspace-write`
- `planner`
  - model: `gpt-5.4`
  - reasoning: `high`
  - sandbox: `read-only`
- `research`
  - model: `gpt-5.4-mini`
  - reasoning: `medium`
  - sandbox: `read-only`
- `implementer`
  - model: `gpt-5.4`
  - reasoning: `medium`
  - sandbox: `workspace-write`
- `verifier`
  - model: `gpt-5.4-mini`
  - reasoning: `medium`
  - sandbox: `workspace-write`
- `reviewer`
  - model: `gpt-5.4`
  - reasoning: `high`
  - sandbox: `read-only`
- `docs`
  - model: `gpt-5.4-mini`
  - reasoning: `medium`
  - sandbox: `workspace-write`
- `refactor`
  - model: `gpt-5.4`
  - reasoning: `medium`
  - sandbox: `workspace-write`
- `ops`
  - model: `gpt-5.4-mini`
  - reasoning: `medium`
  - sandbox: `workspace-write`
- `general`
  - model: `gpt-5.4-mini`
  - reasoning: `medium`
  - sandbox: `read-only`

모든 서브에이전트에 대한 기본값:

- `approval_mode`: `inherit-session`
- `communication_mode`: `delegated-thread-and-runtime-events`
- `skills_config`: `sonol-agent-runtime` 포함
- `nickname_candidates`: 역할 라벨 또는 실행 클래스에서 도출
- `mcp_servers`: 최소한으로 유지; 작업 범위가 실제로 필요로 할 때에만 추가

## 크리에이티브 드래프트 서브에이전트 필드

크리에이티브 드래프트를 작성할 때, 각 서브에이전트는 아래 필드로 정의합니다:

- `slot_id`
- `role_label`
- `execution_class`
- `purpose`
- `task_title`
- `selection_rationale`
- `provider_agent_type`
- `developer_instructions`
- `model`
- `model_reasoning_effort`
- `sandbox_mode`
- `mcp_servers`
- `skills_config`
- `nickname_candidates`
- `read_paths`
- `write_paths`
- `deny_paths`
- `operational_constraints`
- `depends_on`

크리에이티브 드래프트는 `agent_id`, `role`, `workstream_id`, `assigned_task_ids`, `reporting_contract` 같은 정규화 에이전트 필드로 작성하지 마세요.

## 정규화된 플랜의 에이전트 필드

원격 정규화와 로컬 영속화 이후, 에이전트 레코드에는 아래 필드들이 포함될 수 있습니다:

- `agent_id`
- `role`
- `role_label`
- `execution_class`
- `workstream_id`
- `selection_rationale`
- `purpose`
- `provider_agent_type`
- 현재 어댑터가 여전히 필요로 할 때만 어댑터별 별칭(alias) 필드
- `developer_instructions`
- `model`
- `model_reasoning_effort`
- `sandbox_mode`
- `mcp_servers`
- `skills_config`
- `nickname_candidates`
- `read_paths`
- `write_paths`
- `deny_paths`
- `depends_on`
- `assigned_task_ids`
- `reporting_contract`

## 판단 힌트

- 작업 범위가 좁아 `Main` + 최대 한 개의 추가 트랙으로 충분할 때에만 `single-agent`를 선호하세요.
- 순서, 의존성 정렬, 체크포인트 정의가 중요한 경우 `planner`를 추가하세요.
- 요청에 독립적인 조사 영역이 여러 개 포함된 경우 `research` 트랙을 여러 개 추가하세요.
- 직접 수정이나 동작 변경에 확인이 필요한 경우 `verifier`를 추가하세요.
- 정확성, 호환성, 회귀 위험이 높은 경우 `reviewer`를 추가하세요.
- 출력 품질이 체계적인 설명이나 인계 자료에 좌우되는 경우 `docs`를 추가하세요.
- 별개의 쓰기 트랙을 병합하기 전에, 유사한 읽기 전용 워크스트림 병합을 먼저 고려하세요.

## 절대 금지 가정 (Hard no-go)

- 개별 서브에이전트에 대한 `spawn`, `wait`, `terminate`, `send_input` 공개 CLI가 존재한다고 가정하지 마세요.
- 대시보드 승인이 실행 중인 Codex 세션에 텍스트를 주입할 수 있다고 가정하지 마세요.
- 샌드박싱이나 사용자 지정 에이전트 설정으로 뒷받침되지 않는 한, `read_paths`나 `deny_paths`를 네이티브 Codex ACL로 설명하지 마세요.
- 편집 충돌 가능성이 있을 때는 동시성을 낮추세요.
- 실효 서브에이전트 깊이는 `1`로 유지하세요.
