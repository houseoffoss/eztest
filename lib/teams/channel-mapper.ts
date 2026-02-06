import { prisma } from "@/lib/prisma";

/**
 * Maps Teams channel IDs to EZTest project IDs
 * Queries the TeamsChannelConfig table
 */

/**
 * Get the EZTest project ID for a Teams channel
 * Returns null if channel is not configured
 */
export async function getProjectIdForChannel(channelId: string): Promise<string | null> {
  try {
    const config = await prisma.teamsChannelConfig.findUnique({
      where: { channelId },
      select: { projectId: true },
    });

    if (!config) {
      console.log(`⚠️ Channel ${channelId} not configured with EZTest project`);
      return null;
    }

    return config.projectId;
  } catch (error) {
    console.error(`Error getting project for channel ${channelId}:`, error);
    return null;
  }
}

/**
 * Check if a channel is already configured
 */
export async function isChannelConfigured(channelId: string): Promise<boolean> {
  try {
    const config = await prisma.teamsChannelConfig.findUnique({
      where: { channelId },
    });

    return !!config;
  } catch (error) {
    console.error(`Error checking channel config ${channelId}:`, error);
    return false;
  }
}

/**
 * Store or update channel configuration
 */
export async function configureChannel(
  channelId: string,
  teamId: string,
  projectId: string,
  configuredBy: string
): Promise<boolean> {
  try {
    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) {
      console.error(`Project ${projectId} does not exist`);
      return false;
    }

    // Create or update configuration
    await prisma.teamsChannelConfig.upsert({
      where: { channelId },
      update: {
        projectId,
        configuredBy,
      },
      create: {
        channelId,
        teamId,
        projectId,
        configuredBy,
      },
    });

    console.log(`✓ Configured channel ${channelId} with project ${projectId}`);
    return true;
  } catch (error) {
    console.error(`Error configuring channel ${channelId}:`, error);
    return false;
  }
}

/**
 * Get channel configuration details
 */
export async function getChannelConfig(channelId: string) {
  try {
    const config = await prisma.teamsChannelConfig.findUnique({
      where: { channelId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return config;
  } catch (error) {
    console.error(`Error getting channel config ${channelId}:`, error);
    return null;
  }
}

/**
 * Delete/unconfigure a channel
 */
export async function unconfigureChannel(channelId: string): Promise<boolean> {
  try {
    await prisma.teamsChannelConfig.delete({
      where: { channelId },
    });

    console.log(`✓ Unconfigured channel ${channelId}`);
    return true;
  } catch (error) {
    console.error(`Error unconfiguring channel ${channelId}:`, error);
    return false;
  }
}

