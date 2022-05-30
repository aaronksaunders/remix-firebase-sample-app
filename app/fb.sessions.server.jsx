// app/sessions.js
import { auth } from "firebase-admin";

var admin = require("firebase-admin");

var serviceAccount = require("./service-account.json");

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 *
 * @param {*} param0
 * @returns
 */
export const isSessionValid = async (request) => {

  var re = new RegExp("session=([^;]+)");
  var sessionCookie = re.exec(request?.headers.get("Cookie"))[1];

  // Verify the session cookie. In this case an additional check is added to detect
  // if the user's Firebase session was revoked, user deleted/disabled, etc.
  return admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((decodedClaims) => {
      console.log("we are good..")
      return { success: true, decodedClaims };
    })
    .catch((error) => {
      console.log(error)
      // Session cookie is unavailable or invalid. Force user to login.
      return { error: error?.message };
    });
};

/**
 *
 * @param {*} param0
 * @returns
 */
export const sessionLogin = async (idToken) => {

  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  return admin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        // Set cookie policy for session cookie.
        const options = { maxAge: expiresIn, httpOnly: true, secure: true };
        return { sessionCookie, options };
      },
      (error) => {
        return { error: `UNAUTHORIZED REQUEST!: ${error.message}`};
      }
    );
};
