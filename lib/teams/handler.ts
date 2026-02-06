import { TurnContext } from "botbuilder";
import { messageCache } from "./message-cache";
import { getProjectIdForChannel } from "./channel-mapper";
import { mapTeamsUserToEZTestUser, hasProjectAccess } from "./user-mapper";
import { parseTestCase, parseDefect } from "./parser";

/**
 * Main Teams Bot Message Handler
 * Routes commands and manages message processing
 */

export async function handleTeamsMessage(context: TurnContext): Promise<void> {
  // Only process text messages
  if (context.activity.type !== "message") {
    return;
  }

  const text = context.activity.text || "";
  const channelId = context.activity.channelData?.channel?.id || "";
  const userId = context.activity.from?.aadObjectId || "";
  const userName = context.activity.from?.name || "Unknown";
  // Email might be in properties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userEmail = (context.activity.from as any)?.properties?.email || "";

  console.log(`📨 Message received in channel ${channelId} from ${userName}: "${text}"`);

  // Extract Teams user identity
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upn = (context.activity.from as any)?.upn;
  const teamsUser = {
    aadObjectId: userId,
    email: userEmail,
    name: userName,
    upn: upn,
  };

  // Check if this is a command (mentions @EZTest)
  const isCommand = text.toLowerCase().includes("@eztest");

  if (!isCommand) {
    // Not a command - just cache the message for later use
    messageCache.cacheMessage(channelId, userId, text, context.activity.id);
    return;
  }

  // It's a command - process it
  try {
    // Map Teams user to EZTest user
    const eztestUser = await mapTeamsUserToEZTestUser(teamsUser);
    if (!eztestUser) {
      await context.sendActivity(
        "⚠️ Could not map your Teams account to EZTest. Please ensure your EZTest email matches your Teams email."
      );
      return;
    }

    // Route to appropriate command handler
    if (text.includes("configure")) {
      await handleConfigureCommand(context, channelId);
    } else if (text.includes("create testcase") || text.includes("add testcase")) {
      // Support both "create testcase" and "add testcase" commands
      await handleCreateTestCaseCommand(context, channelId, eztestUser.userId);
    } else if (text.includes("list testcase")) {
      await handleListTestCasesCommand(context, channelId, eztestUser.userId);
    } else if (text.includes("show testcase")) {
      await handleShowTestCaseCommand(context, channelId, eztestUser.userId, text);
    } else if (text.includes("add defect")) {
      await handleAddDefectCommand(context, channelId, eztestUser.userId);
    } else if (text.includes("help")) {
      await handleHelpCommand(context);
    } else {
      await context.sendActivity(
        "❓ Command not recognized. Type `@EZTest help` for available commands."
      );
    }
  } catch (error) {
    console.error("Error handling Teams command:", error);
    await context.sendActivity(
      "⚠️ An error occurred while processing your command. Please try again."
    );
  }
}

/**
 * Handle @EZTest configure command
 * Binds channel to EZTest project
 */
async function handleConfigureCommand(
  context: TurnContext,
  channelId: string
): Promise<void> {
  await context.sendActivity(
    "🔧 **Configure EZTest**\n\n" +
    "To configure this channel, please use the EZTest admin panel:\n" +
    "1. Go to Admin → Teams Channels\n" +
    "2. Add a new channel configuration\n" +
    "3. Link this channel ID to your project\n\n" +
    `**Channel ID:** \`${channelId}\`\n\n` +
    "Once configured, you can use all EZTest commands in this channel."
  );
}

/**
 * Handle @EZTest create testcase / add testcase command
 * Uses the last message from the same user in the same channel
 * Works across multiple channels safely
 */
async function handleCreateTestCaseCommand(
  context: TurnContext,
  channelId: string,
  userId: string
): Promise<void> {
  // Check if channel is configured
  const projectId = await getProjectIdForChannel(channelId);
  if (!projectId) {
    await context.sendActivity(
      "⚠️ This channel is not configured with an EZTest project. Use `@EZTest configure` to set it up."
    );
    return;
  }

  // Check user access
  const hasAccess = await hasProjectAccess(userId, projectId, 'testcases:create');
  if (!hasAccess) {
    await context.sendActivity(
      "❌ You don't have permission to create test cases in this project. Please contact your project admin."
    );
    return;
  }

  // Get cached message (last message from same user in same channel)
  const cachedMsg = messageCache.getLastMessage(channelId, userId);
  if (!cachedMsg) {
    await context.sendActivity(
      "❌ No recent message found. Please enter your test case details first, then run `@EZTest create testcase` again.\n\n" +
      "**Example:**\n" +
      "1. Post: \"Verify user login with valid credentials\"\n" +
      "2. Then: `@EZTest create testcase`"
    );
    return;
  }

  // Parse test case from message (handles both structured and simple formats)
  const testCaseData = parseTestCase(cachedMsg.text);
  
  // If no title parsed, use the entire message as title (simple format)
  const title = testCaseData.title || cachedMsg.text.trim();
  
  if (!title || title.length === 0) {
    await context.sendActivity(
      "❌ Could not extract test case title from your message. Please try again with a clear title."
    );
    return;
  }

  try {
    // Call Teams API to create test case
    const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';
    
    // For simple format: if title is the whole message, don't duplicate as description
    // For structured format: use parsed description
    let description = testCaseData.description;
    if (!description && testCaseData.title && cachedMsg.text !== title) {
      // If we parsed a title but there's more content, use the rest as description
      const textWithoutTitle = cachedMsg.text.replace(new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'), '').trim();
      if (textWithoutTitle && textWithoutTitle.length > 0) {
        description = textWithoutTitle;
      }
    }
    
    const response = await fetch(`${baseUrl}/api/teams/testcases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        projectId,
        title: title,
        description: description,
        priority: testCaseData.priority || 'MEDIUM',
        status: testCaseData.status || 'ACTIVE',
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || 'Failed to create test case');
    }

    const tc = result.data || result;
    await context.sendActivity(
      `✅ **Test Case Created!**\n\n` +
      `**${tc.tcId || tc.id}** - ${tc.title}\n\n` +
      (tc.description ? `*${tc.description}*\n\n` : '') +
      `View in EZTest: ${baseUrl}/projects/${projectId}/testcases/${tc.id}`
    );
    
    // Clear the cached message after successful creation
    messageCache.clearMessage(channelId, userId);
  } catch (error) {
    console.error('Error creating test case:', error);
    await context.sendActivity(
      `❌ Failed to create test case: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Handle @EZTest list testcases command
 */
async function handleListTestCasesCommand(
  context: TurnContext,
  channelId: string,
  userId: string
): Promise<void> {
  // Check if channel is configured
  const projectId = await getProjectIdForChannel(channelId);
  if (!projectId) {
    await context.sendActivity(
      "⚠️ This channel is not configured with an EZTest project. Use `@EZTest configure` to set it up."
    );
    return;
  }

  // Check user access
  const hasAccess = await hasProjectAccess(userId, projectId);
  if (!hasAccess) {
    await context.sendActivity(
      "❌ You don't have access to this project. Please contact your project admin."
    );
    return;
  }

  try {
    // Call Teams API to list test cases
    const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/teams/testcases?userId=${userId}&projectId=${projectId}&page=1&limit=10`
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch test cases');
    }

    const testCases = result.data?.data || result.data || [];
    
    if (testCases.length === 0) {
      await context.sendActivity("📋 **No test cases found** in this project.");
      return;
    }

    let message = `📋 **Test Cases (${testCases.length})**\n\n`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    testCases.slice(0, 10).forEach((tc: any) => {
      message += `• **${tc.tcId || tc.id}** - ${tc.title}\n`;
    });

    if (testCases.length > 10) {
      message += `\n... and ${testCases.length - 10} more.`;
    }

    message += `\n\nType \`@EZTest show testcase TC-XXX\` for details.`;

    await context.sendActivity(message);
  } catch (error) {
    console.error('Error fetching test cases:', error);
    await context.sendActivity(
      `❌ Failed to fetch test cases: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Handle @EZTest show testcase TC-XXX command
 */
async function handleShowTestCaseCommand(
  context: TurnContext,
  channelId: string,
  userId: string,
  text: string
): Promise<void> {
  // Extract TC ID from command (e.g., "TC-101")
  const tcMatch = text.match(/TC-(\d+)/i);
  if (!tcMatch) {
    await context.sendActivity("❌ Test case ID not found. Format: `@EZTest show testcase TC-101`");
    return;
  }

  // Check if channel is configured
  const projectId = await getProjectIdForChannel(channelId);
  if (!projectId) {
    await context.sendActivity(
      "⚠️ This channel is not configured with an EZTest project."
    );
    return;
  }

  // Check user access
  const hasAccess = await hasProjectAccess(userId, projectId);
  if (!hasAccess) {
    await context.sendActivity(
      "❌ You don't have access to this project."
    );
    return;
  }

  try {
    // Find test case by tcId (format: TC-123)
    const tcIdPattern = tcMatch[1];
    const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';
    
    // First, get list of test cases to find the one with matching tcId
    const listResponse = await fetch(
      `${baseUrl}/api/teams/testcases?userId=${userId}&projectId=${projectId}&page=1&limit=100`
    );
    const listResult = await listResponse.json();
    const testCases = listResult.data?.data || listResult.data || [];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const testCase = testCases.find((tc: any) => 
      tc.tcId === `TC-${tcIdPattern}` || tc.tcId === tcIdPattern
    );

    if (!testCase) {
      await context.sendActivity(
        `❌ Test case TC-${tcIdPattern} not found in this project.`
      );
      return;
    }

    // Get full test case details
    const detailResponse = await fetch(
      `${baseUrl}/api/teams/testcases/${testCase.id}?userId=${userId}`
    );
    const detailResult = await detailResponse.json();

    if (!detailResponse.ok) {
      throw new Error(detailResult.error || 'Failed to fetch test case details');
    }

    const tc = detailResult.data?.data || detailResult.data;
    
    let message = `🧪 **${tc.tcId || tc.id} - ${tc.title}**\n\n`;
    
    if (tc.description) {
      message += `*${tc.description}*\n\n`;
    }

    if (tc.testSteps && tc.testSteps.length > 0) {
      message += "**Steps:**\n";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tc.testSteps.forEach((step: any, idx: number) => {
        message += `${idx + 1}. ${step.description || step.action}\n`;
      });
      message += "\n";
    }

    if (tc.expectedResult) {
      message += `**Expected Result:**\n${tc.expectedResult}\n\n`;
    }

    message += `**Priority:** ${tc.priority || 'N/A'} | **Status:** ${tc.status || 'N/A'}`;
    
    if (tc.type) {
      message += ` | **Type:** ${tc.type}`;
    }

    message += `\n\nView in EZTest: ${baseUrl}/projects/${projectId}/testcases/${tc.id}`;

    await context.sendActivity(message);
  } catch (error) {
    console.error('Error fetching test case:', error);
    await context.sendActivity(
      `❌ Failed to fetch test case: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Handle @EZTest add defect command
 */
async function handleAddDefectCommand(
  context: TurnContext,
  channelId: string,
  userId: string
): Promise<void> {
  // Check if channel is configured
  const projectId = await getProjectIdForChannel(channelId);
  if (!projectId) {
    await context.sendActivity(
      "⚠️ This channel is not configured with an EZTest project."
    );
    return;
  }

  // Check user access
  const hasAccess = await hasProjectAccess(userId, projectId);
  if (!hasAccess) {
    await context.sendActivity("❌ You don't have access to this project.");
    return;
  }

  // Get cached message
  const cachedMsg = messageCache.getLastMessage(channelId, userId);
  if (!cachedMsg) {
    await context.sendActivity(
      "❌ No recent message found. Please post your defect details and then run the command again."
    );
    return;
  }

  // Parse defect from message
  const defectData = parseDefect(cachedMsg.text);
  if (!defectData.title) {
    await context.sendActivity(
      "❌ Could not parse defect. Please include a title in your message.\n\n" +
      "**Format:**\n" +
      "Title: Defect title\n" +
      "Description: Optional description\n" +
      "Severity: CRITICAL | HIGH | MEDIUM | LOW\n" +
      "Priority: HIGH | MEDIUM | LOW\n" +
      "Linked TC: TC-123 (optional)"
    );
    return;
  }

  try {
    // Resolve linked test case ID if provided (TC-XXX format to actual ID)
    let linkedTestCaseId: string | undefined;
    if (defectData.linkedTestCaseId) {
      const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';
      const listResponse = await fetch(
        `${baseUrl}/api/teams/testcases?userId=${userId}&projectId=${projectId}&page=1&limit=100`
      );
      const listResult = await listResponse.json();
      const testCases = listResult.data?.data || listResult.data || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const testCase = testCases.find((tc: any) => {
        if (!defectData.linkedTestCaseId) return false;
        return tc.tcId === defectData.linkedTestCaseId || tc.tcId === `TC-${defectData.linkedTestCaseId.replace('TC-', '')}`;
      });
      if (testCase) {
        linkedTestCaseId = testCase.id;
      }
    }

    // Call Teams API to create defect
    const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/teams/defects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        projectId,
        title: defectData.title,
        description: defectData.description,
        severity: defectData.severity,
        priority: defectData.priority,
        status: defectData.status || 'NEW',
        linkedTestCaseId,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create defect');
    }

    const defect = result.data?.data || result.data;
    
    // Link to test case if provided
    if (linkedTestCaseId && defect.id) {
      try {
        await fetch(`${baseUrl}/api/teams/defects/${defect.id}/link-testcase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            testCaseId: linkedTestCaseId,
          }),
        });
      } catch (linkError) {
        console.error('Error linking defect to test case:', linkError);
        // Continue - defect was created, just linking failed
      }
    }

    await context.sendActivity(
      `✅ **Defect Created!**\n\n` +
      `**${defect.defectId || defect.id}** - ${defect.title}\n\n` +
      (defect.description ? `*${defect.description}*\n\n` : '') +
      `**Severity:** ${defect.severity} | **Priority:** ${defect.priority}\n` +
      (linkedTestCaseId ? `**Linked to:** ${defectData.linkedTestCaseId}\n` : '') +
      `\nView in EZTest: ${baseUrl}/projects/${projectId}/defects/${defect.id}`
    );
  } catch (error) {
    console.error('Error creating defect:', error);
    await context.sendActivity(
      `❌ Failed to create defect: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Handle @EZTest help command
 */
async function handleHelpCommand(context: TurnContext): Promise<void> {
  await context.sendActivity(
    "📚 **EZTest Teams Bot - Available Commands**\n\n" +
    "**Setup:**\n" +
    "`@EZTest configure` - Link this channel to an EZTest project\n\n" +
    "**Test Cases:**\n" +
    "`@EZTest create testcase` - Create test case from your last message\n" +
    "`@EZTest list testcases` - List test cases in this project\n" +
    "`@EZTest show testcase TC-101` - Show test case details\n\n" +
    "**Defects:**\n" +
    "`@EZTest add defect` - Create defect from your last message\n\n" +
    "**How to Use:**\n" +
    "1. Post your test case details (e.g., \"Verify user login with valid credentials\")\n" +
    "2. Then type: `@EZTest create testcase`\n" +
    "3. The bot will use your last message to create the test case!\n\n" +
    "**Note:** Works across multiple channels - each channel can be linked to a different EZTest project."
  );
}

/**
 * Send first-time setup card when bot joins channel
 */
export async function sendFirstTimeSetupCard(context: TurnContext): Promise<void> {
  // TODO: Create Adaptive Card for initial setup
  await context.sendActivity(
    "👋 **Welcome to EZTest Teams Bot!**\n\n" +
    "I can help you manage test cases and defects directly from Teams.\n\n" +
    "To get started, use `@EZTest configure` to link this channel to an EZTest project.\n\n" +
    "Type `@EZTest help` for all available commands."
  );
}

