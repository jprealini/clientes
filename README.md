# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

# Administración de Clientes

Aplicación web para gestionar clientes, agenda de llamados, pedidos, compras y pagos.

## Despliegue en Render

1. Sube el proyecto a un repositorio (GitHub, GitLab, etc).
2. En Render, crea un nuevo servicio de tipo "Static Site".
3. Usa la URL de tu repositorio.
4. Configura:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
5. Agrega las variables de entorno en Render:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_KEY`
6. Haz deploy y accede a la URL pública que Render te proporciona.

## Variables de entorno

Crea un archivo `.env` en la raíz con:

```
VITE_SUPABASE_URL=https://btvzhdvlviipnyevxrwa.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dnpoZHZsdmlpcG55ZXZ4cndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjc1MDgsImV4cCI6MjA3MTcwMzUwOH0.JjamX6XBLizR4Pc7uP3JGfxnoaYFZqvWV8a2bwx7DLw
```

## Scripts

- `npm run dev` para desarrollo local
- `npm run build` para producción
- `npm run preview` para previsualizar el build
