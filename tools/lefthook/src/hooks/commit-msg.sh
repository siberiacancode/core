#!/usr/bin/env bash

# prefixes a commit message with the current branch name and an emoji
#
#   feat/AB-123 🧊 add testids package
#
# emoji is taken from `git config user.emoji`, defaults to 🧊
#
# usage: bash commit-msg.sh <path-to-commit-msg-file>

set -eu

message_file="${1:-}"

if [ -z "$message_file" ] || [ ! -f "$message_file" ]; then
  echo "lefthook/commit-msg: no commit message file provided" >&2
  exit 1
fi

emoji=$(git config user.emoji || echo "🧊")
branch=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")
message=$(cat "$message_file")

# detached HEAD — nothing to prefix with
if [ -z "$branch" ]; then
  exit 0
fi

if echo "$message" | (! grep -q "^${branch} ${emoji}*") &&\
   echo "$message" | (! grep -q "^Merge branch*") &&\
   echo "$message" | (! grep -q "^Merge remote-tracking branch*");\
then
  echo "$branch $emoji $message" > "$message_file"
fi
