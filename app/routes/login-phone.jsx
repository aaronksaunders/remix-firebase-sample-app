import { auth } from "../firebase-service";
import {
  signOut,
  RecaptchaVerifier,
  getAuth,
  signInWithPhoneNumber,
} from "firebase/auth";
import {
  Form,
  Link,
  useActionData,
  useCatch,
  useFetcher,
} from "@remix-run/react";
import { sessionLogin } from "../fb.sessions.server";
import { useEffect, useRef, useState } from "react";

//create a stylesheet ref for the auth.css file
export let links = () => {
  return [];
};

export function ErrorBoundary({ error }) {
  return (
    <div>
      <h1>ERROR ON LOGIN PHONE</h1>
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

export default function LoginPhone() {
  // to use our actionData error in our form, we need to pull in our action data
  const actionData = useActionData();
  const fetcher = useFetcher();
  const phoneRef = useRef(null);
  const confCodeRef = useRef(null);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    window.recaptchaVerifier = new RecaptchaVerifier(
      "sign-in-button",
      {
        size: "invisible",
        callback: (response) => {
          debugger;
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          // onSignInSubmit();
          // need to account for issue with this, ie and error
        },
      },
      auth
    );
  }, []);

  /**
   * try to login with phone number
   */
  const login = () => {
    await signOut(auth);
    
    signInWithPhoneNumber(
      getAuth(),
      phoneRef.current.value,
      window.recaptchaVerifier
    )
      .then((_confirmationResult) => {
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        window.confirmationResult = _confirmationResult;
        setConfirmationResult(_confirmationResult);
        // ...
      })
      .catch((error) => {
        debugger;
        alert("ERROR: " + error?.message);
      });
  };

  /**
   *
   */
  const confirmCode = async () => {
    confirmationResult
      .confirm(confCodeRef?.current.value)
      .then(async (result) => {
        // User signed in successfully.
        const user = result.user;
        fetcher.submit(
          { idToken: await user.getIdToken(true) },
          { method: "post" }
        );
        console.log(user);
      })
      .catch((error) => {
        // User couldn't sign in (bad verification code?)
        debugger;
        alert("ERROR: " + error?.message);
      });
  };

  return (
    <div className="ui container" style={{ paddingTop: 40 }}>
      <h3>Remix Login With Firebase, Phone Number</h3>

      <Form method="post" className="ui form centered">
        <div name="sign-in-button" id="sign-in-button"></div>
        {confirmationResult === null ? (
          <>
            <div className="field">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="phone"
                name="phone"
                placeholder=""
                required
                ref={phoneRef}
              />
            </div>
            <button type="button" className="ui button" onClick={() => login()}>
              SIGN IN
            </button>
          </>
        ) : (
          <>
            <div className="field">
              <label htmlFor="phone">Confirmation Code</label>
              <input
                type="text"
                name="confCode"
                placeholder=""
                required
                ref={confCodeRef}
              />
            </div>
            <button
              type="button"
              className="ui button"
              onClick={() => confirmCode()}
            >
              CONFIRM
            </button>
          </>
        )}
      </Form>
      <div className="ui divider"></div>
      <div className="ui centered grid" style={{ paddingTop: 16 }}>
        <div className="six wide column">
          <Link className="ui button right floated" to="/register">
            GO BACK
          </Link>
        </div>
      </div>
      <div className="errors">
        {actionData?.error ? actionData?.error?.message : null}
      </div>
    </div>
  );
}
