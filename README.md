# CodeForge

A scalable LeetCode-inspired Online Judge platform built using a distributed backend architecture.

CodeForge is designed to mimic how modern coding platforms execute and judge code securely using asynchronous processing, isolated Docker containers, Redis queues, Pub/Sub messaging, and WebSockets.

The project is built primarily to explore large-scale backend architecture, distributed systems, and online judge design rather than simply solving coding problems.

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
- Visible Test Cases
- Hidden Test Cases
- Language-specific execution templates

---

## Code Execution

Supports two execution modes.

### Run

- Executes only visible test cases
- Does not create a database submission
- Returns results instantly through WebSockets
- Used while solving the problem

### Submit

- Creates a submission record
- Executes visible + hidden test cases
- Stores execution history
- Publishes final verdict in real time

---

## Submission System

- Create submissions
- Run code
- View submission history
- View submission details
- Real-time verdict updates

Submission lifecycle

```text
QUEUED
    ↓
RUNNING
    ↓
COMPLETED
```

---

## Monaco Editor Backend

Dedicated backend service for editor persistence.

Features

- Auto Save
- Draft Recovery
- Language-specific editor state
- One editor state per user per problem
- Persistent code across sessions

Editor state is stored separately from submissions.

---

## Real-Time Updates

Submission progress is streamed instantly using Redis Pub/Sub and Socket.IO.

```text
Worker
      │
      ▼
Redis Pub/Sub
      │
      ▼
WebSocket Server
      │
      ▼
Browser
```

Users receive verdicts without refreshing the page.

---

## Multi-language Support

Currently supports

- C++
- Java
- Python

Each problem contains language-specific execution templates used by the worker to dynamically generate executable source code.

---

# Tech Stack

## Frontend

- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Monaco Editor

---

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
- HttpOnly Cookies
- bcrypt

---

## Queue

- Redis Lists

---

## Pub/Sub

- Redis Pub/Sub

---

## Real-Time Communication

- Socket.IO

---

## Code Execution

- Docker
- Isolated Containers

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
│   │   └── index.ts
│   │
│   └── prisma/
│
├── worker/
│   ├── src/
│   │   ├── config/
│   │   ├── services/
│   │   └── index.ts
│   │
│   ├── execution/
│   ├── runners/
│   └── runner-bundler/
│
├── websocket/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   └── index.ts
│
└── monacobd/
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── routes/
    │   └── index.ts
    │
    └── prisma/
```

---

# Distributed Architecture

## 1. API Server

Responsible for

- Authentication
- Problem APIs
- Run API
- Submit API
- Submission History
- Database Operations
- Queueing execution requests

---

## 2. Worker Service

Responsible for

- Consuming Redis Queue
- Loading problem templates
- Generating executable source code
- Compiling programs
- Running Docker containers
- Executing test cases
- Judging submissions
- Publishing results
- Updating database (Submit mode only)

---

## 3. WebSocket Server

Responsible for

- Authenticating Socket.IO connections
- Subscribing to Redis Pub/Sub
- Delivering live execution results
- Real-time submission tracking

---

## 4. Monaco Backend

Responsible for

- Saving editor drafts
- Loading editor state
- Auto-save endpoints
- Maintaining persistent editor sessions

---

# High Level Architecture

```text
                    +------------------+
                    |     React UI     |
                    +--------+---------+
                             |
           +-----------------+------------------+
           |                                    |
           ▼                                    ▼
      REST API                           Socket.IO
           |                                    ▲
           ▼                                    │
      API Server ---------------------- Redis Pub/Sub
           │                                    ▲
           │                                    │
           ▼                                    │
      Redis Queue                               │
           │                                    │
           ▼                                    │
      Worker Service ---------------------------┘
           │
           ▼
 Docker Containers
           │
           ▼
     PostgreSQL

           ▲
           │
    Monaco Backend
           │
           ▼
     EditorState Table
```

---

# Execution Pipeline

## Run

```text
Browser

↓

Run API

↓

Redis Queue

↓

Worker

↓

Visible Test Cases

↓

Redis Pub/Sub

↓

WebSocket

↓

Browser
```

---

## Submit

```text
Browser

↓

Submit API

↓

Create Submission

↓

Redis Queue

↓

Worker

↓

Visible + Hidden Test Cases

↓

Update Database

↓

Redis Pub/Sub

↓

WebSocket

↓

Browser
```

---

# Current Status

## Backend

- Authentication
- Authorization
- JWT
- Cookie Authentication
- Prisma ORM
- PostgreSQL
- Problem APIs
- Submission APIs
- Run API
- Editor Backend

---

## Distributed Services

- Redis Queue
- Worker Service
- Docker Sandbox
- Redis Pub/Sub
- Socket.IO
- Real-time Execution

---

## Editor

- Monaco Backend
- Auto Save API
- Draft Recovery
- Persistent Editor State

---

# Planned Features

Frontend

- Complete React Workspace
- Monaco Integration
- Split Panels
- Resizable Layout
- Submission Console

Platform

- User Profiles
- Leaderboards
- Contest Mode
- Discussion Section
- Admin Dashboard

Infrastructure

- CI/CD
- Production Deployment
- Horizontal Worker Scaling
- Rate Limiting
- Monitoring & Logging

---

# Learning Objectives

This project explores practical implementation of

- Distributed Systems
- Backend Architecture
- Online Judge Design
- REST APIs
- Authentication
- Redis Queues
- Pub/Sub Messaging
- WebSockets
- Docker
- Secure Code Execution
- Real-time Systems
- Scalable Backend Development

---

# Project Status

🚧 Active Development

## Backend

✅ Core backend architecture completed

✅ Distributed worker system completed

✅ Real-time execution pipeline completed

✅ Monaco editor backend completed

## In Progress

- React Frontend
- Monaco Integration
- Workspace UI
- Run & Submit UX
- Submission Console

Future work focuses on production deployment, CI/CD, monitoring, scaling workers, and additional platform features.