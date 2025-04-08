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

RUN go build -v -o /run-app .


FROM debian:bookworm

COPY --from=builder /run-app /usr/local/bin/
CMD ["run-app"]