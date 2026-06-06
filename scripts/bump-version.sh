#!/bin/bash

set -e

if [[ -z $1 ]]; then
  echo "Usage: $0 {patch|minor|major}"
  exit 1
fi

if [[ $1 =~ ^(patch|minor|major)$ ]]; then
  echo "Creating a new '$1' version"
else
  echo "Invalid argument: $1"
  echo "Usage: $0 {patch|minor|major}"
  exit 1
fi

if [[ -n $(git status --porcelain) ]]; then
  echo "Your working directory is not clean. Please commit or stash your changes before proceeding."
  exit 1
else
  echo "Your working directory is clean."
fi

echo "Bumping version"
# Bump package.json only; we create the commit and tag ourselves below so the
# tag matches the bare version (e.g. 0.7.7) that publish.yml triggers on.
npm version "$1" --no-git-tag-version

# Commit and tag
git add .
TAG=$(node -p "require('./package.json').version")
git commit -m "Bump version to $TAG"

git push
echo "Tagging $TAG"
git tag -a "$TAG" -m "Release $TAG"
git push origin "$TAG"
echo "Done"
