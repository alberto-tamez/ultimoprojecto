# Use the official NGINX image as base
FROM nginx:1.23-alpine

# Remove default NGINX configs
RUN rm -f /etc/nginx/conf.d/*

# Copy custom configuration files
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/
COPY sites-available/ /etc/nginx/sites-available/

# Create symlink for enabled sites
RUN mkdir -p /etc/nginx/sites-enabled/ && \
    ln -s /etc/nginx/sites-available/application.conf /etc/nginx/sites-enabled/

# Create SSL directory (certificates should be mounted here)
RUN mkdir -p /etc/nginx/ssl

# Create directory for Next.js static files
RUN mkdir -p /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Expose ports
EXPOSE 80
EXPOSE 443

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
