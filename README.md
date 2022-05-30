# Welcome to Firebase Remix Example

A sample [Remix](https://remix.run/docs) Application showing account creation, login, logout and forgot password using Firebase

## Firebase Config and How it Works

- the application uses the [`firebase client SDK`](https://firebase.google.com/docs/auth/web/manage-users) to get the `token` from user authentication and saves it in a `cookie` after the server, using the [`firebase-admin SDK`](https://firebase.google.com/docs/auth/admin/manage-cookies) sdk to verify it is still valid
- add values to the `app/firebase-config.json` file to support client side API
- for the server, you will need to download the service account information into a file `app/service-account.json`

### Google Login

- cannot happen on the server so were do the login on the client side and then pass the `idToken` to the server to create the same cookie as we do with a normal login.
- use the `useFetcher` hook to call the `ActionFuntion` and pass appropriate properties as formData

```javascript
// login.jsx - client
const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(async (res) => {
      const idToken = await res.user.getIdToken();
      fetcher.submit(
        {
          "idToken": idToken,
          "google-login": true,
        },
        { "method": "post" }
      );
    })
    .catch((err) => {
      console.log("signInWithGoogle", err);
    });
};
```

This snippet of code is from the `ActionFunction`

```javascript
let googleLogin = formData.get("google-login");
...
if (googleLogin) {
    const resp = await sessionLogin(formData.get("idToken"));
    return await setCookieAndRedirect(resp.sessionCookie);
} else {
    // handle emailPassword login
}
```

## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`

### Using a Template

When you ran `npx create-remix@latest` there were a few choices for hosting. You can run that again to create a new project, then copy over your `app/` folder to the new project that's pre-configured for your target server.

```sh
cd ..
# create a new project, and pick a pre-configured host
npx create-remix@latest
cd my-new-remix-app
# remove the new project's app (not the old one!)
rm -rf app
# copy your app over
cp -R ../my-old-remix-app/app app
```
