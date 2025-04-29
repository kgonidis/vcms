#!/bin/sh

if command -v "docker compose" >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "docker compose or docker-compose not found."
    echo "See https://docs.docker.com/compose/ for installation instructions."
    exit 1
fi

mv backend/posts/apps.py backend/posts/apps.py.bak
${DOCKER_COMPOSE} build
${DOCKER_COMPOSE} up postgres minio -d

docker run \
    --network vcms \
    -e POSTGRES_DB=postgres \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_HOST=postgres \
    -e POSTGRES_PORT=5432 \
    --rm \
    kgonidis/vcms-backend:latest \
    sh -c "python manage.py makemigrations posts && python manage.py migrate"

mv backend/posts/apps.py.bak backend/posts/apps.py
${DOCKER_COMPOSE} build backend

${DOCKER_COMPOSE} up -d
