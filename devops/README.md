# DevOps Configuration

This directory contains Docker configurations for deploying pre-built EZTest images from GitHub Container Registry (GHCR).

## Directory Structure

```
devops/
├── develop/          # Development environment deployment
│   ├── Dockerfile    # Dockerfile for develop branch
│   └── docker-compose.yml  # Uses ghcr.io/houseoffoss/eztest/develop:latest
├── production/       # Production environment deployment
│   ├── Dockerfile    # Dockerfile for production branch
│   └── docker-compose.yml  # Uses ghcr.io/houseoffoss/eztest/main:latest
└── README.md         # This file
```

## Purpose

### Root Directory Files
- `Dockerfile` - Production-optimized multi-stage build
- `Dockerfile.dev` - Development build with hot-reloading
- `docker-compose.yml` - Local production-like deployment
- `docker-compose.dev.yml` - Local development environment
- `docker-entrypoint.sh` - Shared startup script (used by all environments)

### DevOps Directory Files
The files in `devops/` are for deploying **pre-built images** from GitHub Container Registry:

- **`develop/`** - For deploying the latest develop branch build
- **`production/`** - For deploying the latest production/main branch build

## Usage

### Deploy Development Environment (from pre-built image)
```bash
cd devops/develop
cp ../../.env.example .env
# Edit .env with your configuration
docker compose up -d
```

### Deploy Production Environment (from pre-built image)
```bash
cd devops/production
cp ../../.env.example .env
# Edit .env with your configuration
docker compose up -d
```

### Local Development (build from source)
```bash
# From repository root
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d
```

### Local Production Build (from source)
```bash
# From repository root
cp .env.example .env
docker compose up -d
```

## Key Differences

| Aspect | Root Files | DevOps Files |
|--------|-----------|--------------|
| **Purpose** | Build from source | Deploy pre-built images |
| **Use Case** | Local development/testing | Server deployment |
| **Build Time** | ~5-10 minutes | ~30 seconds (pull only) |
| **Image Source** | Local build | GitHub Container Registry |
| **Customization** | Full source access | Environment variables only |

## Notes

- All Dockerfiles use the shared `docker-entrypoint.sh` from the root directory
- The entrypoint script handles database migrations and seeding
- Pre-built images are automatically built and pushed via GitHub Actions CI/CD
