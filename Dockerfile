# FROM mcr.microsoft.com/playwright:v1.20.0
# Partially from https://github.com/microsoft/playwright/blob/main/utils/docker/Dockerfile.focal
FROM ubuntu:jammy

# Configuration variables are at the end!

# https://github.com/hadolint/hadolint/wiki/DL4006
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ARG DEBIAN_FRONTEND=noninteractive

# Install up-to-date node & npm, deps for virtual screen & noVNC, firefox, pip for apprise.
RUN apt-get update \
    && apt-get install --no-install-recommends -y curl ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_19.x | bash - \
    && apt-get install --no-install-recommends -y \
      nodejs \
      xvfb \
      x11vnc \
      tini \
      novnc websockify \
      dos2unix \
      python3-pip \
    # && npx playwright install-deps firefox \
    && apt-get install --no-install-recommends -y \
      libgtk-3-0 \
      libasound2 \
      libxcomposite1 \
      libpangocairo-1.0-0 \
      libpango-1.0-0 \
      libatk1.0-0 \
      libcairo-gobject2 \
      libcairo2 \
      libgdk-pixbuf-2.0-0 \
      libdbus-glib-1-2 \
      libxcursor1 \
    && apt-get autoclean -y \
    && apt-get autoremove -y \
    && rm -rf \
      /tmp/* \
      /usr/share/doc/* \
      /var/cache/* \
      /var/lib/apt/lists/* \
      /var/tmp/*

RUN ln -s /usr/share/novnc/vnc_auto.html /usr/share/novnc/index.html
RUN pip install apprise

WORKDIR /fgc
COPY package*.json ./

# Playwright installs patched firefox to ~/.cache/ms-playwright/firefox-*
# Requires some system deps to run (see install-deps above).
RUN npm install
# Old: PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD + install firefox (had to be done after `npm install` to get the correct version). Now: playwright-firefox as npm dep and `npm install` will only install that.
# RUN npx playwright install firefox

COPY . .

# Shell scripts need Linux line endings. On Windows, git might be configured to check out dos/CRLF line endings, so we convert them for those people in case they want to build the image. They could also use --config core.autocrlf=input
RUN dos2unix *.sh && chmod +x *.sh
COPY docker-entrypoint.sh /usr/local/bin/

# Configure VNC via environment variables:
ENV VNC_PORT 5900
ENV NOVNC_PORT 6080
EXPOSE 5900
EXPOSE 6080

# Configure Xvfb via environment variables:
ENV WIDTH 1280
ENV HEIGHT 1280
ENV DEPTH 24

# Show browser instead of running headless
ENV SHOW 1

# Script to setup display server & VNC is always executed.
ENTRYPOINT ["docker-entrypoint.sh"]
# Default command to run. This is replaced by appending own command, e.g. `docker run ... node prime-gaming` to only run this script.
CMD node epic-games; node prime-gaming; node gog
