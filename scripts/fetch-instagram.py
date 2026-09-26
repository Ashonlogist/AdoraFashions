"""
Pulls the Instagram media behind the links in content/collections.json and
saves the actual files into public/images.

Why this exists: an instagram.com/p/... link is a web page, and a browser
cannot draw a web page as an image. Only a direct file URL works, and those
fbcdn.net links expire within hours — so the files are fetched once and
self-hosted, and only the local path is written back to the content file. That
way the site keeps working after the links have died.

The earlier failure to read these in a browser was not a dead end: instaloader
talks to Instagram's public GraphQL endpoint, which the page and the embed
route both block. Run with the venv python:

    /tmp/opencode/igvenv/bin/python scripts/fetch-instagram.py --dry-run
    /tmp/opencode/igvenv/bin/python scripts/fetch-instagram.py
"""
import argparse
import json
import pathlib
import re
import sys
import urllib.request

import instaloader

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "collections.json"
IMAGES = ROOT / "public" / "images"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-") or "piece"


def shortcode_of(url):
    match = re.search(r"instagram\.com/(?:p|reel|reels|tv)/([^/?#]+)", url)
    return match.group(1) if match else None


def fetch(url, dest):
    request = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(request, timeout=120) as response:
        data = response.read()
    dest.write_bytes(data)
    return len(data)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true",
                        help="report what would be fetched without downloading")
    args = parser.parse_args()

    data = json.loads(CONTENT.read_text())
    loader = instaloader.Instaloader(
        download_pictures=False, download_videos=False,
        download_video_thumbnails=False, quiet=True,
    )

    plan, mapping = [], {}
    for index, item in enumerate(data["items"]):
        code = shortcode_of(item["image"])
        if not code:
            print(f"  skip  {item['title']}: not an Instagram link "
                  f"({item['image'][:40]})")
            continue

        try:
            post = instaloader.Post.from_shortcode(loader.context, code)
        except Exception as error:
            print(f"  FAIL  {item['title']}: {type(error).__name__}: "
                  f"{str(error)[:90]}")
            continue

        # A reel is kept as the video itself, so the card plays it. A photo is
        # kept as the photo.
        is_video = bool(post.is_video)
        source = post.video_url if is_video else post.url
        extension = ".mp4" if is_video else ".jpg"
        name = f"ig-{slug(item['title'])}{extension}"
        caption = " ".join((post.caption or "").split())[:90]

        plan.append((index, item["title"], code, is_video, source, name, caption))

        if args.dry_run:
            print(f"  ok    {item['title']:<16} {code}  "
                  f"{'reel' if is_video else 'photo':<5} -> {name}")
            continue

        IMAGES.mkdir(parents=True, exist_ok=True)
        size = fetch(source, IMAGES / name)
        mapping[str(index)] = {
            "image": f"/images/{name}",
            "code": code,
            "isVideo": is_video,
            "caption": caption,
            "owner": post.owner_username,
            "bytes": size,
        }
        print(f"  ok    {item['title']:<16} {code}  "
              f"{'reel' if is_video else 'photo':<5} -> {name}  "
              f"{size / 1024:.0f} KB")

    if args.dry_run:
        return 0

    # Written only once every file is on disk, so a partial failure can never
    # leave the content file pointing at something that was never downloaded.
    (ROOT / "content" / ".instagram-map.json").write_text(
        json.dumps(mapping, indent=2) + "\n"
    )
    print(f"\n{len(mapping)} of {len(data['items'])} items fetched; "
          f"mapping in content/.instagram-map.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
