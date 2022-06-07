import { useLoaderData, Form, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";

import { auth } from "../firebase-service";
import { isSessionValid } from "~/fb.sessions.server";
import { sessionLogout } from "../fb.sessions.server";

// use loader to check for existing session
export async function loader({ request }) {
  const { decodedClaims, error } = await isSessionValid(request, "/login");

  const COLLECTION_NAME = "tryreactfire";
  const PROJECT_ID = decodedClaims.aud;

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION_NAME}`
  );
  const { documents } = await response.json();

  console.log("documents", JSON.stringify(documents));
  const responseData = [];
  documents.forEach((doc) => {
    Object.keys(doc.fields).map((k) =>
      responseData.push({
        id: doc.name.substring(doc.name.lastIndexOf("/") + 1),
        createTime: doc.createTime,
        updateTime: doc.updateTime,
        [k]: Object.values(doc.fields[k])[0],
      })
    );
  });

  const data = {
    error,
    decodedClaims,
    responseData,
  };
  return json(data);
}

export async function action({ request }) {
  return await sessionLogout(request);
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
  const logoutFetcher = useFetcher();
  const data = useLoaderData();
  let greeting = data?.decodedClaims
    ? "Logged In As: " + data?.decodedClaims?.email
    : "Log In My: friend";

  console.log(data);

  const logout = async () => {
    await auth.signOut();
    logoutFetcher.submit({}, { method: "POST" });
  };

  return (
    <div className="ui container centered" style={{ paddingTop: 40 }}>
      <div className="ui segment">
        <h3>{greeting}</h3>
        <div>
          <button className="ui button" type="button" onClick={() => logout()}>
            LOGOUT
          </button>
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
        {data?.responseData?.map((m) => (
          <div className="ui segment" key={m?.id}>
            {m?.id} : {m?.name}
          </div>
        ))}
      </div>
    </div>
  );
}
