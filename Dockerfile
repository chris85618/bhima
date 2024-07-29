FROM node:lts

# Install missing dependencies for chromium
# These are all needed to make sure the browser can properly render all
# the requiredd page
RUN apt-get update && apt-get install -y \
  ca-certificates fonts-liberation gconf-service \
  libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2  \
  libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libgconf-2-4 \
  libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 \
  libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
  libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
  libxss1 libxtst6 lsb-release libxshmfence1 chromium bash -y \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

COPY --chown=node:node package.json package-lock.json /usr/src/app/

# Install dependencies
RUN npm install && \
   npm install --omit=dev
RUN npm install istanbul-middleware request

# Copy source code
COPY --chown=node:node . /usr/src/app/

# Copy environment file to bin folder
COPY --chown=node:node .env.docker /usr/src/app/.env

# Package
RUN NODE_ENV=production npm run build && chown -R node:node /usr/src/app/bin

# Change directory to bin
WORKDIR /usr/src/app/bin/

# Switch to non-root user
USER node

ENV NODE_ENV production

LABEL org.opencontainers.image.source=https://github.com/third-Culture-Software/bhima
LABEL org.opencontainers.image.description="A hospital information management application for rural Congolese hospitals"
LABEL org.opencontainers.image.licenses=GPL

# Define startup command
CMD ["bash", "docker-entrypoint.sh"]
