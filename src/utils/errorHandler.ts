export const handleError = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as any).message);
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'An unknown error occurred';
  };

  export const logError = (context: string, error: unknown): void => {
    console.error(`❌ ${context}:`, {
      message: handleError(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  };

  export const isPrismaError = (error: unknown): error is { code: string; message: string } => {
    return !!(
      error && 
      typeof error === 'object' && 
      'code' in error && 
      typeof (error as any).code === 'string'
    );
  };

  // Alternative approach with better type checking
export const isPrismaErrorAlt = (error: unknown): error is { code: string; message: string } => {
    if (!error || typeof error !== 'object') {
      return false;
    }
    
    const errorObj = error as Record<string, unknown>;
    return 'code' in errorObj && typeof errorObj.code === 'string';
  };
  
  // Even more specific Prisma error checker
  export const isPrismaUniqueConstraintError = (error: unknown): boolean => {
    return isPrismaError(error) && (error as any).code === 'P2002';
  };
  
  export const isPrismaNotFoundError = (error: unknown): boolean => {
    return isPrismaError(error) && (error as any).code === 'P2025';
  };