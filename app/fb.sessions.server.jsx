// app/sessions.js
import { createCookie, redirect } from "@remix-run/node"; // or "@remix-run/cloudflare"

// Initialize Firebase
// ---------------------
import * as admin from 'firebase-admin';
var serviceAccount = require("./service-account.json");
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * setup the session cookie to be used for firebase
 */
export const fbSessionCookie = createCookie("session", {
  maxAge: 60 * 60 * 24 * 5 * 1000,
  httpOnly: true,
  secure: true,
});

/**
 * checks that the current session is a valid session be getting the token
 * from the session cookie and validating it with firebase
 * 
 * @param {*} param0
 * @returns
 */
export const isSessionValid = async (request, redirectTo) => {
  const cookieHeader = request.headers.get("Cookie");
  const sessionCookie = (await fbSessionCookie.parse(cookieHeader)) || {};
  try {
    // Verify the session cookie. In this case an additional check is added to detect
    // if the user's Firebase session was revoked, user deleted/disabled, etc.
    const decodedClaims = await admin
      .auth()
      .verifySessionCookie(sessionCookie?.token, true /** checkRevoked */);
    return { success: true, decodedClaims };
  } catch (error) {
    console.log(error);
    // Session cookie is unavailable or invalid. Force user to login.
    // return { error: error?.message };
    throw redirect(redirectTo, {
      statusText: error?.message,
    });
  }
};

/**
 * set the cookie on the header and redirect to the specified route
 * 
 * @param {*} sessionCookie 
 * @param {*} redirectTo 
 * @returns 
 */
const setCookieAndRedirect = async (sessionCookie, redirectTo="/") => {
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await fbSessionCookie.serialize({
        token: sessionCookie,
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
};


/**
 * login the session by verifying the token, if all is good create/set cookie
 * and redirect to the appropriate route
 * 
 * @param {*} idToken 
 * @param {*} redirectTo 
 * @returns 
 */
export const sessionLogin = async (idToken, redirectTo) => {
  return admin
    .auth()
    .createSessionCookie(idToken, {
      expiresIn: 60 * 60 * 24 * 5 * 1000,
    })
    .then(
      (sessionCookie) => {
        // Set cookie policy for session cookie.
        return setCookieAndRedirect(sessionCookie, redirectTo)
      },
      (error) => {
        return {
          error: `sessionLogin UNAUTHORIZED REQUEST!: ${error.message}`,
        };
      }
    );
};

/**
 * revokes the session cookie from the firebase admin instance
 * @param {*} request 
 * @returns 
 */
export const sessionLogout = async (request) => {
  const cookieHeader = request.headers.get("Cookie");
  const sessionCookie = (await fbSessionCookie.parse(cookieHeader)) || {};

  // Verify the session cookie. In this case an additional check is added to detect
  // if the user's Firebase session was revoked, user deleted/disabled, etc.
  return admin
    .auth()
    .verifySessionCookie(sessionCookie?.token, true /** checkRevoked */)
    .then((decodedClaims) => {
      return admin.auth().revokeRefreshTokens(decodedClaims?.sub);
    })
    .then(() => {
      return { success: true };
    })
    .catch((error) => {
      console.log(error);
      // Session cookie is unavailable or invalid. Force user to login.
      return { error: error?.message };
    });
};
