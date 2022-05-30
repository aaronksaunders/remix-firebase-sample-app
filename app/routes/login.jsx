import { auth } from "../firebase-service";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useCatch,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { fbSessionCookie, sessionLogin } from "../fb.sessions.server";

//create a stylesheet ref for the auth.css file
export let links = () => {
  return [];
};

export function ErrorBoundary({ error }) {
  console.log(error);
  return (
    <div>
      <h1>ERROR ON LOGIN</h1>
      <pre>
        <code>{JSON.stringify(error.message, null, 2)}</code>
      </pre>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <div>
      <h1>Caught</h1>
      <p>Status: {caught.status}</p>
      <pre>
        <code>{JSON.stringify(caught.data, null, 2)}</code>
      </pre>
    </div>
  );
}

// use loader to check for existing session, if found, send the user to the blogs site
export async function loader({ request }) {
    const cookieHeader = request.headers.get("Cookie");
    const sessionCookie = (await fbSessionCookie.parse(cookieHeader)) || {};
    console.log(sessionCookie);
  return {};
}

// our action function will be launched when the submit button is clicked
// this will sign in our firebase user and create our session and cookie using user.getIDToken()
export let action = async ({ request }) => {
  let formData = await request.formData();
  let email = formData.get("email");
  let password = formData.get("password");

  await signOut(auth);

  try {
    const { user, error } = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    // if signin was successful then we have a user
    if (user) {
      const idToken = await auth.currentUser.getIdToken();
      const resp = await sessionLogin(idToken);

      if (!resp.error) {
        // let's send the user to the main page after login
        return redirect("/", {
          headers: {
            "Set-Cookie": await fbSessionCookie.serialize({
                token: resp.sessionCookie,
                expires: new Date(Date.now() + 60_000),
                httpOnly: true,
                maxAge: 60,
                path: "/",
                sameSite: "lax",
                secrets: ["s3cret1"],
                secure: true,
            }),
          },
        });
      } else {
        return { user, error: resp.error };
      }
    }
    return { user, error };
  } catch (error) {
    return { error: { message: error?.message } };
  }
};

export default function Login() {
  // to use our actionData error in our form, we need to pull in our action data
  const actionData = useActionData();

  return (
    <div className="loginContainer">
      <div className="authTitle">
        <h1>Login</h1>
      </div>
      <Form method="post">
        <label htmlFor="email">Email</label>
        <input
          className="loginInput"
          type="email"
          name="email"
          placeholder="you@awesome.dev"
          required
        />
        <label htmlFor="password">Password</label>
        <input
          className="loginInput"
          type="password"
          name="password"
          required
        />
        <button className="loginButton" type="submit">
          Login
        </button>
      </Form>
      <div className="additionalLinks">
        <Link to="/register">Register</Link>
        <Link to="/forgot">Forgot Password?</Link>
      </div>
      <div className="errors">
        {actionData?.error ? actionData?.error?.message : null}
      </div>
    </div>
  );
}
