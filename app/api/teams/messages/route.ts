import { NextRequest } from 'next/server';
import { teamsAdapter } from '@/lib/teams/adapter';
import { handleTeamsMessage } from '@/lib/teams/handler';

/**
 * POST /api/teams/messages
 * Teams Bot Webhook Endpoint
 *
 * This endpoint receives all messages and events from Microsoft Teams
 * and forwards them to the Bot Framework adapter.
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw request body
    const body = await request.text();

    // Get headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Process activity through Teams adapter
    return new Promise<Response>((resolve) => {
      // Create a mock request object for the adapter
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockRequest: any = {
        body,
        headers,
        method: 'POST',
        url: '',
      };

      // Create a mock response object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockResponse: any = {
        send: (status: number, body?: BodyInit | null) => {
          const response = new Response(body || '', {
            status: status || 200,
            headers: {
              'Content-Type': 'application/json',
            },
          });
          resolve(response);
        },
        end: () => {
          resolve(new Response('', { status: 200 }));
        },
      };

      // Process the activity
      teamsAdapter.processActivity(
        mockRequest,
        mockResponse,
        async (context) => {
          try {
            // Handle the message
            await handleTeamsMessage(context);
          } catch (error) {
            console.error('Error in message handler:', error);
            throw error;
          }
        }
      );

      // Timeout - resolve after 30 seconds if nothing sent
      setTimeout(() => {
        resolve(
          new Response(JSON.stringify({ error: 'Timeout' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }, 30000);
    });
  } catch (error) {
    console.error('Teams bot webhook error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * GET /api/teams/messages
 * Simple health / verification endpoint.
 *
 * Microsoft Teams may send a verification challenge during setup.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');

  if (challenge) {
    return new Response(challenge, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  return new Response('Teams Bot Webhook Endpoint', {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

