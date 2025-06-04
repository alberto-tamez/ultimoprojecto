# CSV Analysis Microservice

A FastAPI-based microservice that analyzes CSV files using a neural network. The service provides a single endpoint that accepts a CSV file and returns predictions from a trained model.

## Features

- 🚀 Single endpoint for CSV file analysis
- 🧠 Simple neural network model for predictions
- 🐳 Docker and Docker Compose support
- ✅ Health check endpoint
- 🔄 CORS support
- 📊 Built with FastAPI for high performance

## Prerequisites

- Python 3.8+
- Docker and Docker Compose (for containerized deployment)
- pip (Python package manager)

## Getting Started

### Local Development

1. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the development server**
   ```bash
   uvicorn main:app --reload
   ```

4. **Access the API**
   - Interactive API documentation: http://localhost:8000/docs
   - Alternative documentation: http://localhost:8000/redoc
   - Health check: http://localhost:8000/health

### Using Docker

1. **Build and start the service**
   ```bash
   docker-compose up --build
   ```

   Or directly with Docker:
   ```bash
   docker build -t csv-analyzer .
   docker run -p 8000:8000 csv-analyzer
   ```

2. **Access the API**
   - Interactive API documentation: http://localhost:8000/docs
   - Alternative documentation: http://localhost:8000/redoc
   - Health check: http://localhost:8000/health

## API Endpoints

### Analyze CSV

- **URL**: `POST /analyze-csv`
- **Content-Type**: `multipart/form-data`
- **Request Body**: 
  - `file`: The CSV file to analyze (required)
  - The last column should be the target variable
  - All other columns will be treated as features

#### Example Request

```bash
curl -X 'POST' \
  'http://localhost:8000/analyze-csv' \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@sample_data.csv;type=text/csv'
```

#### Example Response

```json
{
  "predictions": [0.12, 0.89, 0.23, 0.91, 0.15, 0.87, 0.21, 0.94, 0.18, 0.89],
  "metadata": {
    "samples_processed": 10,
    "features_used": 3,
    "model_type": "MLPClassifier"
  }
}
```

### Health Check

- **URL**: `GET /health`
- **Response**: `{"status": "healthy"}`

## Sample Data

A sample CSV file (`sample_data.csv`) is provided for testing. The format should be:

```csv
feature1,feature2,feature3,target
1.2,3.4,5.6,0
2.1,4.3,1.2,1
...
```

- The last column should be the target variable (0 or 1 for binary classification)
- All other columns will be treated as features
- The first row should contain headers

## Configuration

Edit the `.env` file to configure the service:

```env
# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Application Settings
APP_NAME="CSV Analysis Service"
APP_VERSION="1.0.0"

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
├── docker-compose.yml     # Docker Compose configuration
└── sample_data.csv        # Sample CSV data for testing
```

### Running Tests

```bash
uv run pytest
```

## Deployment

### Building the Docker Image

```bash
docker build -t csv-analyzer .
```

### Running in Production

For production, set `DEBUG=False` in the `.env` file and use a production WSGI server like Gunicorn:

```bash
gunicorn -k uvicorn.workers.UvicornWorker -w 4 -b :8000 main:app
```

### Using Docker Compose

```bash
docker-compose up --build
```

## License

MIT