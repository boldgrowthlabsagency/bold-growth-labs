#!/usr/bin/env bash
# ============================================================
# CONCEPT ASSET DERIVATIVES
#
# Turns one high-res source into the exact set of files the
# concept `Img` component expects: landscape widths, plus the
# portrait crops that stop phones cover-scaling a 16:9 frame
# into a tall box.
#
# Widths written here MUST match the entry in components/
# concepts/kit.tsx ASSETS — asking for a file that was never
# generated is a silent 404 and a broken image.
#
#   ./scripts/make-concept-assets.sh <src> <slug> <name> [--portrait]
#
# Requires cwebp (brew install webp libtiff) and ffmpeg.
# ============================================================
set -euo pipefail

SRC="${1:?source image}"
SLUG="${2:?concept slug}"
NAME="${3:?asset base name}"
PORTRAIT="${4:-}"

OUT="public/concepts/$SLUG"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$OUT"

# Landscape ladder. 2560 is only emitted when the source can actually fill it —
# upscaling to hit a number in the contract would ship a soft file pretending
# to be a sharp one.
SRC_W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$SRC")
MAXW="${MAXW:-2560}"
for w in 640 1280 1920 2560; do
  if [ "$w" -gt "$MAXW" ]; then
    continue
  fi
  if [ "$w" -gt "$SRC_W" ]; then
    echo "  skip ${w}w (source is only ${SRC_W}px)"
    continue
  fi
  ffmpeg -hide_banner -loglevel error -i "$SRC" -vf "scale=$w:-2:flags=lanczos" -frames:v 1 -y "$TMP/$w.png"
  cwebp -quiet -q 82 -m 6 -sharp_yuv "$TMP/$w.png" -o "$OUT/$NAME-$w.webp"
  printf "  %-28s %6.1f KB\n" "$NAME-$w.webp" "$(echo "scale=1; $(stat -f%z "$OUT/$NAME-$w.webp")/1024" | bc)"
done

# Portrait crops: centre-crop to 9:16 FIRST, then scale. Cropping after scaling
# would throw away the resolution that makes the crop worth shipping.
if [ "$PORTRAIT" = "--portrait" ]; then
  for w in 405 608 810; do
    h=$(( w * 16 / 9 ))
    ffmpeg -hide_banner -loglevel error -i "$SRC" \
      -vf "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',scale=$w:$h:flags=lanczos" \
      -frames:v 1 -y "$TMP/p$w.png"
    cwebp -quiet -q 82 -m 6 -sharp_yuv "$TMP/p$w.png" -o "$OUT/$NAME-p$w.webp"
    printf "  %-28s %6.1f KB\n" "$NAME-p$w.webp" "$(echo "scale=1; $(stat -f%z "$OUT/$NAME-p$w.webp")/1024" | bc)"
  done
fi
