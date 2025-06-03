# FastAPI Backend with PostgreSQL Authentication

This is a FastAPI backend application with JWT authentication and PostgreSQL database integration.

## Features
### Esto vamos a cambiarlo ligeramente, el auth con WorkOS, y ya practicamente es todo lo que cambiaremos de estos features
- User registration and authentication with JWT
- Password hashing using bcrypt
- SQLAlchemy ORM for database operations
- Environment variable configuration
- CORS middleware enabled
- Pydantic data validation

## Prerequisites

- Python 3.8+
- PostgreSQL database
- pip (Python package manager)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd back
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Copy the `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your PostgreSQL credentials:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/fastapi_auth
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. **Initialize the database**
   Make sure PostgreSQL is running, then run:
   ```bash
   python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"
   ```

## Running the Application

Start the FastAPI development server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

- Interactive API documentation: `http://localhost:8000/docs`
- Alternative documentation: `http://localhost:8000/redoc`

## API Endpoints

### Authentication

- `POST /token` - Get access token (login)
  ```json
  {
    "email": "user@example.com",
    "password": "string"
  }
  ```

### Users

- `POST /users/` - Create a new user
  ```json
  {
    "email": "user@example.com",
    "password": "string",
    "full_name": "string"
  }
  ```

- `GET /users/me/` - Get current user details (requires authentication)

## Project Structure

```
back/
├── .env                    # Environment variables
├── requirements.txt        # Project dependencies
├── main.py                # FastAPI application
├── config.py              # Configuration settings
├── database.py            # Database connection
├── models.py              # SQLAlchemy models
├── schemas.py             # Pydantic models
├── crud.py                # Database operations
└── auth.py                # Authentication utilities
```

## Development

### Code Style

This project follows PEP 8 style guidelines. You can check your code with:

```bash
flake8 .
```

### Testing

To run tests:

```bash
pytest
```

## Deployment

For production deployment, consider using:

- Gunicorn with Uvicorn workers
- Environment variables for configuration
- A proper WSGI/ASGI server
- HTTPS with a valid certificate

## License

MIT