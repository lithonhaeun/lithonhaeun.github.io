# lithon의 github 블로그

곰돌이 선반 디자인의 Jekyll 블로그예요. GitHub Pages가 자동으로 빌드해줘서, 글 파일을 올리기만 하면 사이트에 반영돼요.

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

- `categories` 의 **첫 번째 값**은 큰 카테고리(`personal`, `study`, `major` 중 하나), **두 번째 값**은 부카테고리예요.
- 부카테고리는 아무 이름이나 새로 써도 돼요. 영수증, Categories, Tags 화면에 **자동으로** 생겨요.
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

`_config.yml` 의 `fonts: body:` 값만 바꾸면 본문 글꼴이 바뀌어요. (제목·메뉴의 도트 폰트는 그대로예요)

| 값 | 느낌 |
| --- | --- |
| `Pretendard` (기본) | 요즘 블로그에서 가장 많이 쓰는 깔끔한 고딕 |
| `Noto Sans KR` | 구글 기본 고딕, 무난함 |
| `IBM Plex Sans KR` | 약간 개발자스러운 단단한 고딕 |
| `Nanum Gothic` | 익숙한 네이버 고딕 |
| `Gowun Dodum` | 둥글고 부드러운 느낌 |
| `Nanum Myeongjo` | 명조(책 느낌) |

구글 폰트(https://fonts.google.com)에 있는 한글 글꼴 이름이면 뭐든 넣을 수 있어요.
