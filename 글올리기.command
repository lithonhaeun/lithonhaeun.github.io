#!/bin/bash
# 블로그 글 올리기
#  1) 사진 경로를 자동으로 정리하고
#  2) 커밋해서
#  3) 깃허브에 올립니다
# 강제 푸시(--force)는 절대 쓰지 않습니다.

EXPECTED_EMAIL="165010789+lithonhaeun@users.noreply.github.com"

cd "$(dirname "$0")" || exit 1
REPO="$(pwd)"

pause_exit() {
  echo
  echo "────────────────────────────────────────"
  echo "엔터를 누르면 창이 닫힙니다."
  read -r _
  exit "${1:-0}"
}

echo "════════════════════════════════════════"
echo "  블로그 글 올리기"
echo "════════════════════════════════════════"
echo "폴더: $REPO"
echo

# ── 0. 여기가 저장소가 맞는지 ──────────────────
if [ ! -d ".git" ]; then
  echo "❌ 여기는 깃 저장소가 아닙니다."
  echo "   이 파일을 블로그 폴더(lithonhaeun.github.io) 안에 두고 실행해주세요."
  pause_exit 1
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "브랜치: $BRANCH"
echo

# ── 1. 커밋 이메일 확인 ────────────────────────
CUR_EMAIL="$(git config user.email)"
if [ "$CUR_EMAIL" != "$EXPECTED_EMAIL" ]; then
  echo "⚠️  커밋 이메일이 다릅니다."
  echo "    지금: ${CUR_EMAIL:-(설정 안 됨)}"
  echo "    권장: $EXPECTED_EMAIL"
  printf "    바꿀까요? (y/n) "
  read -r ans
  if [ "$ans" = "y" ] || [ "$ans" = "Y" ]; then
    git config --local --unset-all user.email 2>/dev/null
    git config --local user.email "$EXPECTED_EMAIL"
    echo "    ✓ 바꿨습니다."
  else
    echo "    그대로 진행합니다."
  fi
  echo
fi

# ── 2. 사진 경로 정리 ──────────────────────────
echo "── 사진 경로 정리 ──"
if [ ! -f ".tools/fiximg.py" ]; then
  echo "  .tools/fiximg.py 가 없어서 건너뜁니다."
elif ! command -v python3 >/dev/null 2>&1; then
  echo "  python3 가 없어서 건너뜁니다."
  echo "  터미널에서 xcode-select --install 을 실행하면 설치됩니다."
else
  python3 -I .tools/fiximg.py "$REPO"
  if [ $? -ne 0 ]; then
    echo
    echo "❌ 경로 정리 중 문제가 생겼습니다. 위 메시지를 확인해주세요."
    pause_exit 1
  fi
fi
echo

# ── 3. 바뀐 파일 보여주기 ──────────────────────
if [ -z "$(git status --porcelain)" ]; then
  echo "바뀐 내용이 없습니다. 올릴 게 없어요."
  pause_exit 0
fi

echo "── 올라갈 파일 ──"
git status --short
echo

# ── 4. 커밋 메시지 ─────────────────────────────
DEFAULT_MSG="글 수정 $(date '+%Y-%m-%d %H:%M')"
printf "커밋 메시지 (그냥 엔터 = \"%s\"): " "$DEFAULT_MSG"
read -r MSG
[ -z "$MSG" ] && MSG="$DEFAULT_MSG"
echo

# ── 5. 커밋 → 받아오기 → 올리기 ────────────────
echo "── 커밋 ──"
git add -A || pause_exit 1
git commit -m "$MSG" || pause_exit 1
echo

echo "── 깃허브에서 받아오기 ──"
if ! git pull --rebase origin "$BRANCH"; then
  echo
  echo "❌ 받아오기에 실패했습니다."
  echo "   다른 곳(아이패드, 깃허브 웹)에서 같은 파일을 고쳤을 수 있습니다."
  echo "   커밋은 이미 됐으니 내용은 안전합니다."
  echo "   이 화면을 캡처해서 물어봐주세요."
  pause_exit 1
fi
echo

echo "── 올리기 ──"
if ! git push -u origin "$BRANCH"; then
  echo
  echo "❌ 올리기에 실패했습니다. 위 메시지를 확인해주세요."
  echo "   커밋은 이미 됐으니 내용은 안전합니다."
  pause_exit 1
fi

# ── 6. 결과 ────────────────────────────────────
echo
echo "════════════════════════════════════════"
echo "  ✅ 올렸습니다"
echo "════════════════════════════════════════"
echo "커밋    $(git rev-parse --short HEAD)"
echo "작성자  $(git log -1 --pretty='%an <%ae>')"
echo "시각    $(git log -1 --pretty='%ad' --date=format:'%Y-%m-%d %H:%M')"
echo
echo "잔디 확인   https://github.com/lithonhaeun"
echo "블로그      https://lithonhaeun.github.io"
echo "            (반영까지 1~2분 걸립니다)"
pause_exit 0
