import { useLoaderData, Form } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";

import { auth } from "../firebase-service";
import { isSessionValid, fbSessionCookie } from "~/fb.sessions.server";

// use loader to check for existing session
export async function loader({ request }) {
  try {
    const { decodedClaims, error, success } = await isSessionValid(request);

    if (success) {
      const data = { user: auth.currentUser, error, decodedClaims };
      return json(data);
    } else {
      console.log("isSessionValid", error);
      return redirect("/login");
    }
  } catch {
    return redirect("/login");
  }
}

export async function action({ request }) {
  await auth.signOut();

  const cookieHeader = request.headers.get("Cookie");
  const sessionCookie = (await fbSessionCookie.parse(cookieHeader)) || {};

  const newValues = {
    ...sessionCookie,
    token: null,
    expires: new Date(Date.now()),
    maxAge: -1,
  };
  return redirect("/login", {
    headers: {
      "Set-Cookie": await fbSessionCookie.serialize(newValues),
    },
  });
}

// https://remix.run/api/conventions#meta
export let meta = () => {
  return {
    title: "Remix Starter Firebase ",
    description: "Welcome to remix with firebase!",
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
