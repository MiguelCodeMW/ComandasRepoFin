# Comandas-fron

**Comandas-fron** es una aplicación web desarrollada con React, TypeScript y Vite, diseñada para gestionar operaciones en restaurantes. Permite a los empleados administrar pedidos (comandas), productos, categorías, mesas y configuraciones del sistema a través de una interfaz intuitiva y eficiente.

## 🧩 Características Principales

- **Gestión de Pedidos**: Crear, visualizar y procesar comandas de clientes.
- **Administración de Productos**: Añadir, editar y eliminar productos del menú.
- **Organización por Categorías**: Clasificar productos en categorías para una mejor organización.
- **Control de Mesas**: Supervisar el estado y asignación de las mesas del restaurante.
- **Autenticación Segura**: Acceso protegido mediante autenticación basada en tokens.
- **Configuración del Sistema**: Ajustes de impuestos (IVA) y moneda según las necesidades del negocio.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19, TypeScript
- **Bundler**: Vite
- **Control de Calidad**: ESLint con reglas específicas para React
- **Ruteo**: React Router con rutas públicas y privadas
- **Gestión de Estado**: Context API y hooks personalizados
- **Estilos**: CSS Modules y estilos globales

## 🧱 Estructura del Proyecto

```
├── public/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   │   ├── Button/
│   │   ├── Categoria/
│   │   ├── Comanda/
│   │   ├── Dashboard/
│   │   ├── ErrorMessage/
│   │   ├── LoadingSpinner/
│   │   ├── Mesa/
│   │   ├── Producto/
│   │   └── User/
│   ├── Constants/
│   │   ├── routes.tsx
│   │   └── text.tsx
│   ├── hooks/
│   ├── styles/
│   ├── types/
│   │   ├── ButtonTypes.tsx
│   │   ├── CategoriaTypes.tsx
│   │   ├── ComandaTypes.tsx
│   │   ├── CommonTypes.tsx
│   │   ├── ConfigTypes.tsx
│   │   ├── DashboardTypes.tsx
│   │   ├── RegisterTypes.tsx
│   │   ├── RoleTypes.tsx
│   │   └── UserTypes.tsx
│   ├── utils/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── .eslintrc.cjs
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## 🚀 Instalación y Ejecución

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/MiguelCodeMW/Comandas-fron.git
   cd Comandas-fron
   ```

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**

   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`.

## 🔐 Autenticación y Seguridad

- **Protección de Rutas**: Implementada mediante el componente `PrivateRoute`, que verifica la presencia de un token válido en `localStorage` antes de permitir el acceso a rutas protegidas.
- **Gestión de Sesiones**: Almacén de tokens y datos de usuario en `localStorage` para mantener la sesión activa.
- **Roles de Usuario**: Control de acceso basado en roles para diferentes funcionalidades del sistema.

## 📚 Documentación Adicional

Para una visión más detallada de la arquitectura y funcionalidades del proyecto, puedes consultar la documentación interactiva generada por DeepWiki:

👉 [DeepWiki - Comandas-fron Overview](https://deepwiki.com/MiguelCodeMW/Comandas-fron/1-overview)

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si deseas colaborar, por favor sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama con tu funcionalidad: `git checkout -b feature/nueva-funcionalidad`.
3. Realiza tus cambios y haz commits descriptivos.
4. Envía un pull request detallando los cambios realizados.

## 📄 Licencia

Este proyecto está licenciado bajo la [MIT License](LICENSE).
