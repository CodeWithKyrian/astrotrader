# Next.JS Integration Guide (Direct Copy)

**Source:** [Civic Docs - Next.JS](https://docs.civic.com/auth/integration/next.js)

---

## Quick Start

Integrate Civic Auth into your Next.js application using the following steps (a working example is available in our [github examples repo](https://github.com/civicteam/civic-auth-examples)).

**Important**: Make sure your application is using Next.js version ^14.2.25 or ^15.2.3 (or higher). Earlier versions are affected by a security vulnerability ([CVE-2025-29927](https://nvd.nist.gov/vuln/detail/CVE-2024-34351)) that may allow middleware to be bypassed.

This guide assumes you are using Typescript. Please adjust the snippets as needed to remove the types if you are using plain JS.

If you plan to use Web3 features, select "Auth + Web3" from the tabs below.

### 1. Add the Civic Auth Plugin

This is where you give your app the Client ID provided when you sign up at [auth.civic.com](https://auth.civic.com/).

The defaults should work out of the box for most customers, but if you want to configure your app, see [Advanced Configuration](#advanced-configuration) for details.

**Auth**

`next.config.ts`
```typescript
import { createCivicAuthPlugin } from "@civic/auth/nextjs"
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: "YOUR CLIENT ID"
});

export default withCivicAuth(nextConfig)
```

**Auth + Web3**

`next.config.ts`
```typescript
import { createCivicAuthPlugin } from "@civic/auth-web3/nextjs"
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: "YOUR CLIENT ID"
});

export default withCivicAuth(nextConfig)
```

If your config file is a JS file (`next.config.mjs`), make sure to change the extension to `.ts`, or remove the type information.

### 2. Create the Civic Auth API Route

This is where your app will handle login and logout requests.

Create this file at the following path:

`src/app/api/auth/[...civicauth]/route.ts`

**Auth**

`route.ts`
```typescript
import { handler } from "@civic/auth/nextjs"

export const GET = handler()
```

**Auth + Web3**

`route.ts`
```typescript
import { handler } from "@civic/auth-web3/nextjs"

export const GET = handler()
```

### 3. Middleware

Middleware is used to protect your backend routes, server components and server actions from unauthenticated requests.

Using the Civic Auth middleware ensures that only logged-in users have access to secure parts of your service.

**Auth**

`src/middleware.ts`
```typescript
import { authMiddleware } from "@civic/auth/nextjs/middleware"

export default authMiddleware();

export const config = {
  // include the paths you wish to secure here
  matcher: [
    /*
     * Match all request paths except:
     * - _next directory (Next.js static files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - image files
     */
    '/((?!_next|favicon.ico|sitemap.xml|robots.txt|.*\\.jpg|.*\\.png|.*\\.svg|.*\\.gif).*)',
  ],
}
```

**Auth + Web3**

`src/middleware.ts`
```typescript
import { authMiddleware } from "@civic/auth-web3/nextjs/middleware"

export default authMiddleware();

export const config = {
  // include the paths you wish to secure here
  matcher: [
    /*
     * Match all request paths except:
     * - _next directory (Next.js static files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - image files
     */
    '/((?!_next|favicon.ico|sitemap.xml|robots.txt|.*\\.jpg|.*\\.png|.*\\.svg|.*\\.gif).*)',
  ],
}
```

#### Middleware Chaining

If you are already using middleware in your Next.js app, then you can chain them with Civic Auth as follows:

**Auth**

`src/middleware.ts`
```typescript
import { auth } from "@civic/auth/nextjs"
import { NextRequest, NextResponse } from "next/server";

const withCivicAuth = auth();

const otherMiddleware = (request: NextRequest) => {
    console.log("my middleware");
    return NextResponse.next();
}

export default withCivicAuth(otherMiddleware);
```

**Auth + Web3**

`src/middleware.ts`
```typescript
import { auth } from "@civic/auth-web3/nextjs"
import { NextRequest, NextResponse } from "next/server";

const withCivicAuth = auth();

const otherMiddleware = (request: NextRequest) => {
    console.log("my middleware");
    return NextResponse.next();
}

export default withCivicAuth(otherMiddleware);
```

### 4. Frontend Integration

Add the Civic Auth context to your app to give your frontend access to the logged-in user.

**Auth**

```typescript
import { CivicAuthProvider } from "@civic/auth/nextjs";

function Layout({ children }) {
  return (
    // ... the rest of your app layout
    <CivicAuthProvider>
      {children}
    </CivicAuthProvider>
  )
}
```

**Auth + Web3**

```typescript
import { CivicAuthProvider } from "@civic/auth-web3/nextjs";

function Layout({ children }) {
  return (
    // ... the rest of your app layout
    <CivicAuthProvider>
      {children}
    </CivicAuthProvider>
  )
}
```

## Usage

### Getting User Information on the Frontend

**Auth**

`TitleBar.ts`
```typescript
import { UserButton } from "@civic/auth/react";

export function TitleBar() {
  return (
    <div>
      <h1>My App</h1>
      <UserButton />
    </div>
  );
};
```

**Auth + Web3**

`TitleBar.ts`
```typescript
import { UserButton } from "@civic/auth-web3/react";

export function TitleBar() {
  return (
    <div>
      <h1>My App</h1>
      <UserButton />
    </div>
  );
};
```

or the `useUser` hook, for retrieving information about the user in code:

**Auth**

`MyComponent.ts`
```typescript
import { useUser } from "@civic/auth/react";

export function MyComponent() {
  const { user } = useUser();
  
  if (!user) return <div>User not logged in</div>
  
  return <div>Hello { user.name }!</div>
}
```

**Auth + Web3**

`MyComponent.ts`
```typescript
import { useUser } from "@civic/auth-web3/react";

export function MyComponent() {
  const { user } = useUser();
  
  if (!user) return <div>User not logged in</div>
  
  return <div>Hello { user.name }!</div>
}
```

### Getting User Information on the Backend

Retrieve user information on backend code, such as in React Server Components, React Server Actions, or api routes using `getUser`:

**Auth**

```typescript
import { getUser } from "@civic/auth/nextjs";

const user = await getUser();
```

**Auth + Web3**

```typescript
import { getUser } from "@civic/auth-web3/nextjs";

const user = await getUser();
```

For example, in a Next.js Server Component:

**Auth**

```typescript
import { getUser } from "@civic/auth/nextjs";

export async function MyServerComponent() {
  const user = await getUser();
  
  if (!user) return <div>User not logged in</div>
  
  return <div>Hello { user.name }!</div>
}
```

**Auth + Web3**

```typescript
import { getUser } from "@civic/auth-web3/nextjs";

export async function MyServerComponent() {
  const user = await getUser();
  
  if (!user) return <div>User not logged in</div>
  
  return <div>Hello { user.name }!</div>
}
```

## Advanced Configuration

The integration also offers the ability customize the library according to the needs of your Next.js app. For example, to restrict authentication checks to specific pages and routes in your app. You can do so inside `next.config.js` as follows:

**Auth**

`next.config.ts`
```typescript
import { createCivicAuthPlugin } from "@civic/auth/nextjs"

const withCivicAuth = createCivicAuthPlugin({
  clientId: "YOUR CLIENT ID",
  ... // other config
});

export default withCivicAuth(nextConfig) // your next config here
```

**Auth + Web3**

`next.config.ts`
```typescript
import { createCivicAuthPlugin } from "@civic/auth-web3/nextjs"

const withCivicAuth = createCivicAuthPlugin({
  clientId: "YOUR CLIENT ID",
  ... // other config
});

export default withCivicAuth(nextConfig) // your next config here
```

Here are the available configuration options:

| Field       | Required | Default            | Example                               | Description                                                                                                                                                                                                                                                                                                                                                          |
|-------------|----------|--------------------|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `clientId`    | Yes      | -                  | `2cc5633d-2c92-48da-86aa-449634f274b9` | The key obtained on signup to [auth.civic.com](https://auth.civic.com)                                                                                                                                                                                                                                                                                                                       |
| `callbackUrl` | No       | `/api/auth/callback` | `/api/myroute/callback`               | This customizes the path that the auth-server redirects to after SSO login is complete. Note that if you implement this path you need to finish the token-exchange flow manually to login to Civic, i.e. you need to call `auth.civic.com/token` with the necessary OAuth parameters                                                                                 |
| `loginUrl`    | No       | `/`                | `/admin`                              | The path your user will be sent to if they access a resource that needs them to be logged in. If you have a dedicated login page, you can set it here.                                                                                                                                                                                                              |
| `logoutUrl`   | No       | `/`                | `/goodbye`                            | The path your user will be sent to after a successful log-out.                                                                                                                                                                                                                                                                                                          |
| `include`     | No       | `["/*"]`           | `["/admin/*", "/api/admin/*"]`        | An array of path [globs](https://www.npmjs.com/package/glob) that require a user to be logged-in to access. If not set, will include all paths matched by your Next.js [middleware](https://nextjs.org/docs/advanced-features/middleware).                                                                                                                          |
| `exclude`     | No       | -                  | `["public/home"]`                     | An array of path [globs](https://www.npmjs.com/package/glob) that are excluded from the Civic Auth [middleware](https://nextjs.org/docs/advanced-features/middleware). In some cases, it might be easier and safer to specify exceptions rather than keep an inclusion list up to date.                                                                                    |
| `basePath`    | No       | `/`                | `/my-app`                             | Allows applications to be served from custom subpaths instead of the root domain. This enables seamless authentication integration when deploying your Next.js application within subdirectories, ensuring all auth-related routes and assets maintain proper functionality regardless of the URL structure.                                                               |

Typescript support in configuration files was introduced in [Next 15](https://nextjs.org/blog/next-15).

These steps apply to the [App Router](https://nextjs.org/docs/app). If you are using the Pages Router, please [contact us](https://www.civic.com/contact) for integration steps.

Unlike the pure [React integration page](https://docs.civic.com/auth/integration/react), you do *not* have to add your client ID again here! Make sure to create the [Civic Auth API route](#2-create-the-civic-auth-api-route), as it serves the essential PKCE code challenge.

The Next.js integration can use all the components described in the [React Usage page](https://docs.civic.com/auth/integration/react-usage), such as the `UserButton`, for showing a Sign-In button and displaying the username:

See the [React Usage page](https://docs.civic.com/auth/integration/react-usage) for more details.

The `name` property is used as an example here, check out the [user object](https://docs.civic.com/auth/user-object) to see the entire basic user object structure.

Civic Auth is a "low-code" solution, so most of the configuration takes place via the [dashboard](https://auth.civic.com). Changes you make there will be updated automatically in your integration without any code changes. The only required parameter you need to provide is the client ID. 