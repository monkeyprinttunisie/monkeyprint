import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware(routing);

// Combined middleware function
export default async function middleware(request: NextRequest) {
  // Get hostname (e.g. subdomain.monkeyprinttunisie.com)
  const hostname = request.headers.get("host") || "";
  const baseDomain =
    process.env.NEXT_PUBLIC_BASE_DOMAIN || "monkeyprinttunisie.com";

  // Add console logs for debugging
  console.log("Middleware triggered for hostname:", hostname);

  // Skip subdomain handling for API routes, static files, etc.
  if (
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname.startsWith("/_next/") ||
    request.nextUrl.pathname.includes(".")
  ) {
    console.log(
      "Skipping subdomain handling for special path:",
      request.nextUrl.pathname
    );
    return intlMiddleware(request);
  }

  if (
    hostname === baseDomain ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "localhost:3000" ||
    hostname === "127.0.0.1:3000"
  ) {
    console.log("Not a subdomain, applying intl middleware only");
    return intlMiddleware(request);
  }

  // We have a subdomain! Extract it
  let subdomain = "";
  if (hostname.includes(".localhost")) {
    subdomain = hostname.split(".localhost")[0];
  } else if (hostname.includes(`.${baseDomain}`)) {
    subdomain = hostname.split(`.${baseDomain}`)[0];
  } else {
    // Fallback to simple splitting (less reliable)
    subdomain = hostname.split(".")[0];
  }

  console.log("Extracted subdomain:", subdomain);

  // Lookup store by URL
  try {
    const protocol = request.nextUrl.protocol;
    const host = hostname;

    const lookupUrl = `${protocol}//${host}/api/lookup-store?url=${subdomain}`;
    console.log("Looking up store at:", lookupUrl);

    const response = await fetch(lookupUrl, { method: "GET" });

    if (!response.ok) {
      console.error("API response not OK:", response.status);
      throw new Error(`API response not ok: ${response.status}`);
    }

    const data = await response.json();
    console.log("Store lookup response:", data);

    if (!data.store) {
      console.log("No store found for subdomain:", subdomain);
      const response = intlMiddleware(request);
      if (response instanceof NextResponse) {
        return NextResponse.rewrite(
          new URL(`/${request.nextUrl.locale || "en"}/404`, request.url)
        );
      }
      return response;
    }

    // Determine current path segments
    const path = request.nextUrl.pathname;
    const locale =
      path.startsWith("/en") || path.startsWith("/fr")
        ? path.split("/")[1]
        : "en";

    // Create a new request for the store page
    const storePageUrl = `/${locale}/store/${data.store.url}${path.replace(`/${locale}`, "")}`;
    console.log("Rewriting to store page:", storePageUrl);

    const storeUrl = new URL(storePageUrl, request.url);

    // Apply the i18n middleware
    return intlMiddleware(new NextRequest(storeUrl, request));
  } catch (error) {
    console.error("Error in subdomain middleware:", error);
    return intlMiddleware(request);
  }
}

// Matcher configuration to handle both internationalized pathnames and subdomains
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
