# 운영 가이드 (나만 보는 메모)

블로그를 올리고 글을 쓰는 방법을 정리해둔 문서예요. 소개용 문서는 [README.md](README.md) 를 봐주세요.

---

## 1. 처음 한 번만: 블로그 올리기

1. GitHub에서 **새 저장소**를 만들어요. 이름은 반드시 `lithonhaeun.github.io` 로 해주세요. (Public)
2. 이 폴더 안의 파일을 **전부** 저장소에 올려요.
   ```bash
   cd 이_폴더
   git init
   git add .
   git commit -m "블로그 시작"
   git branch -M main
   git remote add origin https://github.com/lithonhaeun/lithonhaeun.github.io.git
   git push -u origin main
   ```
3. 저장소 **Settings → Pages** 에서 Source를 `Deploy from a branch`, Branch를 `main` / `/(root)` 로 저장해요.
4. 1~3분 뒤 https://lithonhaeun.github.io 에 접속하면 끝이에요.

## 2. 새 글 쓰기

`_posts` 폴더에 `날짜-영어제목.md` 파일을 만들어요. (예: `2026-09-23-dijkstra.md`)
파일 이름은 영어로 해야 주소가 깔끔해요. 제목은 한글로 써도 돼요.

```markdown
---
title: 다익스트라 알고리즘 정리
categories: [major, 알고리즘]
description: 검색 결과에 보일 한 줄 요약 (검색 노출에 중요해요!)
image: /assets/img/내이미지.png   # (선택) 카드 썸네일을 직접 정할 때만
---

## 개념

여기에 내용을 마크다운으로 써요.
```

- `categories` 의 **첫 번째 값**은 큰 카테고리(`personal`, `study`, `major` 중 하나), **두 번째 값**은 태그예요.
- 태그는 아무 이름이나 새로 써도 돼요. 영수증, Categories, Tags 화면에 **자동으로** 생겨요.
- `## 제목` 은 도트 폰트의 큰 소제목, `### 제목` 은 작은 소제목이 돼요.
- 코드 블록은 ```` ```python ```` 처럼 언어를 적으면 색이 입혀져요.
- **썸네일**: 본문의 첫 번째 사진이 자동으로 썸네일이 돼요. 사진이 없으면 글 앞부분이 연하게 보여요.
- 사진은 `assets/img/` 폴더에 넣고 본문에 `![설명](/assets/img/사진이름.png)` 처럼 써요.
- 저장하고 push하면 1~3분 뒤 반영돼요.

예시 글 5개는 마음대로 고치거나 지워도 돼요.

## 3. 댓글 켜기 (utterances)

1. https://github.com/apps/utterances 에서 **Install** → `lithonhaeun.github.io` 저장소만 선택해요.
2. 저장소 **Settings → General → Features** 에서 **Issues** 가 켜져 있는지 확인해요.

이것만 하면 글 아래 댓글창이 동작해요. 댓글은 저장소 Issues에 저장돼요.

## 4. 검색 노출 (구글 · 네이버)

사이트맵(`/sitemap.xml`), 글마다 제목·설명 메타태그, RSS(`/feed.xml`)는 이미 자동으로 만들어져요. 검색엔진에 등록만 하면 돼요.

**구글**
1. https://search.google.com/search-console → 속성 추가 → **URL 접두어** 에 `https://lithonhaeun.github.io` 입력
2. 확인 방법에서 **HTML 태그** 선택 → `content="..."` 안의 코드만 복사
3. `_config.yml` 의 `webmaster_verifications: google:` 에 붙여넣고 push → 확인 버튼
4. 왼쪽 메뉴 **Sitemaps** 에 `sitemap.xml` 제출

**네이버**
1. https://searchadvisor.naver.com → 웹마스터 도구 → 사이트 등록
2. **HTML 태그** 방식 → `content` 코드만 복사해서 `_config.yml` 의 `naver_site_verification` 에 붙여넣고 push → 소유 확인
3. 요청 → **사이트맵 제출** 에 `https://lithonhaeun.github.io/sitemap.xml`

> 글마다 `description` 을 꼭 써주세요. 검색 결과에 보이는 문장이에요.

## 5. 자주 바꾸는 것

| 바꾸고 싶은 것 | 파일 |
| --- | --- |
| 블로그 이름, 자기소개, 이메일, 링크 | `_config.yml` |
| 프로필 사진 | `assets/img/profile.jpg` 교체 |
| 홈 곰돌이·상표 위치 | `_data/categories.yml` |
| 색상·글꼴·크기 | `assets/css/style.css` 맨 위 `:root` |

**큰 카테고리를 새로 추가하려면** `_data/categories.yml` 에 항목을 추가하고, `category/personal.html` 을 복사해서 이름과 `cat:` 값을 바꿔주세요.

## 6. 내 컴퓨터에서 미리보기 (선택)

Ruby가 설치되어 있다면:

```bash
bundle install
bundle exec jekyll serve
```

http://localhost:4000 에서 확인할 수 있어요.

## 7. 글꼴 바꾸기

본문과 한글 글꼴은 조선굴림(ChosunGu)을 쓰고 있어요. `assets/css/style.css` 맨 위의 `@font-face` 와 `:root` 의 `--sans`, `--body` 를 고치면 바뀌어요. 제목의 도트 글꼴(DotGothic16)과 영문 숫자용 Space Mono 는 `_includes/head.html` 에서 불러와요.

## 8. 사진 쉽게 넣기

블로그 폴더 안의 **`사진넣기.command`** 를 더블클릭하면 돼요.

1. **복사(Cmd+C)해둔 사진이 있으면** "붙여넣기" 버튼이 떠요. 없으면 바로 사진 선택창이 열려요. (여러 장 한 번에 고를 수 있어요)
   - 화면 캡처는 `Cmd + Ctrl + Shift + 4` 로 찍으면 파일을 만들지 않고 바로 복사돼요.
   - 웹에서 본 사진은 우클릭 → "이미지 복사" 하면 돼요.
2. 고른 사진이 `assets/img` 에 정리돼서 들어가요.
   - 파일 이름은 `20260923-사진이름.png` 처럼 날짜가 붙고 공백이 정리돼요.
   - 가로 1600px보다 큰 사진은 자동으로 줄여서 블로그가 무거워지지 않게 해요.
3. `![](/assets/img/...)` 마크다운이 **자동으로 복사**돼요. 글에 붙여넣기만 하면 돼요.
4. "지금 올리기"를 누르면 깃허브에 바로 올라가요.

> 처음 실행할 때 "확인되지 않은 개발자" 경고가 나오면, 파일을 **우클릭 → 열기** 로 한 번만 실행해주세요.
>
> 터미널에서 쓰고 싶으면 `./사진넣기.command ~/Desktop/사진.png` 처럼 파일을 넘겨도 돼요. 터미널 창에 사진을 끌어다 놓으면 경로가 자동으로 입력돼요.
