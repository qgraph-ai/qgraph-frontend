# QGraph Project Overview

## Purpose

QGraph is a software project with multiple repositories that together form a larger system. At the current stage, it includes:

- a Django backend
- a Next.js frontend
- a separate AI backend/service

The frontend is intended to communicate with the Django backend. The AI backend is being developed as a separate service so that AI-related logic is not hardcoded inside the Django backend.

The general direction of the project is to build a system where the traditional backend remains responsible for persistence, API structure, authentication, and domain logic, while AI-specific workflows are delegated to a dedicated AI service.

---

## Repository Structure

At the time of writing, the local project structure is:

```text
qgraph/
├── qgraph-backend
├── qgraph-frontend
└── qgraph-ai-service
````

### `qgraph-backend`

This is the Django backend.

It is the most mature part of the system at the moment. It provides the main API, persistence layer, and domain models.

### `qgraph-frontend`

This is the Next.js frontend.

It is intended to be the user-facing application that talks to the Django backend.

### `qgraph-ai-service`

This repository is for the AI backend/service.

Its role is to handle AI-related workflows and allow the Django backend to call real AI endpoints instead of keeping temporary or dummy AI logic inside Django.

---

## High-Level Architecture

The current intended architecture is separation of concerns across three parts:

### 1. Frontend

The frontend is implemented with Next.js.

Its role is to:

* provide the user interface
* communicate with the Django backend
* display and manage data returned by the backend
* eventually support workflows that involve AI-powered features

### 2. Django Backend

The Django backend acts as the main application backend.

Its responsibilities include:

* API endpoints
* authentication and authorization
* persistence in PostgreSQL
* domain models and business logic
* orchestration of application workflows
* integration with asynchronous processing using Celery and Redis
* communication with the AI backend when needed

The Django backend should remain the canonical source of truth for application data.

### 3. AI Backend

The AI backend is a separate service.

Its purpose is to:

* encapsulate AI-specific logic
* expose endpoints that the Django backend can call
* replace temporary or dummy AI logic previously placed inside Django
* evolve independently as AI workflows become more advanced

This separation is intentional so that AI-related code can be developed, tested, and deployed with its own lifecycle.

---

## Current Backend State

The Django backend is already relatively mature.

Known parts of the backend include multiple Django apps such as:

* `accounts`
* `quran`
* `segmentation`
* `search`

### Accounts

Handles user-related functionality and authentication.

### Quran

Contains canonical Quran structures and read APIs.

### Segmentation

Handles workspace-oriented segmentation artifacts over Quran ayahs, including versioned snapshots and browsing endpoints.

### Search

A newer app focused on orchestration and persistence for search workflows.

The search app is designed as an orchestration/persistence layer. It includes concepts such as:

* search queries
* executions
* responses
* response blocks
* result items
* saved searches
* bookmarks
* feedback
* interaction events

The backend also includes support for asynchronous processing using Celery and Redis.

---

## Design Direction

A major architectural direction in QGraph is to avoid embedding long-term AI logic directly inside the Django backend.

Instead, the intended pattern is:

* Django owns application structure, persistence, and user-facing API contracts
* AI-specific processing is delegated to a separate AI service
* the frontend primarily communicates with Django, not directly with the AI service

This keeps responsibilities clearer and makes the system easier to evolve.

---

## Frontend Role

The Next.js frontend is expected to become the main user-facing interface for QGraph.

At a high level, it should:

* consume APIs exposed by the Django backend
* represent backend concepts clearly in the UI
* remain aligned with backend contracts rather than inventing its own domain assumptions
* be implemented in a maintainable and production-oriented way

---

## Development Philosophy

Several principles are already clear from the existing project direction:

* keep responsibilities separated across frontend, Django backend, and AI backend
* prefer explicit architecture over hidden coupling
* avoid dummy logic in mature layers when real service boundaries are available
* treat Django/PostgreSQL as the canonical application source of truth
* use documentation to provide context for both human developers and AI coding agents
* optimize for maintainability and future scalability rather than only short-term speed

---

## Guidance for AI Agents

When assisting with QGraph development, prefer the following assumptions unless more specific documentation overrides them:

* the frontend is a Next.js application
* the frontend should primarily talk to the Django backend
* the Django backend is the main source of truth for application data and workflows
* the AI backend is a separate service intended for AI-specific processing
* architecture and contracts should be respected rather than guessed
* when a detail is unclear, do not invent it

Accuracy is more important than completeness.

