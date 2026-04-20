# 보고 계약 (Reporting Contract)

## 이벤트 타입

- `progress_event`
- `artifact_event`
- `completion_event`
- `session_updated`

## 공통 규칙

- `event_id`는 반드시 고유해야 합니다.
- 모든 런타임 이벤트 페이로드에는 `plan_id`가 필수입니다.
- `timestamp`는 ISO8601 형식이어야 합니다.
- `schema_version`은 `1.0.0`입니다.
- Sonol v1 런타임은 에이전트당 한 번에 하나의 활성 `task_id`만 지원합니다.
- 실행 중에는 SQLite에 직접 기록하는 헬퍼 스크립트를 선호하세요.
- 이벤트 텍스트를 짧게 유지할 수 있도록, 긴 지침은 생성된 런타임 컨텍스트 파일에 담으세요.
- `message`, `summary`, `blocked_reason`은 간결하고 사실 중심으로 유지하세요.
- 대시보드가 사용자에게 실제 작업을 설명해야 할 때는 선택적 `detail`을 사용하세요.
- `message`는 짧은 제목입니다.
- `detail`은 구체적인 활동, 대상, 다음 단계를 담은 1~3개의 짧은 문장입니다.
- 보고는 지원되는 관측(observability) 경로이며, 공개 Codex 자식 제어 API가 아닙니다.
- 보고는 조정과 관측성을 향상시키지만, 자식 스레드에 대한 네이티브 Codex 제어를 만들어 내지는 않습니다.
- 보고는 조정 계층이지 저수준 Codex 스레드 제어 API가 아닙니다.
- 플래너 드라이버가 원격이더라도, 명시적으로 다른 전송이 도입되지 않는 한 런타임 보고는 여전히 로컬 Sonol DB에 기록됩니다.
- 생성된 런 범위 명령이 존재한다면, 손으로 타이핑한 헬퍼 호출보다 그 명령이 더 권위 있습니다. 의도된 DB와 식별자가 고정되어 있기 때문입니다.

## progress_event

사용 시점:

- 작업 시작
- 주요 단계 완료
- 대시보드를 최신 상태로 유지하기 위한 짧은 진행 보고

필수 필드:

- `event_id`
- `plan_id`
- `run_id`
- `agent_id`
- `task_id`
- `step_index`
- `total_steps`
- `state`
- `message`
- `timestamp`
- `schema_version`

## artifact_event

산출물을 점검하거나 재사용해야 할 때 사용하세요.

필수 필드:

- `event_id`
- `plan_id`
- `run_id`
- `agent_id`
- `task_id`
- `artifact_type`
- `artifact_ref`
- `summary`
- `validation_status`
- `timestamp`
- `schema_version`

헬퍼 기본값:

- `report-artifact.mjs`는 플래그가 생략되면 `validation_status`의 기본값을 `unchecked`로 설정합니다.

## completion_event

작업 완료 시 한 번만 사용합니다.

필수 필드:

- `event_id`
- `plan_id`
- `run_id`
- `agent_id`
- `task_id`
- `result`
- `summary`
- `blockers`
- `next_actions`
- `timestamp`
- `schema_version`

헬퍼 기본값:

- `report-completion.mjs`는 해당 플래그가 생략되면 `blockers`와 `next_actions`의 기본값을 `[]`로 설정합니다.

## session_updated

런 또는 에이전트 상태에 의미 있는 변화가 있을 때 사용합니다.

필수 필드:

- `event_id`
- `plan_id`
- `run_id`
- `status`
- `message`
- `timestamp`
- `schema_version`

선택 필드:

- `agent_id`
- `task_id`
- `blocked_reason`

`session_updated`는 명확화를 요청하거나 블록 해소 조건을 드러낼 때 사용하세요.
외부 컨트롤러가 현재 자식 스레드에 메시지를 직접 주입할 수 있다고 가정하지 마세요.
서브에이전트 런타임 보고에서는 `agent_id`가 필수입니다. 런 수준의 세션 변경은 최상위 오케스트레이션 스크립트의 몫이지, 자식 에이전트의 보고 호출이 아닙니다.
서브에이전트에서 `task_id`는 선택 사항이지만, 현재 작업이 분명할 때는 포함하세요.
서브에이전트의 정상 성공/실패 보고에는 `session_updated completed`가 아니라 `completion_event`를 사용하세요.

에이전트 세션에 대한 권장 `status` 의미:

- `queued`: 할당되었지만 아직 시작되지 않음
- `running`: 현재 실제로 작업 중
- `blocked`: 구체적인 조건이 해소될 때까지 진행 불가
- `idle`: 현재 할당 단위가 끝났음; 다음 지시 대기 중
- `cancelled`: 정상 완료 이전에 현재 단위가 중단됨

보고 누락 안전 장치:

- Main이 아닌 에이전트가 시작 가능한 상태가 되었는데도 약 90초 동안 런타임 이벤트를 방출하지 않으면, Sonol은 이를 자동으로 `blocked`로 표시할 수 있습니다.
- 매니페스트 전용 어댑터에서는, 해당 안전 장치가 런치 수신(acknowledgement) 이후 또는 첫 에이전트 세션 이벤트가 DB에 기록되어 에이전트가 살아 있는 것처럼 보이기 시작한 이후에 발동합니다.
- 이는 조용한 에이전트가 단순히 큐에 있는 것처럼 보이지 않도록 하기 위한 조정 안전 장치입니다.
- 잘못된 `--db`나 오래된 수작업 `run_id`는 대시보드 관점에서 "보고 없음"과 구별되지 않으므로, 생성된 명령을 선호해야 합니다.

## 해석 경계

- `read_paths`, `write_paths`, `deny_paths`는 더 강한 강제 계층이 존재하지 않는 한 Sonol 정책 메타데이터입니다.
- 대시보드 가시성이 Codex 스레드에 대한 대시보드 제어를 의미하지는 않습니다.

## 조정 경계

- 진행 상황이나 인계 상태를 전달하기 위해 이벤트와 아티팩트를 사용하세요.
- 서브에이전트 간 직접적인 피어 간 메시징이 존재한다고 가정하지 마세요.
- 외부 대시보드가 Codex 스레드에 명령을 주입할 수 있다고 가정하지 마세요.
