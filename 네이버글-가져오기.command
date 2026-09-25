#!/bin/bash
# ─────────────────────────────────────────────
#  네이버 블로그 글을 이 블로그로 가져와요 (사진 포함)
#  더블클릭하면 주소를 물어봅니다.
# ─────────────────────────────────────────────
cd "$(dirname "$0")" || exit 1

if [ ! -f ".tools/naver_import.py" ]; then
  osascript -e 'display alert "블로그 폴더가 아니에요" message "이 파일을 블로그 폴더 안에 두고 실행해주세요." as critical'
  exit 1
fi

# 1) 네이버 글 주소
url=$(osascript -e 'set r to display dialog "가져올 네이버 글 주소를 붙여넣으세요" default answer "" with title "네이버 글 가져오기"' -e 'text returned of r' 2>/dev/null)
[ -z "$url" ] && exit 0

# 2) 어느 카테고리 / 태그로 넣을지
list=$(python3 .tools/naver_import.py --list)
[ -z "$list" ] && { osascript -e 'display alert "카테고리를 읽지 못했어요"'; exit 1; }

pick=$(osascript -e "set items to paragraphs of \"$list\"" \
  -e 'set c to choose from list items with prompt "어느 카테고리에 넣을까요?" with title "네이버 글 가져오기"' \
  -e 'if c is false then return ""' -e 'return item 1 of c' 2>/dev/null)
[ -z "$pick" ] && exit 0

cat_name="${pick%% / *}"
tag_name="${pick##* / }"

# 3) 가져오기
out=$(python3 .tools/naver_import.py "$url" "$cat_name" "$tag_name" 2>&1)
echo "$out"

if echo "$out" | grep -q "다 됐어요"; then
  ans=$(osascript -e "display dialog \"글을 가져왔어요.

$(echo "$out" | tail -3)

지금 깃허브에 올릴까요?\" buttons {\"나중에\", \"지금 올리기\"} default button \"지금 올리기\" with title \"네이버 글 가져오기\"" 2>/dev/null)
  if [[ "$ans" == *"지금 올리기"* ]]; then
    git add _posts assets/img >/dev/null 2>&1
    git commit -m "네이버 글 가져오기" >/dev/null 2>&1
    if git push >/dev/null 2>&1; then
      osascript -e 'display alert "올렸어요" message "1~3분 뒤 블로그에 반영돼요."'
    else
      osascript -e 'display alert "올리지 못했어요" message "터미널에서 git pull --rebase origin main 을 먼저 해보세요."'
    fi
  fi
else
  echo "$out" > /tmp/naver-import-log.txt
  osascript -e 'display alert "가져오지 못했어요" message "자세한 내용은 터미널 창에 있어요. /tmp/naver-import-log.txt 에도 저장했어요."'
fi
