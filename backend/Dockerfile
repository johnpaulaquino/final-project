FROM ghcr.io/astral-sh/uv:latest AS uv

FROM python:3.14.0-slim AS dev

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy uv from official image
COPY --from=uv /uv /usr/local/bin/uv

# Create non-root user and set app directory ownership
RUN useradd -ms /bin/bash appuser && chown -R appuser:appuser /app

# Environment for UV and virtualenv
ENV UV_VENV_PATH=/home/appuser/.uv_venv
ENV PATH=$UV_VENV_PATH/bin:$PATH
ENV UV_PROJECT_ENVIRONMENT=$UV_VENV_PATH

# Copy only lockfiles first for caching
COPY --chown=appuser:appuser pyproject.toml uv.lock /app/

USER appuser

# Create virtualenv and install dependencies
RUN /usr/local/bin/uv venv $UV_VENV_PATH \
    && /usr/local/bin/uv sync --no-dev --locked

# Copy app source
COPY --chown=appuser:appuser . /app

EXPOSE 6767

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "6767"]
