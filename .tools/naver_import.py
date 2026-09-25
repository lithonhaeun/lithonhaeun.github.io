#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""네이버 블로그 글을 깃허브 블로그(_posts)로 가져와요. 사진도 함께 받아옵니다."""

import os, re, sys, html, unicodedata, urllib.request, urllib.parse
from html.parser import HTMLParser
from datetime import datetime

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/125.0 Safari/537.36")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def get(url, referer="https://blog.naver.com/"):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Referer": referer,
        "Accept-Language": "ko-KR,ko;q=0.9",
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def parse_url(u):
    """주소에서 블로그 아이디와 글 번호를 뽑아요."""
    u = u.strip()
    q = urllib.parse.urlparse(u)
    p = urllib.parse.parse_qs(q.query)
    if "blogId" in p and "logNo" in p:
        return p["blogId"][0], p["logNo"][0]
    m = re.search(r"blog\.naver\.com/([^/?#]+)/(\d+)", u)
    if m:
        return m.group(1), m.group(2)
    raise ValueError("네이버 글 주소를 알아보지 못했어요: " + u)


# ───────────────────────── 본문 → 마크다운 ─────────────────────────

SKIP_TAGS = {"script", "style", "noscript"}
VOID = {"img", "br", "hr", "input", "meta", "link", "source", "col"}


class Naver2Md(HTMLParser):
    def __init__(self, base_referer):
        super().__init__(convert_charrefs=True)
        self.base_referer = base_referer
        self.on = False          # 본문 안인지
        self.depth = 0
        self.skip = 0
        self.blocks = []         # 완성된 문단들
        self.buf = []            # 지금 모으는 글자들
        self.quote = 0
        self.list_stack = []
        self.href = None
        self.link_text = []
        self.font = 0            # 이 문단의 가장 큰 글자 크기
        self.images = []         # (원본주소, 자리표시자)
        self.caption = False

    # --- 도우미 ---
    def flush(self):
        text = "".join(self.buf).strip()
        self.buf = []
        size, self.font = self.font, 0
        if not text:
            return
        text = re.sub(r"[ \t]+", " ", text)
        if self.caption:
            self.blocks.append("*" + text + "*")
            return
        if self.list_stack:
            mark = "1." if self.list_stack[-1] == "ol" else "-"
            self.blocks.append("  " * (len(self.list_stack) - 1) + mark + " " + text)
            return
        if self.quote:
            self.blocks.append("> " + text.replace("\n", "\n> "))
            return
        # 글자가 크면 소제목으로 봐요
        if size >= 24 and len(text) <= 60:
            self.blocks.append("## " + text)
        elif size >= 19 and len(text) <= 60:
            self.blocks.append("### " + text)
        else:
            self.blocks.append(text)

    def add(self, s):
        (self.link_text if self.href is not None else self.buf).append(s)

    # --- 태그 ---
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = a.get("class", "") or ""
        _id = a.get("id", "") or ""

        if not self.on:
            if "se-main-container" in cls or _id == "postViewArea" or "post-view" in _id:
                self.on = True
                self.depth = 1      # 본문 상자 자신
            return

        if tag not in VOID:
            self.depth += 1
        if tag in SKIP_TAGS:
            self.skip += 1
            return
        if self.skip:
            return

        if tag == "img":
            src = a.get("data-lazy-src") or a.get("src") or ""
            if src and "blogpfthumb" not in src and "ssl.pstatic.net/static" not in src:
                self.flush()
                self.blocks.append(("IMG", src))
                self.images.append(src)
            return

        if tag == "br":
            self.add("\n")
            return
        if tag == "hr" or "se-horizontalLine" in cls:
            self.flush(); self.blocks.append("---"); return
        if "se-caption" in cls:
            self.flush(); self.caption = True; return
        if tag in ("p", "div") and ("se-text-paragraph" in cls or "se-module-text" in cls):
            self.flush(); return
        if tag in ("p", "div", "section", "table", "tr"):
            self.flush(); return
        if tag in ("b", "strong"):
            self.add("**"); return
        if tag in ("i", "em"):
            self.add("*"); return
        if tag in ("h1", "h2", "h3", "h4"):
            self.flush(); self.buf.append("## " if tag in ("h1", "h2") else "### "); return
        if tag == "a":
            self.href = a.get("href"); self.link_text = []; return
        if tag == "blockquote" or "se-quotation" in cls:
            self.flush(); self.quote += 1; return
        if tag in ("ul", "ol"):
            self.flush(); self.list_stack.append(tag); return
        if tag == "li":
            self.flush(); return

        m = re.search(r"se-fs-fs(\d+)", cls)
        if m:
            self.font = max(self.font, int(m.group(1)))
        m = re.search(r"font-size\s*:\s*(\d+)", a.get("style", "") or "")
        if m:
            self.font = max(self.font, int(m.group(1)))

    def handle_endtag(self, tag):
        if not self.on:
            return
        if tag in SKIP_TAGS and self.skip:
            self.skip -= 1
            return
        if self.skip:
            return

        if tag in ("b", "strong"):
            self.add("**")
        elif tag in ("i", "em"):
            self.add("*")
        elif tag == "a":
            t = "".join(self.link_text).strip()
            u = self.href or ""
            self.href = None
            self.link_text = []
            if t:
                self.buf.append("[%s](%s)" % (t, u) if u.startswith("http") else t)
        elif tag == "blockquote":
            self.flush(); self.quote = max(0, self.quote - 1)
        elif tag in ("ul", "ol"):
            self.flush()
            if self.list_stack:
                self.list_stack.pop()
        elif tag in ("p", "div", "li", "h1", "h2", "h3", "h4", "tr", "section"):
            self.flush()
            self.caption = False

        self.depth -= 1
        if self.depth <= 0:
            self.on = False
            self.flush()

    def handle_data(self, data):
        if self.on and not self.skip and data.strip():
            self.add(data)


# ───────────────────────── 사진 받기 ─────────────────────────

def save_images(blocks, log_no, referer):
    """본문 사진을 assets/img 에 내려받고 주소를 바꿔요."""
    out = os.path.join(ROOT, "assets", "img")
    os.makedirs(out, exist_ok=True)
    n = 0
    result = []
    for b in blocks:
        if not (isinstance(b, tuple) and b[0] == "IMG"):
            result.append(b)
            continue
        src = b[1]
        if src.startswith("//"):
            src = "https:" + src
        n += 1
        ext = (re.search(r"\.(jpe?g|png|gif|webp)", src.lower()) or [None, "jpg"])[1]
        name = "naver-%s-%d.%s" % (log_no, n, ext)
        path = os.path.join(out, name)
        # ?type=w773 같은 꼬리표를 떼면 원본이 받아져요
        for u in (re.sub(r"\?type=\w+$", "", src), src):
            try:
                data = get(u, referer)
                if len(data) > 1000:
                    with open(path, "wb") as f:
                        f.write(data)
                    print("   사진 %d장째 받음: %s (%d KB)" % (n, name, len(data) // 1024))
                    result.append("![](/assets/img/%s)" % name)
                    break
            except Exception as e:
                last = e
        else:
            print("   ! 사진을 못 받았어요: %s" % src[:80])
            result.append("<!-- 못 받은 사진: %s -->" % src)
    return result


# ───────────────────────── 글 파일 쓰기 ─────────────────────────

def slugify(t):
    t = unicodedata.normalize("NFC", t)
    t = re.sub(r"[^\w가-힣\s-]", "", t).strip().lower()
    t = re.sub(r"[\s_]+", "-", t)
    return t[:50] or "post"


def import_post(url, category, tag):
    blog_id, log_no = parse_url(url)
    view = ("https://blog.naver.com/PostView.naver?blogId=%s&logNo=%s"
            "&redirect=Dlog&widgetTypeCall=true&directAccess=false" % (blog_id, log_no))
    referer = "https://blog.naver.com/%s/%s" % (blog_id, log_no)

    print("1) 글을 불러오는 중…")
    raw = get(view, referer)
    try:
        page = raw.decode("utf-8")
    except UnicodeDecodeError:
        page = raw.decode("cp949", "replace")

    # 제목
    title = ""
    for pat in (r'class="se-title-text"[^>]*>(.*?)</div>',
                r'class="pcol1[^"]*"[^>]*>\s*(.*?)\s*</span>',
                r'<title>(.*?)</title>'):
        m = re.search(pat, page, re.S)
        if m:
            title = re.sub(r"<[^>]+>", " ", m.group(1))
            title = html.unescape(title).strip()
            title = re.sub(r"\s*:\s*네이버 블로그\s*$", "", title)
            if title:
                break
    if not title:
        title = "네이버 글 " + log_no

    # 날짜
    date = datetime.now()
    m = re.search(r"(20\d\d)\.\s*(\d{1,2})\.\s*(\d{1,2})", page)
    if m:
        try:
            date = datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        except ValueError:
            pass

    print("2) 제목: %s" % title)
    p = Naver2Md(referer)
    p.feed(page)
    blocks = [b for b in p.blocks if b]
    if not blocks:
        raise RuntimeError("본문을 찾지 못했어요. 글이 비공개이거나 네이버 구조가 바뀌었을 수 있어요.")

    print("3) 사진 %d장 받는 중…" % len(p.images))
    blocks = save_images(blocks, log_no, referer)

    def kind(t):
        t = (t or "").lstrip()
        if re.match(r"^(-|\d+\.)\s", t):
            return "list"
        if t.startswith("> "):
            return "quote"
        return ""

    def same_group(a, b):
        k = kind(a)
        return bool(k) and k == kind(b)

    lines = []
    for i, b in enumerate(blocks):
        if i and same_group(blocks[i - 1], b):
            lines.append("\n" + b)          # 같은 목록/인용은 붙여서
        else:
            lines.append(("\n\n" if i else "") + b)
    body = re.sub(r"\n{3,}", "\n\n", "".join(lines)).strip()

    desc = ""
    for b in blocks:
        if not b.startswith(("#", "!", ">", "-", "<")):
            desc = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", b)
            desc = re.sub(r"[*`]", "", desc).strip()[:110]
            break

    fname = "%s-%s.md" % (date.strftime("%Y-%m-%d"), slugify(title))
    path = os.path.join(ROOT, "_posts", fname)
    front = (
        "---\n"
        'title: "%s"\n'
        "categories: [%s, %s]\n"
        'description: "%s"\n'
        "---\n\n" % (title.replace('"', "'"), category, tag, desc.replace('"', "'"))
    )
    with open(path, "w", encoding="utf-8") as f:
        f.write(front + body + "\n")
    print("4) 다 됐어요 → _posts/%s" % fname)
    return path


def list_cats():
    """_data/categories.yml 에서 '카테고리 / 태그' 목록을 뽑아요."""
    y = open(os.path.join(ROOT, "_data", "categories.yml"), encoding="utf-8").read()
    cur, out = None, []
    for line in y.splitlines():
        m = re.match(r"\s*-\s*id:\s*(\S+)", line)
        if m:
            cur = m.group(1)
            continue
        m = re.match(r"\s*subs:\s*\[(.*)\]", line)
        if m and cur:
            for s in m.group(1).split(","):
                s = s.strip().strip("'\"")
                if s:
                    out.append("%s / %s" % (cur, s))
    return out


if __name__ == "__main__":
    if "--list" in sys.argv:
        print("\n".join(list_cats()))
        sys.exit(0)
    if len(sys.argv) < 4:
        print("사용법: naver_import.py <네이버글주소> <카테고리> <태그>")
        sys.exit(1)
    try:
        import_post(sys.argv[1], sys.argv[2], sys.argv[3])
    except Exception as e:
        print("오류: %s" % e)
        sys.exit(1)
