import { ChakraProvider } from "@chakra-ui/react";
import type {
  HeadersFunction,
  LinksFunction,
  MetaFunction,
} from "@remix-run/node";
import { data } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { ThemeProvider } from "next-themes";
import { theme } from "./theme";
import { getMaxAge } from "./db.server";

export const meta: MetaFunction = () => [{ title: "Museum" }];

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "/style.css",
  },
];

export const loader = async () => {
  return data(
    {},
    {
      headers: {
        "Cache-Control": `public, max-age=${await getMaxAge()}`,
      },
    },
  );
};

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  return loaderHeaders;
};

export function Document({ children }: React.PropsWithChildren) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <ChakraProvider value={theme}>
        <ThemeProvider attribute="class" disableTransitionOnChange>
          <Outlet />
        </ThemeProvider>
      </ChakraProvider>
    </Document>
  );
}
