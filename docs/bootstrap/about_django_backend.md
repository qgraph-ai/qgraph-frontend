# QGraph Backend Context Pack (For Next.js Repo + Fresh ChatGPT Threads)

## Why this file exists

Use this as a transfer document when:

- copying backend context into your Next.js repository so Codex there understands the backend shape
- starting a fresh ChatGPT thread and needing immediate project context

Generated from current code in this backend repo (not only docs), with extra focus on `search/views.py`.

---

## 0) First: Big picture of the Django file (`search/views.py`)

`search/views.py` is the gateway layer for search HTTP APIs. It validates incoming search requests, delegates core business flow to orchestration services, and returns a frontend-friendly envelope that supports both immediate (`sync`) and queued (`async`) execution models. It also exposes authenticated user features around saved searches, bookmarks, feedback, and interaction logging, while preserving guest access through token-based controls on execution read endpoints.

---

## 1) Big Picture: What this Django backend is

QGraph backend is a Django + DRF monolith organized by domain apps:

- `accounts`: custom user identity and JWT auth integration
- `quran`: canonical Quran data + read APIs (surah/ayah/structures/translations/search)
- `segmentation`: workspace-based, versioned segmentation artifacts and public browsing
- `search`: AI-backed search orchestration, execution lifecycle tracking, and user search artifacts

Core stack:

- Django 6 + DRF
- PostgreSQL
- Djoser + SimpleJWT
- drf-spectacular (OpenAPI docs)
- Celery + Redis (used by async search execution)

Root API namespaces:

- `/api/v1/quran/...`
- `/api/v1/segmentation/...`
- `/api/v1/search/...`
- `/api/auth/...`
- schema/docs: `/api/schema/`, `/api/docs/`, `/api/redoc/`

---

## 2) Backend architecture pattern

Across apps the pattern is consistent:

1. `models.py`: domain schema + DB constraints
2. `serializers.py`: input validation + output shaping
3. `views.py`: endpoint behavior and orchestration
4. `urls.py`: route mounting

This makes frontend integration predictable: each resource usually has model-backed serializer output and explicit endpoints for custom actions.

---

## 3) Deep focus: `search/views.py` big picture

`search/views.py` is the HTTP API facade for the full search lifecycle. It does not directly call external AI services; it delegates to orchestration services.

### Main responsibilities

- accepts search submission requests
- returns a normalized submission envelope for both sync and async modes
- exposes polling and response-retrieval endpoints
- provides authenticated history/saved-search/bookmark/feedback/interaction endpoints
- enforces access through ownership (auth users) or guest token flow (guest searches)

### Core endpoint classes in `search/views.py`

- `SearchSubmitAPIView` (`POST /api/v1/search/`)
- `SearchExecutionDetailAPIView` (`GET /api/v1/search/executions/{id}/`)
- `SearchExecutionResponseAPIView` (`GET /api/v1/search/executions/{id}/response/`)
- `SearchHistoryAPIView` (`GET /api/v1/search/history/`)
- `SearchQueryDetailAPIView` (`GET /api/v1/search/queries/{id}/`)
- `SavedSearchViewSet` (`/api/v1/search/saved-searches/...`, including `POST .../{id}/run/`)
- `SearchBookmarkViewSet` (`/api/v1/search/bookmarks/...`)
- `SearchFeedbackCreateAPIView` (`POST /api/v1/search/feedback/`)
- `SearchInteractionCreateAPIView` (`POST /api/v1/search/interactions/`)

### Key helper in the file

`_build_submission_envelope(request, result)` builds a stable frontend-facing payload:

- `query_id`
- `execution_id`
- `execution_status`
- `mode` (`sync` or `async`)
- `poll_url`
- `response_url`
- `response` (embedded for sync; null for async-before-ready)
- `guest_token` (only for guest submissions)

### Important behavior for frontend

- Sync path returns `201` and usually includes full response payload.
- Async path returns `202` with polling URLs and no final response yet.
- If `GET /executions/{id}/response/` is called too early, API returns `409` with current status.

---

## 4) Search end-to-end flow (actual code path)

### Submit (`POST /api/v1/search/`)

1. `search/views.py` validates payload with `SearchSubmitSerializer`.
2. Calls `search.services.orchestration.submit_search(...)`.
3. Orchestration creates:
   - `SearchQuery` (guest or user-owned)
   - `SearchExecution` (with immutable `request_payload`)
4. Planner call (`AIBackendSearchPlanner`) hits AI backend `/v1/search/plan`.
5. Planner returns mode + policy/routing metadata.
6. If mode is:
   - `sync`: backend executes immediately, persists response, returns `201`.
   - `async`: marks queued, dispatches Celery task, returns `202`.

### Async execution path

- Celery task: `search.tasks.run_search_execution_task`
- Task calls `run_search_execution(execution_id=...)`
- Executor calls AI backend `/v1/search/execute`
- Result is validated/mapped into typed contracts
- Persistence layer writes:
  - `SearchResponse`
  - `SearchResponseBlock[]`
  - `SearchResultItem[]`
- Execution and query statuses updated to terminal state

---

## 5) Search data model map

Runtime chain:

`SearchQuery -> SearchExecution -> SearchResponse -> SearchResponseBlock -> SearchResultItem`

Supporting user features:

- `SavedSearch`
- `SearchBookmark` (response OR result item)
- `SearchFeedback` (exactly one target level)
- `SearchInteractionEvent`

Notable status enums:

- Query status: `pending | running | succeeded | failed | canceled`
- Execution status: `pending | queued | running | succeeded | partial | failed | canceled`

---

## 6) Search auth + access model

### Guest flow

- Guest can submit search (`POST /api/v1/search/`)
- Guest query stored with:
  - `user = null`
  - `is_guest = true`
  - generated `guest_token`
- Guest can read execution + response only if token matches:
  - header: `X-Search-Guest-Token` (preferred)
  - query param fallback: `?guest_token=...`

### Authenticated flow

- Owners can access their own query/execution/response
- Extra endpoints requiring auth:
  - history
  - saved searches
  - bookmarks
  - feedback
  - interactions

Security detail: unauthorized execution access intentionally returns `404` (not `403`) to avoid resource existence leakage.

---

## 7) AI backend contract (critical for integration)

Configured by:

- `SEARCH_AI_BACKEND_URL`
- `SEARCH_AI_BACKEND_TIMEOUT_SECONDS`

Planner request endpoint:

- `POST {SEARCH_AI_BACKEND_URL}/v1/search/plan`

Execute request endpoint:

- `POST {SEARCH_AI_BACKEND_URL}/v1/search/execute`

Planner response must include:

- `mode` (`sync` or `async`)
- optional: `policy_label`, `policy_snapshot`, `routing_metadata`, `backend_name`, `backend_version`

Execute response is parsed into:

- top-level: `title`, `overall_confidence`, `render_schema_version`, `metadata`, `blocks[]`
- each block: `order`, `block_type`, `title`, `payload`, `explanation`, `confidence`, `provenance`, `warning_text`, `items[]`
- each item: `rank`, `result_type`, `score`, `title`, `snippet_text`, `highlighted_text`, `match_metadata`, `explanation`, `provenance`

The backend validates types and uniqueness (e.g., unique block `order`, unique item `rank` inside a block). Malformed payloads fail execution.

---

## 8) Other app context (for full product understanding)

### `accounts`

- custom user model `accounts.User`
- email is login identifier (`USERNAME_FIELD = "email"`, no username field)
- auth via Djoser + JWT under `/api/auth/...`

### `quran`

- canonical entities: Surah, Ayah, structural boundaries (Juz/HizbQuarter/Manzil/Ruku)
- translation sources and ayah translations
- mostly read-focused APIs, used as foundational dataset for other apps

### `segmentation`

- workspace-scoped, versioned segmentation snapshots over Quran ayahs
- key public browsing endpoints under `/api/v1/segmentation/public/...`
- owner-authenticated lifecycle endpoints for managing workspaces/versions/tags
- snapshot model is version-creating (immutable style), not in-place mutation

---

## 9) Frontend integration cheat sheet (Next.js)

### Base assumptions

- Backend base URL e.g. `http://127.0.0.1:8000`
- JWT for authenticated endpoints
- Search submit works for both guests and auth users

### Suggested search UX algorithm

1. `POST /api/v1/search/` with `{ query, filters?, output_preferences? }`
2. If response status is `201`:
   - render embedded `response` immediately
3. If response status is `202`:
   - keep `execution_id`, `poll_url`, `response_url`, optional `guest_token`
   - poll execution until terminal
   - then fetch `response_url`
4. If polling response endpoint returns `409`, keep polling execution status

### Request headers

- Auth endpoints: `Authorization: Bearer <access_token>`
- Guest read endpoints: `X-Search-Guest-Token: <guest_token>`

---

## 10) Operational notes

- Celery is wired and used by async search mode.
- Broker/result backend defaults assume Redis.
- In local dev, run API + Celery worker for async mode to complete.

Quick local run (high level):

1. `uv sync`
2. `docker compose up -d db redis`
3. `uv run python manage.py migrate`
4. `uv run python manage.py runserver`
5. `uv run celery -A qgraph worker --loglevel=INFO`

---

## 11) Files worth reading first in this repo

- `search/views.py`
- `search/services/orchestration.py`
- `search/services/ai_backend_client.py`
- `search/services/execution_backend.py`
- `search/services/persistence.py`
- `search/models.py`
- `search/serializers.py`
- `qgraph/urls.py`
- `qgraph/settings.py`
- `docs/apps/search.md`
- `docs/architecture.md`

---

## 12) Known caveat when using docs

Some docs are partially stale relative to code evolution. Prefer current code for truth, especially in search async behavior (Celery is now actively used by search async execution).
