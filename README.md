# 나갈까 — 외출 판단 PWA

자외선과 바람 데이터로 "오늘 나가도 되는지"를 판단해주는 앱.

- **탄다 지수** — 자외선(UV) 기반. 썬크림/양산/외출 자제 판단
- **스타일 파괴 지수** — 돌풍 + 풍속 + 습도 기반. 모자 챙길지 판단
- **골든타임** — 하루 중 자외선 낮고 바람 약한, 나가기 좋은 시간대 표시
- 해가 진 뒤에 열면 자동으로 내일 기준으로 전환 (4계절 내내 동작)

## 데이터

[Open-Meteo](https://open-meteo.com/) — API 키 불필요, 무료. 날씨 예보와 지명 검색(지오코딩) 모두 사용.

## 실행

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드 (dist/)
npm run preview  # 빌드 결과 로컬 확인
```

## PWA 설치

HTTPS 환경(또는 localhost)에서 접속하면 브라우저의 "홈 화면에 추가"로 설치할 수 있다.
Vercel/Netlify 등 정적 호스팅에 `dist/`를 배포하면 끝.

아이콘을 다시 생성하려면: `node scripts/generate-icons.mjs` (`public/icon.svg` 기반)

## 지역 검색 데이터

한국 지역 검색은 전국 읍면동 3,558개의 중심 좌표를 내장해서 사용한다 (`src/data/districts.json`).
행정구역 개편 등으로 갱신이 필요하면: `node scripts/build-districts.mjs`
(원본: [vuski/admdongkor](https://github.com/vuski/admdongkor) — 통계청/행안부 행정동 경계)
해외 지명은 Open-Meteo 지오코딩으로 보완 검색된다.

## 구조

```
src/
  lib/
    weather.ts      Open-Meteo 예보 API
    geocoding.ts    지명 검색 (해외 보완용)
    districts.ts    내장 읍면동 데이터 검색
    scores.ts       탄다 지수 · 스타일 파괴 지수 계산
    goldenTime.ts   시간대 분류 + 골든타임 탐색
    advice.ts       판단 문장 + 챙길 것 생성
    day.ts          하루 판단 모델 조립
  components/
    ScoreCard / AdviceBanner / Timeline / HourlyDetail / LocationPicker
```
