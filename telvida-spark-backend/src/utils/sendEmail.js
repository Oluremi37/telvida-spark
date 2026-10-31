const { Client } = require("@microsoft/microsoft-graph-client");
const { ClientSecretCredential } = require("@azure/identity");
require("isomorphic-fetch");

const sendEmail = async (options) => {
  try {
    // Create credential
    const credential = new ClientSecretCredential(
      process.env.MICROSOFT_TENANT_ID,
      process.env.MICROSOFT_CLIENT_ID,
      process.env.MICROSOFT_CLIENT_SECRET,
    );

    // Create Microsoft Graph client
    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const token = await credential.getToken(
            "https://graph.microsoft.com/.default",
          );
          return token.token;
        },
      },
    });

    // Email message
    const message = {
      message: {
        subject: options.subject,
        body: {
          contentType: "HTML",
          content: options.html,
        },
        toRecipients: [
          {
            emailAddress: {
              address: options.email,
            },
          },
        ],
      },
      saveToSentItems: true,
    };

    // Send email using Microsoft Graph
    await client
      .api(`/users/${process.env.MICROSOFT_SENDER_EMAIL}/sendMail`)
      .post(message);

    console.log("Email sent successfully via Microsoft Graph");
  } catch (error) {
    console.error("Error sending email via Microsoft Graph:", error);
    throw error;
  }
};

module.exports = sendEmail;
