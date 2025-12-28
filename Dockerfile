FROM python:3.11-slim

WORKDIR /app

ENV CUDA_VISIBLE_DEVICES=-1

# system deps for opencv (headless) and general build needs
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# install python deps
COPY backend/requirements-backend.txt /app/backend/requirements-backend.txt
RUN pip install --no-cache-dir -r /app/backend/requirements-backend.txt

# copy source code + backend + artifacts (model must exist!)
COPY src /app/src
COPY backend /app/backend

EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
