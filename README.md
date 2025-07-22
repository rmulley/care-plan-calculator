# Care Plan Calculator

A simple Go web application that can be run locally or via Docker.

## Features

- **Vue.js Spreadsheet Interface**: Interactive 10x10 to 100x26 spreadsheet
- **Formula Support**: Enter values or formulas (e.g., =A1+B1, =SUM(A1:A10))
- **Dynamic Resizing**: Add/remove rows and columns
- **Cell Navigation**: Keyboard arrow keys for navigation
- **Data Export**: Export to CSV format
- **Health check endpoint** at `/health`
- **Configurable port** via environment variable
- **Docker support** with multi-stage build
- **Non-root user** for security

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

- `GET /` - Vue.js spreadsheet interface
- `GET /health` - Health check endpoint (returns JSON)
- `GET /index.html` - Main HTML file
- `GET /app.js` - Vue.js application logic

## Spreadsheet Features

### Basic Operations
- **Cell Input**: Click any cell to enter values or formulas
- **Formula Support**: Use `=` to start formulas (e.g., `=A1+B1`, `=SUM(A1:A10)`)
- **Mathematical Functions**: `SUM()`, `AVERAGE()` supported
- **Cell References**: Reference other cells using A1 notation

### Navigation
- **Mouse**: Click to select cells
- **Keyboard**: Use arrow keys to navigate between cells
- **Formula Bar**: Shows and edits the current cell's formula

### Spreadsheet Management
- **Add Rows**: Increase up to 100 rows
- **Add Columns**: Increase up to 26 columns (A-Z)
- **Delete Rows/Columns**: Remove one at a time
- **Clear All**: Reset the entire spreadsheet

### Data Export
- **CSV Export**: Download spreadsheet data as CSV file
- **Formula Preservation**: Exports calculated values

## Security Features

- Non-root user in Docker container
- Minimal Alpine Linux base image
- Multi-stage build for smaller image size
- Health checks for container monitoring