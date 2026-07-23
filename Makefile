.PHONY: up down build rebuild logs test test-nest test-php test-front lint shell-nest shell-php shell-front

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

rebuild: down build up

logs:
	docker compose logs -f

test: test-nest test-php test-front

test-nest:
	pnpm --dir backend-nest test

test-php:
	composer --working-dir=backend-php test

test-front:
	pnpm --dir frontend test

lint:
	pnpm --dir frontend lint
	pnpm --dir backend-nest run lint

shell-nest:
	docker compose exec nest sh

shell-php:
	docker compose exec php sh

shell-front:
	docker compose exec frontend sh
