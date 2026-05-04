# Solo Chat Dockerfile
# Node.js Chat Service
# 使用华为云镜像加速

FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:20-alpine as builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 使用淘宝镜像
RUN pnpm config set registry https://registry.npmmirror.com

COPY solo-chat/package*.json ./

# 安装所有依赖（包括 devDependencies 用于构建）
RUN pnpm install --ignore-scripts

COPY solo-chat .

# 构建
RUN pnpm run build

# 删除 devDependencies
RUN pnpm prune --prod

FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:20-alpine

WORKDIR /app

# 使用阿里云 Alpine 镜像源
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    apk add --no-cache curl

# 使用淘宝 npm 镜像
RUN npm config set registry https://registry.npmmirror.com

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api ./api
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["npm", "start"]

LABEL maintainer="InvestKit Team"
LABEL version="1.0.0"
LABEL description="Solo Chat - Chat Service"
