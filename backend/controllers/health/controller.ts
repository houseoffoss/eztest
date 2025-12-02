export class HealthController {
  /**
   * Get health status
   */
  async getHealth() {
    return {
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export const healthController = new HealthController();
