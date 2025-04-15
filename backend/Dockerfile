ARG GO_VERSION=1
FROM golang:${GO_VERSION}-bookworm as builder

WORKDIR /usr/src/app
COPY go.mod go.sum ./
RUN go mod download && go mod verify
COPY . .

# Pass the backend URL as a build argument
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
ARG FRONTEND_URL
ENV FRONTEND_URL=${FRONTEND_URL}

# Build both the main app and the migration tool
RUN go build -v -o /run-app .
RUN go build -v -o /migrate ./cmd/migrate


FROM debian:bookworm

# Install CA certificates
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /run-app /usr/local/bin/
COPY --from=builder /migrate /usr/local/bin/

# Set environment to production by default
ENV ENVIRONMENT=production

CMD ["run-app"]