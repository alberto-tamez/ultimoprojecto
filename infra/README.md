# NGINX Load Balancer with FastAPI Backend

This directory contains the infrastructure configuration for a production-ready load balancer setup using NGINX, designed to serve a Next.js frontend and load balance traffic across multiple FastAPI backend instances.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Internet                                     │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        NGINX Load Balancer                          │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  HTTP (80)    │  │  HTTPS (443)    │  │  SSL Termination  │  │
│  │  → HTTPS      │  │  → Backend      │  │  + HTTP/2        │  │
│  └───────────────┘  └────────────────┘  └──────────────────┘  │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌───────────────────────┐   ┌───────────────────────┐
│  FastAPI Backend 1    │   │  FastAPI Backend 2    │
│  (Container)          │   │  (Container)          │
└───────────────────────┘   └───────────────────────┘
                ▲                       ▲
                └───────────┬───────────┘
                            │
                    ┌───────┴───────┐
                    │  PostgreSQL   │
                    │  (Container)  │
                    └───────────────┘
```

## Features

- **HTTPS Termination**: Automatic HTTP to HTTPS redirection
- **Load Balancing**: Round-robin distribution across multiple backend instances
- **Performance**: HTTP/2, Gzip compression, and caching
- **Security**: Modern SSL/TLS configuration, security headers, and rate limiting
- **Scalability**: Easy to add more backend instances
- **Monitoring**: Built-in health checks and metrics endpoints

## Directory Structure

```
infra/
├── nginx/                     # NGINX configuration
│   ├── conf.d/                # Additional NGINX configs
│   │   └── load-balancer.conf  # Load balancer and SSL settings
│   ├── sites-available/       # Available site configurations
│   │   └── application.conf   # Main application configuration
│   ├── nginx.conf             # Main NGINX configuration
│   └── Dockerfile             # NGINX container definition
├── docker-compose.yml         # Docker Compose for all services
└── README.md                  # This file
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- SSL certificates (or use Let's Encrypt)
- Next.js frontend build in `../frontend/.next`

### Configuration

1. **SSL Certificates**: Place your SSL certificates in `nginx/ssl/`:
   - `fullchain.pem`: Certificate chain
   - `privkey.pem`: Private key

2. **Environment Variables**: Update `.env` files as needed

3. **Backend Configuration**: Ensure your FastAPI backend is configured to use the database URL from environment variables

### Running the Stack

1. Build and start all services:
   ```bash
   docker-compose up -d --build
   ```

2. Check the logs:
   ```bash
   docker-compose logs -f
   ```

3. Access the application:
   - Frontend: `https://yourdomain.com`
   - API: `https://yourdomain.com/api/`
   - Health check: `https://yourdomain.com/health`

## Load Balancing

The NGINX load balancer uses a round-robin algorithm by default. You can modify this in `nginx/conf.d/load-balancer.conf`.

### Backend Health Checks

NGINX automatically monitors backend health. Unhealthy backends are temporarily removed from the pool.

## Monitoring (Optional)

Uncomment the Prometheus and Grafana services in `docker-compose.yml` for monitoring.

## Security

- All HTTP traffic is redirected to HTTPS
- Modern TLS 1.2/1.3 with strong ciphers
- Security headers (HSTS, CSP, X-Frame-Options, etc.)
- Rate limiting (commented out by default)

## Scaling

To add more backend instances:

1. Add new services to `docker-compose.yml`
2. Update the `upstream` block in `nginx/conf.d/load-balancer.conf`
3. Redeploy the stack

## Troubleshooting

Check the logs:
```bash
docker-compose logs nginx
docker-compose logs backend1
# etc.
```

## License

MIT