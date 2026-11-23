#!/bin/sh
# Oyunu derleyip GitHub Pages'in yayınladığı gh-pages dalına gönderir.
set -e
cd "$(dirname "$0")/.."
npm test
GITHUB_PAGES=true npm run build
touch dist/.nojekyll
REMOTE=$(git remote get-url origin)
cd dist
rm -rf .git
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C .. config user.name)" -c user.email="$(git -C .. config user.email)" commit -qm "Yayın $(date +%Y-%m-%d)"
git push -qf "$REMOTE" gh-pages
rm -rf .git
echo "Yayınlandı: https://wabiblack.github.io/garaj/"
