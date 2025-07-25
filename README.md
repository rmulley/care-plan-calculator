# Care Plan Calculator

A simple golang web application that can be run locally or via Docker (preferred).

## Features

- **Vue.js Spreadsheet Interface**: Interactive 10x10 to 100x26 spreadsheet
- **Cell References**: Reference other cells using A1 notation
- **Formula Support**: Use `=` to start formulas (e.g., `=A1+B1`, `=(A1/A10)`)
- **Dynamic Resizing**: Add/remove rows and columns
- **CSV Export**: Download spreadsheet data as CSV file
- **Health check endpoint** at `/health`
- **Configurable port** via environment variable

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

## Development

### Prerequisites
- Go 1.24.5+
- Docker (preferred)