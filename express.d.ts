export interface RequestActor {
      clerkUserId: string;
}

declare global {
      namespace Express {
            interface Request {
                  actor?: RequestActor;
            }
      }
}