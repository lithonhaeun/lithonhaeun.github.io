#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""글마다 사진 폴더를 정하는 규칙이에요. (fiximg.py, naver_import.py, 사진넣기.command 가 함께 써요)

  _posts/major/Physical AI/2026-10-31-통신과 physical ai [1편].md
    → assets/img/major/physical-ai/2026-10-31-통신과-physical-ai-1편/

  공백·괄호 같은 기호는 - 로 바꿔요. (마크다운 사진 주소에 공백이 있으면 사진이 안 나와요)

사용:
  python3 imgdir.py dir <글 파일 경로>   → 사진 폴더 (assets/img/ 뒷부분)
  python3 imgdir.py recent [개수]        → 최근에 고친 글 목록 (_posts/ 뒷부분, .md 빼고)
"""
import os, re, sys, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "_posts")


def slug(s):
    s = unicodedata.normalize("NFC", s).lower()
    s = re.sub(r"[^\w-]+", "-", s)
    s = re.sub(r"-{2,}", "-", s)
    return s.strip("-") or "post"


def post_img_rel(md_path):
    """글 파일 경로 → 'major/physical-ai/2026-10-31-통신과-physical-ai-1편'"""
    rel = os.path.relpath(os.path.abspath(md_path), POSTS)
    parts = unicodedata.normalize("NFC", rel).split(os.sep)
    if parts[0] == "..":
        parts = parts[-1:]
    parts[-1] = os.path.splitext(parts[-1])[0]
    return "/".join(slug(p) for p in parts)


def recent(n=15):
    items = []
    for d, _, fs in os.walk(POSTS):
        for f in fs:
            if f.endswith((".md", ".markdown")):
                p = os.path.join(d, f)
                items.append((os.path.getmtime(p), p))
    items.sort(reverse=True)
    return [unicodedata.normalize("NFC", os.path.splitext(os.path.relpath(p, POSTS))[0])
            for _, p in items[:n]]


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "dir":
        print(post_img_rel(sys.argv[2]))
    elif len(sys.argv) >= 2 and sys.argv[1] == "recent":
        print("\n".join(recent(int(sys.argv[2]) if len(sys.argv) > 2 else 15)))
    else:
        print(__doc__)
