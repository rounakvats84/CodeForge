# Online Judge Platform

A full-stack online coding platform inspired by LeetCode, built with a scalable backend architecture using Node.js, Express, PostgreSQL, Prisma, Redis, Docker, and TypeScript.

The project allows authenticated users to solve coding problems, submit solutions in multiple programming languages, and have those submissions evaluated asynchronously by a dedicated worker service.

---

# Features

## User Authentication

- Register
- Login
- Logout
- JWT Authentication
- HttpOnly Cookie-based Authentication
- Protected Routes

---

## Problem Management

- Fetch all coding problems
- Fetch problem details
- Difficulty levels
- Visible test cases
- Hidden test cases (used only during judging)

---

## Submission System

- Create submissions
- Store submission history
- View individual submissions
- Track submission status

Submission lifecycle:

```text
QUEUED
    ↓
RUNNING
    ↓
COMPLETED
```

---

## Asynchronous Judging

Submissions are processed asynchronously using Redis.

Flow:

```text
Client
    │
    ▼
Express API
    │
    ▼
PostgreSQL
(Store Submission)
    │
    ▼
Redis Queue
    │
    ▼
Worker
    │
    ▼
Docker Execution
    │
    ▼
Judge Test Cases
    │
    ▼
Update Submission
```

---

## Multi-language Support

Currently supported:

- C++
- Java
- Python

Each problem stores language-specific execution templates that the worker uses to build runnable programs dynamically.

---

# Tech Stack

## Backend API

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Redis

---

## Worker

- Node.js
- TypeScript
- Prisma
- Redis
- Docker

---

## Database

PostgreSQL

Tables:

- Users
- Problems
- Submissions

---

## Infrastructure

- Docker
- Redis
- Prisma ORM

---

# Project Structure

```text
backend/
│
├── api/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── generated/
│   │   └── index.ts
│   │
│   └── prisma/
│
└── worker/
    ├── src/
    │   ├── config/
    │   ├── docker/
    │   ├── services/
    │   ├── utils/
    │   └── index.ts
```

---

# Backend Architecture

The API follows a layered architecture.

```text
Route
    │
    ▼
Controller
    │
    ▼
Service
    │
    ▼
Prisma / Redis
```

The worker is responsible only for code execution and judging.

```text
Redis
    │
    ▼
Worker
    │
    ▼
Fetch Problem
    │
    ▼
Generate Runnable Source
    │
    ▼
Docker Execution
    │
    ▼
Judge Test Cases
    │
    ▼
Update Database
```

---

# Current Status

Completed

- Authentication
- JWT Authorization
- Cookie Authentication
- Problems API
- Submission API
- PostgreSQL Integration
- Prisma ORM
- Redis Queue
- Worker Service
- Docker Code Execution
- C++ Support
- Java Support
- Python Support
- Submission Tracking
- Multi-language Templates
- End-to-End Judging Pipeline

---

# Planned Features

- Frontend (React)
- Monaco Code Editor
- Live Submission Status (WebSockets)
- Redis Pub/Sub
- Real-time Judge Updates
- Code Draft Auto-save
- User Profiles
- Contest Support
- Discussion Section
- Leaderboards
- Rate Limiting
- Admin Dashboard

---

# Getting Started

Clone the repository

```bash
git clone <repository-url>
```

Install dependencies

```bash
npm install
```

Run PostgreSQL

Run Redis

Start the backend

```bash
npm run dev
```

Start the worker

```bash
npm run worker
```

The API and worker will communicate through Redis to process submissions asynchronously.

---

# Learning Goals

This project is built to gain hands-on experience with:

- Backend Architecture
- REST APIs
- Authentication
- Asynchronous Processing
- Redis
- Docker
- Code Execution Sandboxing
- Database Design
- Distributed Systems
- Scalable System Design

---

## Project Status

🚧 Backend MVP Completed

Frontend and real-time features are currently under development.