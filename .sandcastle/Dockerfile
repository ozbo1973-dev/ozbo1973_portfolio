FROM node:22-bookworm

# Install system dependencies
RUN apt-get update && apt-get install -y \
  git \
  curl \
  jq \
  && rm -rf /var/lib/apt/lists/*

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
  | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && apt-get update && apt-get install -y gh \
  && rm -rf /var/lib/apt/lists/*

# Build-args for UID/GID alignment: sandcastle docker build-image
# defaults these to the host user's UID/GID so image-built files
# and bind-mounted files share an owner without runtime chown.
ARG AGENT_UID=1000
ARG AGENT_GID=1000

# Rename the base image's "node" user to "agent" and align UID/GID.
RUN groupmod -g $AGENT_GID node && usermod -u $AGENT_UID -g $AGENT_GID -d /home/agent -m -l agent node

# Enable corepack as root: it symlinks the pnpm shim into /usr/local/bin, which
# the unprivileged agent user cannot write. Pin happens later as the agent user.
RUN corepack enable

USER ${AGENT_UID}:${AGENT_GID}

# Install Claude Code CLI
RUN curl -fsSL https://claude.ai/install.sh | bash

# Add Claude to PATH
ENV PATH="/home/agent/.local/bin:$PATH"

WORKDIR /home/agent

# Bake a Linux-native pnpm store into the image so per-iteration installs are
# offline and fast. The store lives outside /home/agent/workspace because the
# git worktree bind-mounts there at runtime and would shadow anything baked in it.
ENV PNPM_HOME=/home/agent/.pnpm
ENV PNPM_STORE_DIR=/home/agent/.pnpm-store
ENV PATH="/home/agent/.pnpm:$PATH"

# Pin pnpm to match the host (no packageManager field in package.json).
# Runs as the agent user; corepack writes the pinned version under PNPM_HOME.
RUN corepack prepare pnpm@11.9.0 --activate

# Copy only the manifests first, then prewarm the store from the lockfile alone.
# allowBuilds in pnpm-workspace.yaml is honored here. Requires the image to be
# built with `--dockerfile .sandcastle/Dockerfile` so the build context is the
# repo root and these files are reachable.
COPY --chown=agent package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm config set store-dir /home/agent/.pnpm-store && pnpm fetch

# In worktree sandbox mode, Sandcastle bind-mounts the git worktree at /home/agent/workspace
# and overrides the working directory to /home/agent/workspace at container start.
# Structure your Dockerfile so that /home/agent/workspace can serve as the project root.
ENTRYPOINT ["sleep", "infinity"]
