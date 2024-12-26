export const logDebug = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, ...args);
  }
};

export const logInfo = (message: string, ...args: any[]) => {
  console.log(`[INFO] ${message}`, ...args);
};

export const logError = (message: string, ...args: any[]) => {
  console.error(`[ERROR] ${message}`, ...args);
};
