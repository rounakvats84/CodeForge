# CodeForge

A distributed online code execution engine built from scratch using Node.js.

This project is an educational implementation of the core architecture behind platforms like LeetCode and HackerRank. Instead of relying on external execution APIs, the execution pipeline is implemented manually.

---

## Current Features (Stage 1)

- Accepts C++ submissions
- Express API for code submission
- Redis Queue for asynchronous processing
- Dedicated Worker Service
- Dynamic temporary workspace creation
- Source code generation (`main.cpp`)
- Compilation using `g++`
- Program execution with custom stdin
- Captures stdout
- Output verification
- Time Limit Exceeded (TLE) protection
- Automatic cleanup of temporary files

---

## Current Architecture

Browser / Postman
        │
        ▼
Express Backend
        │
        ▼
Redis Queue
        │
        ▼
Worker
        │
        ▼
Compile (g++)
        │
        ▼
Execute Program
        │
        ▼
Compare Output
        │
        ▼
Accepted / Wrong Answer

---

## Tech Stack

- Node.js
- Express
- TypeScript
- Redis
- Child Processes (`spawn`)
- File System API
- C++

---

## Roadmap

- [x] Local Code Execution Engine
- [ ] Multiple Test Cases
- [ ] PostgreSQL Integration
- [ ] Docker Sandbox
- [ ] Multi-language Support
- [ ] React Frontend
- [ ] Authentication (JWT)
- [ ] WebSockets + Redis Pub/Sub
- [ ] Distributed Workers
- [ ] Deployment

---

## Motivation

The goal of this project is to understand how online coding platforms execute untrusted code safely and asynchronously.

Instead of using services like Judge0, the execution engine is implemented from scratch to better understand queues, workers, process management, Docker, and distributed backend architecture.