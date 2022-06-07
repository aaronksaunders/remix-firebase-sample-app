import { auth } from "../firebase-service";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  Form,
  Link,
  useActionData,
  useCatch,
  useFetcher,
} from "@remix-run/react";
import { useRef } from "react";
import { sessionLogin } from "../fb.sessions.server";

//create a stylesheet ref for the auth.css file
export let links = () => {
  return [];
};

export function ErrorBoundary({ error }) {
  debugger;
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
debugger;
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
  return {};
}

// our action function will be launched when the submit button is clicked
// this will sign in our firebase user and create our session and cookie using user.getIDToken()
export let action = async ({ request }) => {
  let formData = await request.formData();

  try {
    return await sessionLogin(request, formData.get("idToken"), "/");
  } catch (error) {
    return { error: { message: error?.message } };
  }
};

export default function Login() {
  // to use our actionData error in our form, we need to pull in our action data
  const actionData = useActionData();
  const fetcher = useFetcher();

  // for refs
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  /**
   *
   */
  const signInWithGoogle = async () => {
    await signOut(auth);
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (res) => {
        const idToken = await res.user.getIdToken();
        fetcher.submit(
          { idToken: idToken, "google-login": true },
          { method: "post" }
        );
      })
      .catch((err) => {
        console.log("signInWithGoogle", err);
      });
  };

  const signInWithEmail = async () => {
    try {
      debugger;
      await signOut(auth);
      const authResp = await signInWithEmailAndPassword(
        auth,
        emailRef.current.value,
        passwordRef.current.value
      );

      // if signin was successful then we have a user
      if (authResp.user) {
        const idToken = await auth.currentUser.getIdToken();
        fetcher.submit(
          { idToken: idToken, "email-login": true },
          { method: "post" }
        );
      }
    } catch (err) {
      console.log("signInWithEmail", err);
    }
  };

  return (
    <div className="ui container" style={{ paddingTop: 40 }}>
      <h3>Remix Login With Firebase, Email & Google Auth</h3>
      <Form method="post" className="ui form centered">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            placeholder="me@mail.com"
            required
            ref={emailRef}
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input type="password" name="password" required ref={passwordRef} />
        </div>
        <button
          className="ui button"
          name="email-login"
          onClick={() =>  signInWithEmail()}
          type="button"
        >
          Login With Email
        </button>
        <button
          className="ui button"
          type="button"
          onClick={ () =>  signInWithGoogle()}
        >
          <i className="icon google"></i>
          Login with Google
        </button>
        <Link to="/login-phone" className="ui button">
          PHONE
        </Link>
      </Form>
      <div className="ui divider"></div>
      <div className="ui centered grid" style={{ paddingTop: 16 }}>
        <div className="six wide column">
          <Link className="ui button right floated" to="/register">
            Register
          </Link>
        </div>
        <div className="six wide column">
          <Link className="ui button" to="/forgot">
            Forgot Password?
          </Link>
        </div>
      </div>
      <div className="errors">
        {actionData?.error ? actionData?.error?.message : null}
      </div>
    </div>
  );
}
