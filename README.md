# Care Plan Calculator

A simple Go web application that can be run locally or via Docker.

## Features

- Simple HTTP server with a beautiful web interface
- Health check endpoint at `/health`
- Configurable port via environment variable
- Docker support with multi-stage build
- Non-root user for security

## Quick Start

### Running with Docker

1. Build the Docker image:
   ```bash
   docker build -t care-plan-calculator .
   ```

2. Run the container:
   ```bash
   docker run -p 8080:8080 care-plan-calculator
   ```

3. Access the application:
   - Web interface: http://localhost:8080
   - Health check: http://localhost:8080/health

### Running Locally

1. Make sure you have Go 1.21+ installed
2. Run the application:
   ```bash
   go run main.go
   ```

3. Access the application at http://localhost:8080

## Environment Variables

- `PORT`: Port to run the server on (default: 8080)

## Docker Commands

### Build and run in one command:
```bash
docker run -p 8080:8080 $(docker build -q .)
```

### Run with custom port:
```bash
docker run -p 3000:3000 -e PORT=3000 care-plan-calculator
```

### Run in detached mode:
```bash
docker run -d -p 8080:8080 --name care-calc care-plan-calculator
```

## Development

### Prerequisites
- Go 1.24.5+
- Docker (optional)

### Local Development
```bash
# Initialize Go module (if needed)
go mod init github.com/rmulley/care-plan-calculator

# Run the application
go run main.go

# Build the binary
go build -o care-calculator main.go
```

### Testing the Docker Build
```bash
# Build the image (uses Go 1.24.5 with Alpine 3.22)
docker build -t care-plan-calculator .

# Check the image size
docker images care-plan-calculator

# Run with health check
docker run -p 8080:8080 care-plan-calculator
```

## Project Structure

```
care-plan-calculator/
├── main.go          # Main application code
├── go.mod           # Go module definition
├── Dockerfile       # Multi-stage Docker build
├── .dockerignore    # Docker build exclusions
└── README.md        # This file
```

## API Endpoints

- `GET /` - Main web interface
- `GET /health` - Health check endpoint (returns JSON)

## Security Features

- Non-root user in Docker container
- Minimal Alpine Linux base image
- Multi-stage build for smaller image size
- Health checks for container monitoring