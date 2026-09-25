#!/bin/bash
# ─────────────────────────────────────────────
#  사진넣기 — 블로그에 사진을 쉽게 넣는 도구
#  더블클릭하면 복사해둔 사진을 붙여넣거나 파일을 고를 수 있어요.
#  고른 사진은 assets/img 에 정리되고,
#  글에 붙여넣을 마크다운이 자동으로 복사돼요.
# ─────────────────────────────────────────────
cd "$(dirname "$0")" || exit 1

if [ ! -d "assets/img" ]; then
  osascript -e 'display alert "블로그 폴더가 아니에요" message "이 파일을 블로그 폴더(lithonhaeun.github.io) 안에 두고 실행해주세요." as critical'
  exit 1
fi

# 1) 사진 가져오기 — 인자 > 복사한 사진 > 파일 선택창
files=()
if [ "$#" -gt 0 ]; then
  files=("$@")
else
  # 복사(Cmd+C)해둔 사진이 있는지 확인해요
  clipinfo=$(osascript -e 'clipboard info' 2>/dev/null)
  mode="파일 고르기"
  if echo "$clipinfo" | grep -qE 'PNGf|TIFF picture|JPEG'; then
    mode=$(osascript -e 'display dialog "복사해둔 사진이 있어요.
어떻게 넣을까요?" buttons {"파일 고르기", "붙여넣기"} default button "붙여넣기" with title "사진넣기"' 2>/dev/null)
  fi

  if [[ "$mode" == *"붙여넣기"* ]]; then
    clip="/tmp/paste-$(date +%H%M%S).png"
    osascript <<AS >/dev/null 2>&1
set outFile to POSIX file "$clip"
try
    set imgData to (the clipboard as «class PNGf»)
on error
    set imgData to (the clipboard as «class TIFF»)
end try
set fh to open for access outFile with write permission
set eof fh to 0
write imgData to fh
close access fh
AS
    if [ -s "$clip" ]; then
      command -v sips >/dev/null 2>&1 && sips -s format png "$clip" --out "$clip" >/dev/null 2>&1
      files=("$clip")
    else
      osascript -e 'display alert "붙여넣지 못했어요" message "사진이 아니라 파일이 복사된 걸 수도 있어요. 파일 고르기로 다시 해보세요."'
      exit 1
    fi
  else
    picked=$(osascript -e 'set theFiles to choose file with prompt "블로그에 넣을 사진을 고르세요 (여러 장 가능)" of type {"public.image"} with multiple selections allowed' -e 'set out to ""' -e 'repeat with f in theFiles' -e 'set out to out & POSIX path of f & linefeed' -e 'end repeat' -e 'return out' 2>/dev/null)
    [ -z "$picked" ] && exit 0
    while IFS= read -r line; do [ -n "$line" ] && files+=("$line"); done <<< "$picked"
  fi
fi

markdown=""
count=0

for src in "${files[@]}"; do
  [ -f "$src" ] || continue

  base=$(basename "$src")
  case "$base" in paste-*) base="capture.png" ;; esac
  ext="${base##*.}"
  name="${base%.*}"

  # 2) 파일 이름 정리: 소문자, 공백과 특수문자는 -
  ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
  name=$(echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9가-힣]/-/g; s/--*/-/g; s/^-//; s/-$//')
  [ -z "$name" ] && name="image"
  name="$(date +%Y%m%d)-$name"

  # 같은 이름이 있으면 뒤에 숫자를 붙여요
  target="assets/img/$name.$ext"
  n=2
  while [ -e "$target" ]; do
    target="assets/img/$name-$n.$ext"
    n=$((n + 1))
  done

  cp "$src" "$target" || continue

  # 3) 너무 큰 사진은 가로 1600px로 줄여요 (맥 기본 기능)
  if command -v sips >/dev/null 2>&1; then
    w=$(sips -g pixelWidth "$target" 2>/dev/null | awk '/pixelWidth/{print $2}')
    if [ -n "$w" ] && [ "$w" -gt 1600 ] 2>/dev/null; then
      sips -Z 1600 "$target" >/dev/null 2>&1
    fi
  fi

  markdown="${markdown}![](/${target})"$'\n'
  count=$((count + 1))
done

if [ "$count" -eq 0 ]; then
  osascript -e 'display alert "사진을 넣지 못했어요" message "고른 파일을 확인해주세요."'
  exit 1
fi

# 4) 마크다운을 클립보드에 복사
printf "%s" "$markdown" | pbcopy

# 5) 바로 올릴지 물어보기
answer=$(osascript -e "display dialog \"사진 ${count}장을 넣었어요.
마크다운이 복사됐으니 글에 붙여넣으세요.

지금 깃허브에 올릴까요?\" buttons {\"나중에\", \"지금 올리기\"} default button \"지금 올리기\" with title \"사진넣기\"" 2>/dev/null)

if [[ "$answer" == *"지금 올리기"* ]]; then
  git add assets/img >/dev/null 2>&1
  git commit -m "사진 추가" >/dev/null 2>&1
  if git push >/dev/null 2>&1; then
    osascript -e 'display alert "올렸어요" message "1~3분 뒤 블로그에 반영돼요."'
  else
    osascript -e 'display alert "올리지 못했어요" message "터미널에서 git pull --rebase origin main 을 먼저 해보세요."'
  fi
fi
