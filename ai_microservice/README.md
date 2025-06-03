# AI Microservice

A FastAPI-based microservice for neural network operations, designed to run in the private cloud infrastructure of Tec de Monterrey. This service includes basic authentication and validation functionality.

## Features

- 🚀 FastAPI for high-performance API endpoints
- 🐳 Docker and Docker Compose support
- 🔒 JWT Authentication
- ✅ Health check endpoint
- 📊 Structured logging
- 🔄 CORS support
- 🧪 Test-ready structure

## Prerequisites

- Python 3.8+
- Docker and Docker Compose (for containerized deployment)
- pip (Python package manager)

## Getting Started

### Local Development

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd ai_microservice
   ```

2. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the development server**
   ```bash
   uvicorn main:app --reload
   ```

5. **Access the API**
   - API documentation: http://localhost:8000/docs
   - Health check: http://localhost:8000/health

### Using Docker

1. **Build and start the service**
   ```bash
   docker-compose up --build
   ```

2. **Access the API**
   - API documentation: http://localhost:8000/docs
   - Health check: http://localhost:8000/health

## API Endpoints

- `GET /`: Service information
- `GET /health`: Health check
- `POST /process`: Process input with neural network
- `POST /token`: Get authentication token

### Authentication

1. First, get an access token:
   ```bash
   curl -X POST "http://localhost:8000/token" \
     -H "Content-Type: application/json" \
     -d '{"username": "user", "password": "password"}'
   ```

2. Use the token in subsequent requests:
   ```bash
   curl -X POST "http://localhost:8000/process" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"text": "Sample input"}'
   ```

### Example Request

```bash
curl -X POST "http://localhost:8000/process" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"text": "Hello, world!"}'
```

### Example Response

```json
{
  "result": "Processed: HELLO, WORLD!",
  "metadata": {
    "model": "example_model",
    "parameters": {}
  }
}
```

## Configuration

Edit the `.env` file to configure the service:

```env
# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Application Settings
APP_NAME="AI Microservice"
APP_VERSION="0.1.0"
APP_DESCRIPTION="FastAPI microservice for neural network operations"

# Authentication
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (comma-separated list of origins, or * for all)
CORS_ORIGINS="*"
```

## Development

### Project Structure

```
ai_microservice/
├── .env                    # Environment variables
├── main.py                # Main FastAPI application
├── config.py              # Configuration settings
├── requirements.txt       # Python dependencies
├── Dockerfile             # Container definition
└── docker-compose.yml     # Docker Compose configuration
```

### Running Tests

```bash
pytest
```

## Deployment

### Building the Docker Image

```bash
docker build -t ai-microservice .
```

### Running in Production

For production, set `DEBUG=False` in the `.env` file and use a production WSGI server like Gunicorn:

```bash
gunicorn -k uvicorn.workers.UvicornWorker -w 4 -b :8000 main:app
```

## Private Cloud Integration

This service is designed to be deployed in the Tec de Monterrey private cloud environment. The Docker Compose configuration includes placeholders for network settings that should be configured according to the cloud provider's specifications.

## License

MIT