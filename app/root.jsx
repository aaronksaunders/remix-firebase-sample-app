import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import stylesUrl from "~/styles/semantic.min.css";


export const meta = () => ({
  charset: "utf-8",
  title: "New Remix Firebase Auth App",
  viewport: "width=device-width,initial-scale=1",
});

// https://remix.run/api/app#links
export let links = () => {
  return [
    { rel: "stylesheet", href: stylesUrl },
  ];
};


export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="ui container">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
