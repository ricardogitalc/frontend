import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/about", "/contact", "/"];
const authRoutes = ["/login", "/register", "/verify-login", "/verify-register"];
const protectedRoutes = ["/dashboard", "/profile", "/settings"];

async function validateToken(token: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    headers: {
      Cookie: `auth.accessToken=${token}`,
    },
    credentials: "include",
  });
  return response.ok;
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get("auth.accessToken")?.value;

  // Verificar autenticação para rotas protegidas
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token || !(await validateToken(token))) {
      const loginUrl = new URL("/login", request.url);
      // Preservar o parâmetro error se existir
      if (searchParams.has("error")) {
        loginUrl.searchParams.set("error", searchParams.get("error")!);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirecionar usuário autenticado das rotas de auth
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (token && (await validateToken(token))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [...publicRoutes, ...authRoutes, ...protectedRoutes],
};
