
# 🚀 Instalación y Ejecución Local

Sigue estos pasos para levantar desde cero todos los componentes en tu máquina local: **GPU API**, **Backend**, **Frontend** y **NGINX**.

### Prerrequisitos

- Git
- Node.js v16+ y npm o Yarn
- Python 3.8+
- PostgreSQL 13+ (instalado y corriendo localmente)
- NGINX (instalado localmente)
- Herramientas de desarrollo para generar certificados SSL (ej. OpenSSL)

### 1. Clonar el repositorio

```bash
git clone https://github.com/alberto-tamez/ultimoprojecto.git
cd ultimoprojecto
```

### 2. Configuración del Entorno

Crea un archivo `.env` en el directorio raíz del proyecto con las siguientes variables:

```env
# Backend
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fastapi_auth
SECRET_KEY=una_llave_secreta_muy_segura_y_larga_aqui

# WorkOS (configuración para desarrollo local)
WORKOS_API_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WORKOS_CLIENT_ID=client_xxxxxxxxxxxxxxxxxxxxxx
WORKOS_COOKIE_PASSWORD=un_password_para_cookie_muy_seguro_y_largo
WORKOS_REDIRECT_URI=https://localhost/callback
WORKOS_AUTH_DOMAIN=

# Frontend
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_WORKOS_CLIENT_ID=client_xxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_WORKOS_REDIRECT_URI=https://localhost/callback

# GPU API
MODEL_PATH=./models/best_model.pt
CUDA_VISIBLE_DEVICES=0  # Usar GPU 0, o '' para CPU
```
**Nota:** El archivo `.env` es para configuraciones locales y no debe subirse a repositorios públicos.

### 3. Iniciar el servicio GPU API

```bash
cd gpu_api

# Crear y activar entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install --upgrade pip
pip install -r requirements.txt

# Descargar el modelo pre-entrenado (reemplaza con la URL real)
# mkdir -p models
# wget -O models/best_model.pt YOUR_MODEL_DOWNLOAD_URL_HERE
# Asegúrate que el archivo 'best_model.pt' exista en la carpeta 'models'

# Iniciar el servidor (con o sin soporte GPU según CUDA_VISIBLE_DEVICES)
echo "Iniciando GPU API en http://localhost:1337"
uvicorn main:app --host 0.0.0.0 --port 1337 --reload
```

### 4. Configurar y ejecutar el Backend

```bash
cd ../back # Regresar al directorio raíz y luego a 'back'

# Crear y activar entorno virtual
python -m venv venv
source venv/bin/activate # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install --upgrade pip
pip install -r requirements.txt

# Asegúrate que tu base de datos PostgreSQL ('fastapi_auth') exista
# y que el servidor PostgreSQL esté corriendo.

# Aplicar migraciones de la base de datos (usando Alembic)
alembic upgrade head

# (Opcional) Inicializar datos base si tienes un script para ello
# python -m database.init_db 

# Iniciar el servidor de desarrollo del backend
echo "Iniciando Backend API en http://localhost:9000"
uvicorn app.main:app --host 0.0.0.0 --port 9000 --reload
```

### 5. Configurar y construir el Frontend

```bash
 # Volver al directorio raíz y entrar en 'front'
cd ../front

# Instalar dependencias
npm install

# Para desarrollo local con NGINX, generalmente se construyen los archivos estáticos que NGINX servirá, o se configura NGINX como proxy al servidor de desarrollo de Next.js.
# La configuración de NGINX provista asume que Next.js se ejecuta en modo desarrollo (`npm run dev`).

# Iniciar el servidor de desarrollo del Frontend (NGINX hará proxy a este)
echo "Iniciando Frontend en http://localhost:3000 (instancia 1) y http://localhost:3001 (instancia 2)"
# Para ejecutar dos instancias, necesitarás modificar el puerto en una de ellas o ejecutarlas en terminales separadas.
# Ejemplo para la primera instancia:
npm run dev # Por defecto usa el puerto 3000

# En otra terminal, para la segunda instancia (si es necesario y si está configurado en NGINX):
# NEXT_PORT=3001 npm run dev # O similar, según la configuración de Next.js
```
**Nota:** La configuración de NGINX provista usa un `upstream` con dos instancias (`localhost:3000` y `localhost:3001`). Para desarrollo local, puedes simplificarlo a una sola instancia si lo prefieres, ajustando tanto el `npm run dev` como la configuración de NGINX.

### 6. Configurar NGINX (para desarrollo local)

1.  **Instalar NGINX**: Si aún no lo tienes.
    ```bash
    # En Ubuntu/Debian
    sudo apt update && sudo apt install nginx
    ```
2.  **Generar Certificados SSL Autofirmados** (para `https://localhost`):
    ```bash
    sudo mkdir -p /etc/nginx/ssl
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/selfsigned.key -out /etc/nginx/ssl/selfsigned.crt
    # Asegúrate de ingresar 'localhost' como Common Name (CN) cuando se te pregunte.
    ```
3.  **Crear Configuración de NGINX**:
    Crea un archivo en `/etc/nginx/sites-available/ultimoprojecto-local` (o el nombre que prefieras):
    ```nginx
    # Define el grupo de servidores web (front-end) para balanceo de carga
    # Para desarrollo local, puedes usar una sola instancia si prefieres.
    upstream frontend_servers {
        server localhost:3000; # Primera instancia del frontend (Next.js dev server)
        # server localhost:3001; # Segunda instancia, si la estás corriendo
    }

    server {
        listen 443 ssl http2;
        server_name localhost;

        access_log /var/log/nginx/ultimoprojecto_access.log;
        error_log /var/log/nginx/ultimoprojecto_error.log;

        ssl_certificate /etc/nginx/ssl/selfsigned.crt;
        ssl_certificate_key /etc/nginx/ssl/selfsigned.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            proxy_pass http://frontend_servers;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade'; # Para WebSockets (ej. HMR de Next.js)
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/ {
            proxy_pass http://localhost:8000; # Backend API
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```
4.  **Habilitar el Sitio y Recargar NGINX**:
    ```bash
    sudo ln -s /etc/nginx/sites-available/ultimoprojecto-local /etc/nginx/sites-enabled/
    # Podrías necesitar remover el sitio por defecto: sudo rm /etc/nginx/sites-enabled/default
    sudo nginx -t  # Verificar la configuración
    sudo systemctl restart nginx
    ```

### 7. Configurar Servicios del Sistema (Opcional para Producción)

Para un despliegue en producción, querrás que tus aplicaciones (Backend, Frontend compilado, GPU API) se ejecuten como servicios. A continuación, ejemplos de archivos systemd. **Ajusta `User`, `WorkingDirectory`, y rutas `ExecStart` según tu sistema.**

1.  **Backend Service** (`/etc/systemd/system/backend.service`):
    ```ini
    [Unit]
    Description=UltimoProjecto Backend Service
    After=network.target postgresql.service

    [Service]
    User=tu_usuario_linux
    Group=tu_grupo_linux
    WorkingDirectory=/ruta/completa/a/ultimoprojecto/back
    Environment="PATH=/ruta/completa/a/ultimoprojecto/back/venv/bin"
    ExecStart=/ruta/completa/a/ultimoprojecto/back/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
    Restart=always
    RestartSec=3

    [Install]
    WantedBy=multi-user.target
    ```
2.  **Frontend Service** (sirviendo el build de Next.js) (`/etc/systemd/system/frontend.service`):
    ```ini
    [Unit]
    Description=UltimoProjecto Frontend Service (Next.js Build)
    After=network.target

    [Service]
    User=tu_usuario_linux
    Group=tu_grupo_linux
    WorkingDirectory=/ruta/completa/a/ultimoprojecto/front
    # Asegúrate que 'npm run build' se haya ejecutado
    ExecStart=/usr/bin/npm run start # Asume que 'start' en package.json ejecuta 'next start -p 3000'
    Restart=always
    RestartSec=3

    [Install]
    WantedBy=multi-user.target
    ```
    **Nota sobre Frontend Service**: NGINX podría servir directamente los archivos estáticos del frontend (`ultimoprojecto/front/.next/static` y `ultimoprojecto/front/public`) y usar `proxy_pass` a `next start` solo para las rutas dinámicas o SSR, si es una configuración más avanzada.

3.  **GPU API Service** (`/etc/systemd/system/gpu-api.service`):
    ```ini
    [Unit]
    Description=UltimoProjecto GPU API Service
    After=network.target

    [Service]
    User=tu_usuario_linux
    Group=tu_grupo_linux
    WorkingDirectory=/ruta/completa/a/ultimoprojecto/gpu_api
    Environment="PATH=/ruta/completa/a/ultimoprojecto/gpu_api/venv/bin"
    ExecStart=/ruta/completa/a/ultimoprojecto/gpu_api/venv/bin/uvicorn main:app --host 0.0.0.0 --port 1337
    Restart=always
    RestartSec=3

    [Install]
    WantedBy=multi-user.target
    ```
4.  **Habilitar e Iniciar Servicios**:
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable backend.service frontend.service gpu-api.service
    sudo systemctl start backend.service frontend.service gpu-api.service
    # Para ver logs: sudo journalctl -u backend.service -f
    ```

### 8. Acceso a los servicios locales

- **Frontend:** `https://localhost` (servido por NGINX desde `http://localhost:3000` o `http://localhost:3001`)
- **Backend API:** `https://localhost/api` (proxied por NGINX a `http://localhost:8000`)
- **Documentación API:** `https://localhost/api/docs` o `/redoc`
- **GPU API:** `http://localhost:1337/predict` (accesible directamente, no pasa por NGINX)

### 9. Configuración inicial

1.  Accede al frontend (`https://localhost`) y regístrate.
2.  Verifica si necesitas promover usuarios a administradores manualmente.

### Solución de problemas

- **Error de conexión a la base de datos:**
  - Verifica que PostgreSQL esté en ejecución: `sudo systemctl status postgresql`
  - Confirma que las credenciales en `.env` sean correctas y que la base de datos `fastapi_auth` exista
  - Verifica que el usuario de la base de datos tenga los permisos necesarios

- **Problemas con GPU:**
  - Asegúrate de tener los controladores NVIDIA y CUDA Toolkit instalados si `CUDA_VISIBLE_DEVICES` no está vacío
  - Verifica los logs de la GPU API: `journalctl -u gpu-api.service -f`
  - Prueba ejecutando `nvidia-smi` para verificar el estado de la GPU

- **Errores de autenticación WorkOS:**
  - Verifica que `WORKOS_CLIENT_ID` y `WORKOS_API_KEY` sean correctos
  - Asegúrate que `WORKOS_REDIRECT_URI` esté configurado como `https://localhost/callback`
  - Verifica que `WORKOS_COOKIE_PASSWORD` tenga un valor seguro
  - Revisa los logs del backend para mensajes de error específicos

- **Problemas con NGINX:**
  - Verifica la sintaxis: `sudo nginx -t`
  - Revisa los logs: `sudo journalctl -u nginx -f` o `tail -f /var/log/nginx/error.log`
  - Asegúrate que los puertos 80 y 443 no estén siendo usados por otros servicios
  - Verifica que los certificados SSL estén en las rutas correctas (`/etc/nginx/ssl/`)

- **Problemas con los servicios:**
  - Verifica el estado de los servicios:
    ```bash
    sudo systemctl status backend.service
    sudo systemctl status frontend.service
    sudo systemctl status gpu-api.service
    ```
  - Revisa los logs de los servicios:
    ```bash
    journalctl -u backend.service -f
    journalctl -u frontend.service -f
    ```

- **Problemas de redirección HTTPS:**
  - Asegúrate de acceder a la aplicación usando `https://localhost:443` (el puerto 443 es el predeterminado para HTTPS)
  - Si usas un puerto personalizado, asegúrate de incluirlo (ej: `https://localhost:8443`)
  - Los navegadores pueden mostrar advertencias de certificado autofirmado
  - En Chrome/Edge, haz clic en "Avanzado" y luego en "Continuar"
  - En Firefox, haz clic en "Aceptar el riesgo y continuar"

- **Permisos de archivos:**
  - Asegúrate que el usuario de NGINX (usualmente `www-data` o `nginx`) tenga acceso a:
    - Los certificados SSL en `/etc/nginx/ssl/`
    - Los directorios de logs en `/var/log/nginx/`
  - Verifica los permisos con `ls -la /ruta/al/directorio`

---
