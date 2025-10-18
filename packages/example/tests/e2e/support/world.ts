import { setWorldConstructor } from '@deepracticex/vitest-cucumber';

console.log('[SUPPORT] world.ts loaded');

// Custom World interface
export interface CustomWorld {
  hookExecuted?: boolean;
  initializedData?: {
    message: string;
    timestamp: number;
  };
  getCustomMessage(): string;
  verifyHookExecution(): boolean;
}

// World factory function
setWorldConstructor(function (): CustomWorld {
  console.log('[WORLD] CustomWorld instance created');

  return {
    hookExecuted: undefined,
    initializedData: undefined,

    // Custom method only available if World is loaded from support
    getCustomMessage(): string {
      return 'This method comes from support/world.ts';
    },

    verifyHookExecution(): boolean {
      return this.hookExecuted === true;
    },
  };
});
