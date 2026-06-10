---
vhk_format: 1
type: goal
id: 3
title: 게임 로직-UI 분리 (펌웨어 포팅 대비)
status: NOT_STARTED
priority: P1
---

# Goal 3: 게임 로직-UI 분리 (펌웨어 포팅 대비)

## 배경
실물 다마고치(ESP32) 펌웨어로 게임 로직을 포팅하려면
DOM 의존 없는 순수 상태 머신으로 코어 로직을 분리해야 함.

## 동작
- tama/js/game.js 에서 상태(허기·수분·애정·XP·레벨) 로직을 순수 모듈로 추출
- DOM/오디오는 어댑터 계층으로 분리
- 추출된 코어 모듈에 단위 테스트 작성

## Completion Check
- 코어 로직 모듈이 DOM API 참조 0건
- 코어 모듈 단위 테스트 통과
