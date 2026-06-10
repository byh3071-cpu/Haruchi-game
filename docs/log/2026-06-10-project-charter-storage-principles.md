---
id: 2026-06-10-project-charter-storage-principles
date: 2026-06-10
tags:
  - project-charter
  - architecture
  - data
  - hardware-safety
  - governance
---

# 프로젝트 헌장 저장 원칙 정리

## 작업

- `PROJECT_CHARTER.md`의 단순한 로컬 우선 저장 문구를 기능 생존형 분산 저장 원칙으로 교체했다.
- 실물 기기의 오프라인 핵심 기능과 클라우드 기반 확장 기능의 책임을 구분했다.
- 오프라인 중 발생할 수 있는 상태 차이와 재연결 후 충돌 해결 필요성을 명시했다.
- 구체적인 서버, 저장소와 동기화 기술은 제품 단계별 검증과 ADR에서 결정하도록 유보했다.

## 결정

- 모든 데이터를 하나의 저장 위치에 종속시키지 않는다.
- 데이터 종류별로 권위 원본과 복제본의 역할을 정의한다.
- 실물 하루치의 핵심 돌봄, 성장과 기본 정서 표현은 클라우드 중단 시에도 작동해야 한다.
- 사용자는 저장 위치와 동기화 상태를 확인하고 데이터를 내보내기, 삭제하거나 초기화할 수 있어야 한다.

## 검증

- 헌장의 YAML 프론트매터와 UTF-8 한글 내용을 확인했다.
- 이번 변경은 `사용자 주권형 관계 기억` 절의 저장 원칙에만 한정했다.
- 코드와 실행 동작은 변경하지 않아 빌드와 테스트 대상에서 제외했다.

## 교훈

오프라인 우선은 모든 데이터를 로컬에만 저장한다는 뜻이 아니다. 제품의 핵심 기능은 오프라인에서 생존하게 하고, 데이터별 권위 원본, 복제와 충돌 해결 책임을 명확히 나누는 것이 중요하다.

## 헌장 후속 확정

- 웹 검증 결과를 ESP32 실물 제품으로 이어 가는 구현 원칙을 추가했다.
- 배터리, 전원, 납땜, 네트워크 제품 보안과 판매 전 검증 원칙을 추가했다.
- 로컬 픽셀 에셋과 게임 규칙 명세의 권위 원본을 구분했다.
- 헌장, `RULES.md`, PRD, 아키텍처, ADR, 로드맵과 Goal의 문서 소유권을 구분했다.
- 핵심 원칙 변경에는 사용자의 명시적 승인이 필요하도록 변경 절차를 확정했다.
- 사용자 승인에 따라 헌장 상태를 `approved`로 전환했다.

## 검토 근거

- Espressif ESP32-S3 Security Overview
- Espressif ESP-IDF OTA and rollback documentation
- ETSI EN 303 645 V3.1.3 consumer IoT cybersecurity baseline
- NIST IR 8259A IoT device cybersecurity capability core baseline
