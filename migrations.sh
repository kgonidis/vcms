#!/bin/sh
docker run \
    --network vcms \
    -e POSTGRES_DB=postgres \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_HOST=postgres \
    -e POSTGRES_PORT=5432 \
    --rm \
    vcms-backend:latest \
    python manage.py makemigrations posts

docker run \
    --network vcms \
    -e POSTGRES_DB=postgres \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_HOST=postgres \
    -e POSTGRES_PORT=5432 \
    --rm \
    vcms-backend:latest \
    python manage.py migrate