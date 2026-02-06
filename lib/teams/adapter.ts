import { BotFrameworkAdapter } from "botbuilder";

/**
 * Teams Bot Framework Adapter
 * Handles authentication with Microsoft Teams and Bot Service
 */
export const teamsAdapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID || "",
  appPassword: process.env.MICROSOFT_APP_PASSWORD || "",
});

/**
 * Error handler for the adapter
 * Logs errors and notifies the user in Teams
 */
teamsAdapter.onTurnError = async (context, error) => {
  console.error("Teams Bot Error:", error);
  
  try {
    await context.sendActivity(
      "⚠️ An error occurred. Please try again or contact support if the issue persists."
    );
  } catch (err) {
    console.error("Failed to send error message to Teams:", err);
  }
};

