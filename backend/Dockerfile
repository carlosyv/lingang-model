# syntax=docker/dockerfile:1
FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt

COPY backend/app ./app
COPY backend/tests ./tests
COPY backend/entrypoint.sh .
COPY database ./database
COPY datasets ./datasets

RUN chmod +x entrypoint.sh

ENV PYTHONPATH=/app

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
