# 크리에이티브 드래프트 계약 (Creative Draft Contract)

`present-proposal.mjs` 또는 `recommend-plan.mjs`에 전달할 로컬 크리에이티브 드래프트를 작성할 때 이 문서를 참고하세요.

## 권한 구조 (Authority)

- 크리에이티브 드래프트는 로컬 AI가 작성하는 입력 계약입니다.
- 호스팅 플래너는 해당 드래프트를 정규화, 검증, 바인딩하는 역할만 수행합니다.
- 크리에이티브 드래프트는 저장되는 정규화된 플랜(normalized plan)과는 다른 개념입니다.

## 루트 필드

크리에이티브 드래프트는 반드시 아래의 루트 필드만을 포함해야 합니다:

- `plan_title`
- `preferred_language`
- `single_or_multi`
- `multi_agent_beneficial`
- `recommendation_summary`
- `recommendation_reasons`
- `subagents`

`agent_count`, `main_agent_role`, `output_artifacts` 등 플랜 수준의 추가 필드는 드래프트에 작성하지 마세요. 이들은 다른 계층에 속하거나 암묵적으로 처리됩니다.

## Main 에이전트

- Main 에이전트는 런타임 오케스트레이션에서 필수입니다.
- Main 에이전트는 암묵적(implicit)입니다.
- 크리에이티브 드래프트의 `subagents` 배열에 Main 에이전트를 포함하지 마세요.

## 서브에이전트 필드

`subagents` 배열의 각 항목은 아래의 표준 필드를 포함해야 합니다:

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

## 중요한 구분점

저장되는 정규화된 플랜 및 런 계층은 나중에 `agent_id`, `role`, `workstream_id`, `assigned_task_ids`, `reporting_contract` 같은 필드를 사용합니다.

이들은 크리에이티브 드래프트 작성 계약에 속하지 않습니다.

## 예시

- 한국어 예시: `references/creative-draft.example.ko.json`
- 영어 예시: `references/creative-draft.example.en.json`
- JSON 스키마: `internal/schemas/creative-draft.schema.json`
