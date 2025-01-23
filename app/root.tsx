import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import {
  type HeadersFunction,
  Links,
  type LinksFunction,
  Meta,
  type MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  data,
} from "react-router";

import { getMaxAge } from "./db.server";
import { theme } from "./theme";

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
