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

  const data = {
    user: getAuth().currentUser,
    error,
    decodedClaims,
    responseData,
  };
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
    <div className="ui container centered" style={{ paddingTop: 40 }}>
      <div className="ui segment">
        <h3>{greeting}</h3>
        <div>
          <Form method="post">
            <button className="ui button" type="submit">
              LOGOUT
            </button>
          </Form>
        </div>
      </div>
      <div className="ui segment">
        <div className="ui medium header">User Authentication Information</div>
        <p>Name: {data?.decodedClaims?.name || "** Name Missing **"}</p>
        <p>Email: {data?.decodedClaims?.email}</p>
        <p>Login Using: {data?.decodedClaims?.firebase?.sign_in_provider}</p>
      </div>
      <div className="ui segment">
        <div className="ui medium header">Querying Firestore Database</div>
        {data?.responseData?.map((m) => 
         <div className="ui segment" key={m?.id}>{m?.id} : {m?.name}</div>
        )}
      </div>
    </div>
  );
}
