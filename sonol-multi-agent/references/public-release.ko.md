# 공개 배포 경계 (Public Release Boundary)

GitHub 같은 외부 채널에 Sonol을 공개할 때, 비공개 배포 산출물을 포함하지 않으려면 생성된 공개 배포본을 사용하세요.

## 공개 배포본에 포함되는 항목

- `sonol-multi-agent/`
- `sonol-agent-runtime/`

공개 배포본은 운영자 경험을 그대로 유지합니다:

- 로컬 SQLite가 계속 권위(authoritative)를 가집니다.
- 대시보드/런타임 접근에서 로컬 루프백 브리지가 계속 권위를 가집니다.
- 원격 대시보드는 해당 로컬 브리지 위에 덧입혀진 얇은 UI로 유지됩니다.
- 로컬 Codex 또는 Claude 세션이 여전히 크리에이티브 드래프트를 작성합니다.
- 호스팅 플래너 서비스는 결정적(deterministic)이며, 정규화와 바인딩만 담당합니다.

## 공개 배포본에 포함되어선 안 되는 항목

- 비공개 호스팅 서비스 구현체
- 호스팅 플래너용 배포 단위 파일이나 서비스 매니저 템플릿
- 공개되지 않은 원격 대시보드 쉘(shell) 산출물
- 중복되거나 내부 전용 패키징 경로를 포함하는 원본 작업 복사본

## 배포 워크플로

1. 공개 배포 루트를 생성합니다:
   - `node $SONOL_INSTALL_ROOT/skills/sonol-multi-agent/scripts/export-public-release.mjs`
2. 생성된 루트를 검증합니다:
   - `node $SONOL_INSTALL_ROOT/skills/sonol-multi-agent/scripts/check-public-release.mjs --release-root /abs/output/sonol-public`
3. 원본 작업 설치 트리가 아니라 생성된 루트를 퍼블리시합니다.

## 참고 사항

- 호스팅 플래너는 원격에 그대로 남습니다. 공개 배포본은 호스팅 플래너와 통신하기 위한 로컬 클라이언트/런타임 표면만 함께 제공합니다.
- 브라우저 저장소는 Sonol 오케스트레이션 상태의 권위가 될 수 없습니다.
- 공개 배포본은 머신 간 이동용 포터블 번들과 의도적으로 분리되어 있습니다. 비공개 머신 전송에는 `export-portable-bundle.mjs`를, 외부 공개에는 `export-public-release.mjs`를 사용하세요.
