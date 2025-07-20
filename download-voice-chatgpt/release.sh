#!/bin/bash

set -e

# Lấy version từ package.json
VERSION=$(node -p "require('./package.json').version")
RELEASE_NAME="pl_voice-${VERSION}-@/download-voice-chatgpt"
TAG="v${VERSION}"

# Nếu chưa có dist.zip thì tự động build
if [ ! -f ./dist.zip ]; then
  echo "dist.zip not found! Đang tiến hành build..."
  yarn install
  yarn build
fi

# Kiểm tra lại dist.zip
if [ ! -f ./dist.zip ]; then
  echo "Build xong nhưng vẫn không tìm thấy dist.zip!"
  exit 1
fi

# Tạo tag git (nếu chưa có)
if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Tag $TAG đã tồn tại."
else
  git tag "$TAG"
  git push origin "$TAG"
fi

# Tạo release và upload dist.zip (yêu cầu gh CLI: brew install gh)
gh release create "$TAG" ./dist.zip \
  --title "$RELEASE_NAME" \
  --notes "Release $RELEASE_NAME" \
  --latest

echo "Đã tạo release $RELEASE_NAME với file dist.zip" 