export const isMongoDuplicateError = (err: any): boolean => {
  return err?.code === 11000;
};