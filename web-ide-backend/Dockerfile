FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Lumen (Mock)
RUN mkdir -p /usr/local/bin
COPY ./lumen /usr/local/bin/lumen
RUN chmod +x /usr/local/bin/lumen

# Security: Run as non-root
RUN useradd -m lumen
USER lumen
WORKDIR /home/lumen

CMD ["lumen", "shell"]
