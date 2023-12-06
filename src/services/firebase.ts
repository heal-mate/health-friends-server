import admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import serviceAccount from "../../service-account-file.json" assert { type: "json" };

// The requested module 'firebase-admin' is a CommonJS module, which may not support all module.exports as named exports.
// CommonJS modules can always be imported via the default export
const { credential } = admin;

initializeApp({
  credential: credential.cert(serviceAccount),
});

export const sendWebPushMessage = async (props: {
  registrationToken: string;
  title: string;
  body: string;
}) => {
  const { registrationToken: token, title, body } = props;

  return getMessaging()
    .send({
      notification: {
        title,
        body,
      },
      token,
    })
    .then((response) => {
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
};
