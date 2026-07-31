# Online Judge Platform

A scalable LeetCode-inspired coding platform built using a distributed backend architecture with Node.js, Express, PostgreSQL, Prisma, Redis, Docker, Socket.IO, and TypeScript.

The platform supports secure authentication, asynchronous code execution, real-time submission updates, and multi-language judging through an isolated worker system.

---

# Features

## Authentication

- User Registration
- User Login
- JWT Authentication
- HttpOnly Cookie Authentication
- Protected Routes
- Logout

---

## Problem Management

- Fetch all coding problems
- Fetch individual problem details
- Difficulty levels
- Visible test cases
- Hidden test cases
- Language-specific execution templates

---

## Submission System

- Create submissions
- View submission history
- View submission details
- Submission status tracking

Submission lifecycle:

```text
QUEUED
    ↓
RUNNING
    ↓
COMPLETED
```

---

## Asynchronous Code Execution

Submissions are processed asynchronously using Redis queues.

Flow:

```text
Client

↓

Express API

↓

Store Submission

↓

Redis Queue

↓

Worker

↓

Docker Execution

↓

Judge Solution

↓

Update Database
```

---

## Real-Time Updates

Submission progress is delivered instantly using Redis Pub/Sub and Socket.IO.

Flow:

```text
Worker

↓

Redis Pub/Sub

↓

WebSocket Server

↓

Browser
```

Users receive submission updates without refreshing the page.

---

## Multi-language Support

Supported languages:

- C++
- Java
- Python

Each problem contains language-specific execution templates used by the worker to generate executable source code dynamically.

---

# Tech Stack

## Backend

- Node.js
- Express.js
- TypeScript

---

## Database

- PostgreSQL
- Prisma ORM

---

## Authentication

- JWT
- bcrypt
- HttpOnly Cookies

---

## Queue

- Redis Lists

---

## Pub/Sub

- Redis Pub/Sub

---

## Real-time Communication

- Socket.IO

---

## Code Execution

- Docker

---

# Project Structure

```text
backend/

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
├── worker/
│   ├── src/
│   │   ├── config/
│   │   ├── docker/
│   │   ├── services/
│   │   ├── utils/
│   │   └── index.ts
│
└── websocket/
    ├── src/
    │   ├── config/
    │   ├── socket/
    │   ├── services/
    │   └── index.ts
```

---

# Architecture

## Primary Backend

Responsible for:

- Authentication
- Problem APIs
- Submission APIs
- Database Operations
- Queueing submissions

---

## Worker

Responsible for:

- Consuming Redis Queue
- Fetching problems
- Building executable source
- Running Docker containers
- Judging submissions
- Updating database
- Publishing submission results

---

## WebSocket Server

Responsible for:

- Maintaining persistent Socket.IO connections
- Subscribing to Redis Pub/Sub
- Delivering submission updates to connected clients

---

# Distributed System Flow

```text
Browser
    │
    ├──────────────┐
    │              │
REST API      Socket.IO
    │              │
    ▼              ▼
Express API   WebSocket Server
    │              ▲
    ▼              │
Redis Queue    Redis Pub/Sub
    │              ▲
    ▼              │
 Worker ───────────┘
    │
    ▼
 Docker
    │
    ▼
PostgreSQL
```

---

# Current Status

Backend Core

- Authentication
- Authorization
- JWT
- Cookie Authentication
- Problem APIs
- Submission APIs
- Prisma ORM
- PostgreSQL

Distributed Processing

- Redis Queue
- Worker Service
- Docker Sandbox
- Multi-language Execution

Real-Time Communication

- Redis Pub/Sub
- Socket.IO
- Live Submission Updates

---

# Planned Features

Frontend

- React
- Tailwind CSS
- Monaco Editor
- Problem Workspace
- Submission Panel

Editor

- Auto Save
- Draft Recovery
- Code Reset
- Language Switching

Platform

- User Profiles
- Leaderboards
- Contest Mode
- Discussion Section
- Admin Dashboard

---

# Learning Objectives

This project was built to gain practical experience with:

- Backend Architecture
- Distributed Systems
- REST APIs
- Authentication
- Redis
- Queue-based Processing
- Pub/Sub Messaging
- WebSockets
- Docker
- Online Judge Design
- System Design
- Scalable Backend Development

---

# Project Status

🚧 Backend Platform Completed

The core backend architecture, asynchronous judging pipeline, and real-time communication layer are complete.

The remaining work focuses primarily on the React frontend, Monaco editor integration, and user interface.