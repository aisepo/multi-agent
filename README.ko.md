# Sonol 멀티 에이전트 공개 배포본

이 저장소에는 Sonol 스킬 2종의 공개 배포본이 포함되어 있습니다.

- `sonol-multi-agent`
- `sonol-agent-runtime`

이 저장소를 사용하려면 위 두 스킬을 반드시 함께 설치해야 합니다. 둘 중 하나만 설치하면 실행 흐름, 런타임 보고, 대시보드 연동이 서로 맞지 않을 수 있습니다.

## 제작자

이 프로젝트의 제작자는 [소스놀이터](https://www.youtube.com/@sourcePlayground)입니다.

## 사용법 예시 영상

- [Sonol Multi-Agent 사용 예시 영상](https://youtu.be/ke5bSL2LWb0?si=xYdgDFbRzpdLmoFx)

## 저장소 구성

```text
sonol-multi-agent/
sonol-agent-runtime/
README.md
README.ko.md
LICENSE.txt
LICENSE.ko.txt
```

## Codex CLI 설치

Codex CLI는 WSL(Windows Subsystem for Linux) 환경에서만 설치 및 사용을 지원하며, 현재도 WSL 환경에서만 테스트했습니다.

1. Codex 스킬 디렉터리를 준비합니다.

   ```bash
   mkdir -p ~/.codex/skills
   ```

2. 두 스킬 폴더를 모두 `~/.codex/skills/` 아래로 복사합니다.

3. 최종 경로가 아래와 같은지 확인합니다.

   ```text
   ~/.codex/skills/sonol-multi-agent
   ~/.codex/skills/sonol-agent-runtime
   ```

4. 폴더 복사 후 Codex CLI를 다시 실행하거나 새 세션을 엽니다.

## Claude Code 설치

Claude Code는 Windows 환경에서만 설치 및 사용을 지원하며, 현재도 Windows 환경에서만 테스트했습니다.

1. Claude Code 스킬 디렉터리를 준비합니다.

   ```powershell
   New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\skills" | Out-Null
   ```

2. 두 스킬 폴더를 모두 `%USERPROFILE%\.claude\skills\` 아래로 복사합니다.

3. 최종 경로가 아래와 같은지 확인합니다.

   ```text
   %USERPROFILE%\.claude\skills\sonol-multi-agent
   %USERPROFILE%\.claude\skills\sonol-agent-runtime
   ```

4. 폴더 복사 후 Claude Code를 다시 실행하거나 새 세션을 엽니다.

## 지원 및 테스트 환경

이 공개본은 아래 두 환경에서만 지원 및 테스트했습니다.

- Codex CLI: WSL
- Claude Code: Windows

위 두 환경 이외에서는 테스트하지 않았으며, 동작을 보장하지 않습니다.

## 참고

- 이 저장소는 외부 공유용 공개 배포본만 포함합니다.
- 오케스트레이션 상태의 기준은 로컬 SQLite 데이터입니다.
- 대시보드와 런타임 접근의 기준은 로컬 브리지입니다.
- 브라우저 저장소는 오케스트레이션 상태의 기준이 아닙니다.

## 라이선스

이 저장소에 포함된 Sonol 작성물에는 [LICENSE.ko.txt](LICENSE.ko.txt)의 조건이 적용됩니다.

번들된 서드파티 의존성과 그 안의 고지 문구는 각자의 원래 라이선스를 그대로 유지합니다.
