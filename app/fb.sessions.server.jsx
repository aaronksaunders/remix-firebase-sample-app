// app/sessions.js
import { createCookie } from "@remix-run/node"; // or "@remix-run/cloudflare"

var admin = require("firebase-admin");

var serviceAccount = require("./service-account.json");

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const fbSessionCookie = createCookie("session", {
  maxAge: 60 * 60 * 24 * 5 * 1000,
  httpOnly: true,
  secure: true,
});

/**
 *
 * @param {*} param0
 * @returns
 */
export const isSessionValid = async (request) => {
  const cookieHeader = request.headers.get("Cookie");
  const sessionCookie = (await fbSessionCookie.parse(cookieHeader)) || {};

  // Verify the session cookie. In this case an additional check is added to detect
  // if the user's Firebase session was revoked, user deleted/disabled, etc.
  return admin
    .auth()
    .verifySessionCookie(sessionCookie?.token, true /** checkRevoked */)
    .then((decodedClaims) => {
      console.log("we are good..");
      return { success: true, decodedClaims };
    })
    .catch((error) => {
      console.log(error);
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
  return admin
    .auth()
    .createSessionCookie(idToken,{
      expiresIn : 60 * 60 * 24 * 5 * 1000
    })
    .then(
      (sessionCookie) => {
        // Set cookie policy for session cookie.
        return { sessionCookie };
      },
      (error) => {
        return { error: `sessionLogin UNAUTHORIZED REQUEST!: ${error.message}` };
      }
    );
};

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
