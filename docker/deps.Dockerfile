FROM parzivalprime/my-node-base:latest AS deps

WORKDIR /repo

# Network hardening (important for npm)

ENV NODE_OPTIONS="--dns-result-order=ipv4first"

RUN npm config set registry https://registry.npmjs.org/
RUN npm config set fetch-retries 5
RUN npm config set fetch-retry-mintimeout 20000
RUN npm config set fetch-retry-maxtimeout 120000

# Copy ONLY dependency descriptors
COPY package.json package-lock.json nx.json tsconfig.base.json tsconfig.json ./

# Install ONCE
RUN npm ci