<div align="center">

<img src="assets/img/profile.jpg" width="120" alt="이빨곰돌이" />

# 이빨곰돌이의 기록장

공부한 것과 일상을 곰돌이 선반에 정리해두는 개인 블로그입니다.

**[블로그 보러가기 →](https://lithonhaeun.github.io)**

</div>

---

## 곰돌이를 사면 글이 따라옵니다

이 블로그는 **인형 가게** 처럼 만들었습니다.

홈 화면에 들어가면 진열장 아치 안에 곰돌이 세 마리가 앉아 있습니다. 각자 목에 이름표를 걸고 있고, 이름표에는 그 곰돌이가 가진 글이 몇 개인지 적혀 있습니다.

```
      곰돌이를 고른다            영수증을 받는다             글을 펼친다
   ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
   │   personal   │        │   RECEIPT    │        │  블로그 글    │
   │    study     │  ───▶  │  TAG  POSTS  │  ───▶  │              │
   │    major     │        │  토익 ···· 1  │        │  본문 · 댓글  │
   └──────────────┘        └──────────────┘        └──────────────┘
```

곰돌이를 누르면 진열장 위로 **영수증**이 떠오릅니다. 영수증에는 그 곰돌이가 품고 있는 태그들이 품목처럼 줄지어 적히고, 옆에는 글 개수가, 아래에는 합계와 바코드가 찍혀 있습니다.

영수증의 품목을 누르면 결제가 끝나고, 그 태그의 글 목록으로 넘어갑니다. 목에 걸린 이름표를 누르면 그 카테고리 전체를 둘러볼 수 있습니다.

| 카테고리 | 곰돌이 | 담긴 이야기 |
| --- | --- | --- |
| **personal** | 선글라스를 쓴 곰돌이 | 공예, 일기, 여행 |
| **study** | 공책에 필기하는 곰돌이 | 토익, 프로젝트 기록 |
| **major** | 노트북을 든 곰돌이 | 전공 공부 |

## 기능

- **자동 집계** — 글 머리말에 카테고리와 태그만 적으면, 영수증의 품목과 개수, 이름표의 숫자, 태그 페이지가 알아서 채워집니다. 따로 관리할 목록이 없습니다.
- **자동 썸네일** — 본문의 첫 번째 사진이 카드 썸네일이 됩니다. 사진이 없는 글은 앞부분을 연하게 보여줍니다.
- **반응형** — 화면 너비에 맞춰 카드 칸 수가 늘었다 줄었다 합니다. 폰에서는 영수증이 화면 가운데 팝업으로 뜹니다.
- **검색 노출** — 글마다 제목과 설명 메타 태그가 붙고, 사이트맵과 RSS가 자동으로 만들어집니다.
- **잔잔한 움직임** — 스크롤하면 글 카드가 아래에서 떠오르고, 태그를 바꾸면 카드가 하나씩 나타납니다.
- **댓글** — GitHub Issues에 쌓이는 utterances를 연결했습니다.

## 만든 것들

- Jekyll 4 / GitHub Pages
- 순수 HTML·CSS·JavaScript (프레임워크 없음)
- [jekyll-seo-tag](https://github.com/jekyll/jekyll-seo-tag), [jekyll-sitemap](https://github.com/jekyll/jekyll-sitemap), [jekyll-feed](https://github.com/jekyll/jekyll-feed)
- [utterances](https://utteranc.es)
- 글꼴: [조선굴림](https://noonnu.cc), DotGothic16, Space Mono

## 폴더 구조

```
├── _data/categories.yml   # 카테고리와 태그 정의
├── _includes/             # 사이드바, 카드, 썸네일 등 공통 조각
├── _layouts/              # 글·카테고리·사이드바 레이아웃
├── _posts/                # 글 (마크다운)
├── assets/                # 이미지, CSS, JS
├── category/              # 카테고리별 페이지
└── about · tags · archives · categories.html
```

## 글은 이렇게 씁니다

`_posts` 폴더에 `2026-09-23-제목.md` 파일을 만들고 머리말을 적습니다.

```markdown
---
title: 다익스트라 알고리즘 정리
categories: [major, Computer network]
description: 검색 결과에 보일 한 줄 요약
---

## 개념

본문은 마크다운으로 씁니다.
```

자세한 운영 방법은 [GUIDE.md](GUIDE.md) 에 정리해두었습니다.

## 로컬에서 실행하기

```bash
bundle install
bundle exec jekyll serve
```

http://localhost:4000 에서 확인할 수 있습니다.

---

<div align="center">

만든 사람 · [@lithonhaeun](https://github.com/lithonhaeun)

</div>
