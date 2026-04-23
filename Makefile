# ── Attendify Makefile ────────────────────────────────────────────────────────
# Usage: make <target>

.PHONY: help install dev seed test test-backend test-frontend \
        build docker-up docker-down docker-logs clean

# Default: show help
help:
	@echo ""
	@echo "  Attendify — available commands"
	@echo ""
	@echo "  make install        Install all dependencies (frontend + backend)"
	@echo "  make dev            Start both servers in development mode"
	@echo "  make seed           Seed the database with demo data"
	@echo "  make test           Run all tests (frontend + backend)"
	@echo "  make test-backend   Run backend tests only"
	@echo "  make test-frontend  Run frontend tests only"
	@echo "  make build          Production build of frontend"
	@echo "  make docker-up      Start full stack via Docker Compose"
	@echo "  make docker-down    Stop Docker Compose services"
	@echo "  make docker-logs    Stream Docker Compose logs"
	@echo "  make clean          Remove node_modules and build artifacts"
	@echo ""

# ── Setup ─────────────────────────────────────────────────────────────────────
install:
	@echo "📦 Installing backend dependencies..."
	cd backend && npm install
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ All dependencies installed"
	@echo ""
	@echo "Next steps:"
	@echo "  1. cp backend/.env.example backend/.env"
	@echo "  2. Fill in MONGODB_URI and JWT_SECRET in backend/.env"
	@echo "  3. make seed"
	@echo "  4. make dev"

# ── Development ───────────────────────────────────────────────────────────────
dev:
	@echo "🚀 Starting development servers..."
	@echo "   Backend  → http://localhost:5000"
	@echo "   Frontend → http://localhost:5173"
	@# Use & to run both in parallel; trap ensures cleanup on Ctrl+C
	@(trap 'kill 0' INT; \
	  cd backend  && npm run dev & \
	  cd frontend && npm run dev & \
	  wait)

seed:
	@echo "🌱 Seeding database..."
	cd backend && npm run seed

# ── Tests ─────────────────────────────────────────────────────────────────────
test: test-backend test-frontend

test-backend:
	@echo "🧪 Running backend tests..."
	cd backend && npm test

test-frontend:
	@echo "🧪 Running frontend tests..."
	cd frontend && npm test

# ── Build ─────────────────────────────────────────────────────────────────────
build:
	@echo "🏗️  Building frontend for production..."
	cd frontend && npm run build
	@echo "✅ Build complete → frontend/dist/"

# ── Docker ────────────────────────────────────────────────────────────────────
docker-up:
	@echo "🐳 Starting Docker Compose stack..."
	docker compose up -d
	@echo "✅ Services running:"
	@echo "   API      → http://localhost:5000"
	@echo "   Frontend → http://localhost:5173"
	@echo "   MongoDB  → localhost:27017"

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

# ── Clean ─────────────────────────────────────────────────────────────────────
clean:
	@echo "🧹 Cleaning up..."
	rm -rf backend/node_modules
	rm -rf frontend/node_modules
	rm -rf frontend/dist
	rm -rf backend/coverage
	rm -rf frontend/coverage
	@echo "✅ Done"
