import { auth } from "../firebase-service";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Form, useActionData, Link } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { sessionLogin, fbSessionCookie } from "~/fb.sessions.server";

//create a stylesheet ref for the auth.css file
export let links = () => {
  return [];
};
// This will be the same as our Sign In but it will say Register and use createUser instead of signIn

export let action = async ({ request }) => {
  let formData = await request.formData();
  let email = formData.get("email");
  let password = formData.get("password");

  //perform a signout to clear any active sessions
  await auth.signOut();
  try {
    //setup user data
    let {
      session: sessionData,
      user,
      error: signUpError,
    } = await createUserWithEmailAndPassword(auth, email, password);

    if (!signUpError) {
      const idToken = await auth.currentUser.getIdToken();

      const resp = await sessionLogin(idToken);

      if (!resp.error) {
        const cookieHeader = request.headers.get("Cookie");
        const cookie = (await fbSessionCookie.parse(cookieHeader)) || {};
        cookie.token = resp.sessionCookie;
        // let's send the user to the main page after login
        return redirect("/", {
          headers: {
            "Set-Cookie": await fbSessionCookie.serialize(cookie),
          },
        });
      } else {
        return { user, error: resp.error };
      }
    }
    // perform firebase register
    return { user, signUpError };
  } catch (error) {
    return { error: { message: error?.message } };
  }
};

export default function Register() {
  const actionData = useActionData();
  return (
    <div className="ui container" style={{paddingTop: 40}}>
        <h3>Register</h3>
      <Form method="post" className="ui form centered">
      <div className="field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            placeholder="me@mail.com"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            required
          />
        </div>
        <button className="ui button" type="submit">
          Register
        </button>
      </Form>
      <div className="ui divider"></div>
      <div className="ui centered grid" style={{paddingTop:12}}>
        <Link className="ui button right floated" to="/login">
          Already Registered?
        </Link>
      </div>
      <div className="errors">
        {actionData?.error ? actionData?.error?.message : null}
      </div>
    </div>
  );
}
