FROM node:22-alpine AS builder

ARG BUILD_VERSION=0.1.0
ARG BUILD_ARCH=amd64

LABEL \
  io.hass.version=${BUILD_VERSION} \
  io.hass.type="app" \
  io.hass.arch=${BUILD_ARCH}

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY atlas-plugins ./atlas-plugins
COPY examples ./examples
COPY scripts ./scripts

RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:22-alpine AS runtime

ARG BUILD_VERSION=0.1.0
ARG BUILD_ARCH=amd64

LABEL \
  io.hass.version=${BUILD_VERSION} \
  io.hass.type="app" \
  io.hass.arch=${BUILD_ARCH}

WORKDIR /app

ENV NODE_ENV=production \
    ATLAS_HOST=0.0.0.0 \
    ATLAS_APP_HOST=0.0.0.0 \
    ATLAS_APP_PORT=4176 \
    ATLAS_ADMIN_PORT=4175 \
    ATLAS_DEMO_PORT=4174 \
    ATLAS_DISTRIBUTION_TARGET=home-assistant-app-preview

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/examples ./examples
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/atlas-plugins ./atlas-plugins
COPY run.sh /run.sh

RUN chmod a+x /run.sh

EXPOSE 4176 4175 4174

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "const port = process.env.ATLAS_APP_PORT || '4176'; fetch('http://127.0.0.1:' + port + '/health').then(response => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"]

CMD ["/run.sh"]
