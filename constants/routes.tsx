// Define os tipos de rotas
export const RouteTypes = {
  AUTH: "auth",
  PROTECTED: "protected",
  PUBLIC: "public",
} as const;

// Interface para tipagem das rotas
interface RouteConfig {
  path: string;
  type: (typeof RouteTypes)[keyof typeof RouteTypes];
}

// Função auxiliar para criar configs de rota
const createRoute = (
  path: string,
  type: (typeof RouteTypes)[keyof typeof RouteTypes]
): RouteConfig => ({
  path,
  type,
});

// Definição das rotas por tipo
export const ROUTES = {
  // Rotas de autenticação (auth)
  AUTH: {
    LOGIN: createRoute("/login", RouteTypes.AUTH),
    REGISTER: createRoute("/register", RouteTypes.AUTH),
    VERIFY_LOGIN: createRoute("/verify-login", RouteTypes.AUTH),
    VERIFY_REGISTER: createRoute("/verify-register", RouteTypes.AUTH),
  },

  // Rotas protegidas (protected)
  PROTECTED: {
    DASHBOARD: createRoute("/dashboard", RouteTypes.PROTECTED),
    PROFILE: createRoute("/profile", RouteTypes.PROTECTED),
    DOWNLOADS: createRoute("/downloads", RouteTypes.PROTECTED),
    FAVORITES: createRoute("/favoritos", RouteTypes.PROTECTED),
    FOLLOWING: createRoute("/seguindo", RouteTypes.PROTECTED),
    SUBSCRIPTION: createRoute("/assinatura", RouteTypes.PROTECTED),
  },

  // Rotas públicas (public)
  PUBLIC: {
    HOME: createRoute("/", RouteTypes.PUBLIC),
    PLANS: createRoute("/planos", RouteTypes.PUBLIC),
  },
} as const;

// Função auxiliar para verificar o tipo da rota
export const getRouteType = (path: string): string | undefined => {
  // Remove query params e hash
  const cleanPath = path.split("?")[0].split("#")[0];

  // Procura a rota em todas as categorias
  for (const category of Object.values(ROUTES)) {
    for (const route of Object.values(category)) {
      if (cleanPath === route.path) {
        return route.type;
      }
    }
  }

  // Se não encontrar, assume que é uma rota pública
  return RouteTypes.PUBLIC;
};

// Lista de todas as rotas por tipo
export const AUTH_ROUTES = Object.values(ROUTES.AUTH).map(
  (route) => route.path
);
export const PROTECTED_ROUTES = Object.values(ROUTES.PROTECTED).map(
  (route) => route.path
);
export const PUBLIC_ROUTES = Object.values(ROUTES.PUBLIC).map(
  (route) => route.path
);
