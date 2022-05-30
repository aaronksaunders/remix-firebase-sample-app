import { useLoaderData, Form } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";

import { auth, db } from "../firebase-service";
import { collection, getDocs } from "firebase/firestore";
import { isSessionValid, fbSessionCookie } from "~/fb.sessions.server";
import { getAuth } from "firebase/auth";

// use loader to check for existing session
export async function loader({ request }) {
  const { decodedClaims, error } = await isSessionValid(request, "/login");

  const querySnapshot = await getDocs(collection(db, "tryreactfire"));
  const responseData = [];
  querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data());
    responseData.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  const data = { user: getAuth().currentUser, error, decodedClaims, responseData };
  return json(data);
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
  let greeting = data?.decodedClaims
    ? "Logged In As: " + data?.decodedClaims?.email
    : "Log In My: friend";
  return (
    <div>
      <div className="remix__page">{greeting}</div>
      <div>
        <Form method="post">
          <button type="submit">LOGOUT</button>
        </Form>
      </div>
      <div>
        <pre>
          {JSON.stringify(data,null,2)}
        </pre>
      </div>
    </div>
  );
}
