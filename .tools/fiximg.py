#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
글 안의 이미지 경로를 블로그가 알아보는 형태로 정리합니다.

하는 일
  1) _posts 안의 .md 를 훑어서 상대경로 이미지를 찾습니다
  2) assets/img 바깥에 있으면 assets/img 로 옮깁니다 (이름은 글 이름 기준으로 정리)
  3) 링크를 /assets/img/... 로 바꿔 씁니다

이미 /assets/... 이거나 http 로 시작하는 링크는 건드리지 않습니다.
여러 번 돌려도 결과가 같습니다.
"""

import os
import re
import sys
import shutil
import unicodedata
from urllib.parse import unquote, quote

IMG_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp", ".avif"}

# ![alt](경로)  /  ![alt](경로 "제목")
MD_IMG = re.compile(r'(!\[[^\]]*\]\(\s*)([^)\s]+)(\s*(?:"[^"]*")?\s*\))')
# <img ... src="경로" ...>
HTML_IMG = re.compile(r'(<img\b[^>]*?\bsrc\s*=\s*["\'])([^"\']+)(["\'])', re.I)


def slugify(name: str) -> str:
    """글 파일 이름을 안전한 영문 슬러그로.
    제목이 한글뿐이면 날짜(2026-10-18)를 대신 씁니다."""
    m = re.match(r'^(\d{4}-\d{2}-\d{2})-(.*)$', name)
    date, rest = (m.group(1), m.group(2)) if m else ('', name)

    rest = unicodedata.normalize('NFKD', rest)
    rest = re.sub(r'[^\w\s-]', '', rest, flags=re.ASCII)      # 한글·기호 제거
    rest = re.sub(r'[\s_]+', '-', rest).strip('-').lower()

    return rest or date or 'post'


def is_external(path: str) -> bool:
    p = path.strip()
    return (p.startswith('/') or p.startswith('#') or p.startswith('data:')
            or re.match(r'^[a-z][a-z0-9+.-]*://', p, re.I) is not None
            or p.startswith('//'))


def process(root: str):
    posts_dir = os.path.join(root, '_posts')
    img_dir = os.path.join(root, 'assets', 'img')
    if not os.path.isdir(posts_dir):
        print(f"  '_posts' 폴더를 찾을 수 없습니다: {posts_dir}")
        return 1
    os.makedirs(img_dir, exist_ok=True)

    moved, relinked, missing = [], [], []

    md_files = []
    for dirpath, _dirnames, filenames in os.walk(posts_dir):
        for fn in filenames:
            if fn.lower().endswith(('.md', '.markdown')):
                md_files.append(os.path.join(dirpath, fn))

    for md_path in sorted(md_files):
        with open(md_path, encoding='utf-8') as f:
            text = original = f.read()

        slug = slugify(os.path.splitext(os.path.basename(md_path))[0])
        counter = {'n': 0}

        def handle(raw_path: str) -> str:
            """상대경로 하나를 처리하고 새 경로(또는 원래 경로)를 돌려줍니다."""
            if is_external(raw_path):
                return raw_path

            decoded = unquote(raw_path)
            if os.path.splitext(decoded)[1].lower() not in IMG_EXT:
                return raw_path

            src = os.path.normpath(os.path.join(os.path.dirname(md_path), decoded))
            if not os.path.isfile(src):
                missing.append((os.path.basename(md_path), raw_path))
                return raw_path

            # 이미 assets/img 안에 있으면 옮기지 않고 링크만 고칩니다
            if os.path.dirname(os.path.abspath(src)) == os.path.abspath(img_dir):
                rel = os.path.basename(src)
            else:
                counter['n'] += 1
                ext = os.path.splitext(src)[1].lower()
                rel = f"{slug}-{counter['n']}{ext}"
                dest = os.path.join(img_dir, rel)
                while os.path.exists(dest):          # 이름이 겹치면 번호를 올립니다
                    counter['n'] += 1
                    rel = f"{slug}-{counter['n']}{ext}"
                    dest = os.path.join(img_dir, rel)
                shutil.move(src, dest)
                moved.append((os.path.relpath(src, root), f"assets/img/{rel}"))

            relinked.append((os.path.basename(md_path), raw_path, f"/assets/img/{rel}"))
            return '/assets/img/' + quote(rel)

        text = MD_IMG.sub(lambda m: m.group(1) + handle(m.group(2)) + m.group(3), text)
        text = HTML_IMG.sub(lambda m: m.group(1) + handle(m.group(2)) + m.group(3), text)

        if text != original:
            with open(md_path, 'w', encoding='utf-8') as f:
                f.write(text)

    if not relinked and not missing:
        print("  고칠 이미지 경로가 없습니다. (이미 정리돼 있어요)")
        return 0

    for src, dest in moved:
        print(f"  옮김    {src}  ->  {dest}")
    for post, old, new in relinked:
        print(f"  경로수정 [{post}]  {old}  ->  {new}")
    for post, path in missing:
        print(f"  ⚠︎ 파일없음 [{post}]  {path}")

    if missing:
        print("\n  위 이미지는 파일을 못 찾아서 그대로 뒀습니다. 경로를 확인해주세요.")
    return 0


if __name__ == '__main__':
    root = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()
    sys.exit(process(root))
