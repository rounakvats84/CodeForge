FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
    g++ \
    python3 \
    openjdk-21-jdk \
    && apt-get clean

WORKDIR /workspace