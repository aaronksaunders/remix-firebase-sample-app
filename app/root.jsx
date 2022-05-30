import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node"

import { auth } from "./firebase-service"

export const meta = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});


// loader function to check for existing user based on session cookie
// this is used to change the nav rendered on the page and the greeting.
export async function loader({ request }) {

    return null;
}

export let action = async ({ request }) => {

  auth.signOut();
  return redirect("/");
};


export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
