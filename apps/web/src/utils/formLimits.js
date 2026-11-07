// Límites de los formularios de la web, en un solo sitio.
// Deben coincidir con los esquemas Zod de la API (apps/api/src/routes/),
// que son la fuente de verdad del servidor: la web no puede importar
// código de la API (son workspaces y despliegues separados), así que si
// cambia un límite en Zod hay que actualizarlo aquí también.
export const FORM_LIMITS = {
  service: {
    name: { min: 2, max: 120 },
    description: { min: 10, max: 1000 },
    price: { min: 0, max: 99999999.99 },
  },
  category: {
    name: { min: 2, max: 80 },
  },
  inquiry: {
    name: { min: 2, max: 100 },
    email: { max: 254 },
    message: { min: 10, max: 1000 },
  },
  login: {
    username: { min: 3, max: 50 },
    password: { min: 6, max: 100 },
  },
};
