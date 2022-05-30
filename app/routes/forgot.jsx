import { auth } from "../firebase-service";
import { sendPasswordResetEmail } from "firebase/auth";
import { Form, Link } from "@remix-run/react";
import { redirect } from "@remix-run/node";

//create a stylesheet ref for the auth.css file
export let links = () => {
  return [];
};


export let action = async ({ request }) => {
  // pull in the form data from the request after the form is submitted
  let formData = await request.formData();

  let email = formData.get("email");

  // perform firebase send password reset email
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    console.log("Error: ", err.message);
  }
  // success, send user to /login page
  return redirect("/login");
};

export default function Login() {
  return (
    <div className="loginContainer">
      <div className="authTitle">
        <h1>Forgot Password?</h1>
      </div>
      <Form method="post">
        <p>Enter the email address associated with your account</p>
        <input
          className="loginInput"
          type="email"
          name="email"
          placeholder="you@awesome.dev"
          required
        />
        <button className="loginButton" type="submit">
          Submit
        </button>
      </Form>
      <div className="additionalLinks">
        Not Yet Registered? <Link to="/auth/register">Register</Link>
      </div>
    </div>
  );
}
