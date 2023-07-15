import { ChakraProvider } from "@chakra-ui/react";
import type { LinksFunction, V2_MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { theme } from "./theme";

export const meta: V2_MetaFunction = () => [
  { charSet: "utf-8" },
  { title: "Museum" },
  { viewport: "width=device-width,initial-scale=1"  },
];

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "/style.css",
  },
];

export function Document({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <ChakraProvider theme={theme}>
        <Outlet />
      </ChakraProvider>
    </Document>
  );
}
