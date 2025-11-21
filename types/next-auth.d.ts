import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      roleName: string;
      permissions: string[];
    } & DefaultSession['user'];
  }

  interface User {
    roleName: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    roleName: string;
    permissions: string[];
  }
}
