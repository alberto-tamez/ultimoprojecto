
# 🌱 Sistema de Recomendación de Cultivos con IA

## 📘 Resumen del Proyecto

**Nombre:** Crop Recommendation   
**Equipo:** Benjamin Cruz, Alberto Tamez, Bernardo Limón

**Objetivo:**  
Recomendar el cultivo más adecuado para un terreno específico utilizando un modelo de inteligencia artificial, considerando variables químicas y climáticas como nitrógeno, fósforo, potasio, pH, temperatura, humedad y lluvia.

---

## 🧱 Arquitectura del Sistema

### Componentes Principales:
- **Frontend (2 instancias):** Interfaces de usuario web.
- **Load Balancer (NGINX):** Redirección de IP pública hacia servicios internos.
- **Backend (FastAPI):** Lógica de negocio y API REST.
- **Base de Datos (PostgreSQL):** Almacenamiento de usuarios, roles y logs.
- **Servidor de IA (con GPU):** Hospeda y ejecuta el modelo entrenado.
- **Autenticación (WorkOS):** Gestión de sesiones y roles.

### Diagrama Simplificado:
```
Usuario ↔ Frontend ↔ NGINX ↔ Backend ↔ API Modelo IA ↔ Servidor GPU
                                   ↘︎↘︎↘︎
                               PostgreSQL
```

---

## 🧠 Inteligencia Artificial

### Dataset:
- Variables utilizadas: N, P, K, temperatura, humedad, pH, lluvia.
- División: 80% para entrenamiento, 20% para validación.

### Modelos Entrenados:
- **MLP1**, **MLP2**, **MLP3** (Redes Neuronales Multicapa)
- Optimización: **Adam**
- Métricas: Precisión y pérdida
- Se eligió el modelo con mejor desempeño en validación.

---

## 🛠️ Backend

**Framework:** FastAPI  
**Características:**
- API REST para predicciones y administración.
- Validación de datos de entrada.
- Integración con WorkOS.
- Manejo de logs.

### Endpoints Principales:
- `POST /predict`: Recomienda un cultivo según datos ingresados.
- `POST /login`: Autenticación de usuario.
- `GET /logs`: Accesible solo para admins.

---

## 🌐 Frontend

**Framework:** (Ej. React)  
**Características:**
- Autenticación WorkOS.
- Formulario para ingreso de datos.
- Visualización de recomendaciones.
- Control de acceso según rol (usuario/admin).

---

## 🔐 Seguridad

- Autenticación segura con **WorkOS**.
- Tokens de refresco gestionados en el backend.
- Roles diferenciados: usuario y administrador.
- Solo el Load Balancer está expuesto públicamente.
- Conexión entre servicios a través de red interna segura.
- Acceso restringido a servidores vía SSH.
- Validación robusta de entradas.
- Base de datos no expuesta públicamente.

---

## 🚀 Deployment

- **NGINX** como Load Balancer.
- Backend y PostgreSQL corren en red interna.
- Servidor GPU dedicado al modelo de IA.
- Scripts o contenedores recomendados para despliegue automatizado.

---

## 🧪 Pruebas

- Evaluación de modelos con conjunto de validación.
- Pruebas manuales de interfaces y autenticación.
- Verificación de integración backend ↔ IA por API.

---

## 👥 Colaboración

- Uso de **Git** con ramas por funcionalidades.
- Pull Requests con revisiones y documentación de cambios.
- Integración continua sugerida para futuro mantenimiento.

---

## ⚙️ Retos Técnicos Superados

- Exposición segura de servicios internos a internet.
- Implementación completa de autenticación externa con roles.
- Configuración avanzada de NGINX como balanceador.
- Integración robusta entre FastAPI y servidor con IA.
- Desarrollo ágil y colaborativo en solo 120 horas-hombre.

---

## 📄 Licencia y Créditos

**Licencia:** [Especificar tipo de licencia, ej. MIT, Apache 2.0, etc.]

**Autores:**
- Benjamin Cruz
- Alberto Tamez
- Bernardo Limón

---
