import { useLoaderData, Form } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";

import { auth } from "../firebase-service";
import {
  isSessionValid,
} from "~/fb.sessions.server";

// use loader to check for existing session
export async function loader({ request }) {
  const { decodedClaims, error, success } = await isSessionValid(request);

  if (success) {
    const data = { user: auth.currentUser, error, decodedClaims };
    return json(data);
  } else {
    console.log("isSessionValid",error)
  }
  return redirect("/login");
}

export async function action({ request }) {

  auth.signOut();
  return redirect("/");
}

// https://remix.run/api/conventions#meta
export let meta = () => {
  return {
    title: "Remix Starter",
    description: "Welcome to remix!",
  };
};

// https://remix.run/guides/routing#index-routes
export default function Index() {
  const data = useLoaderData();
  let greeting = data?.user?.email
    ? "Logged In As: " + data.user.email
    : "Log In My: friend";
  return (
    <div>
      <div className="remix__page">{greeting}</div>
      <div>
        <Form method="post">
          <button type="submit">LOGOUT</button>
        </Form>
      </div>
    </div>
  );
}
