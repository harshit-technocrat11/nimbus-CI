export const getParam = (param: string | string[] | undefined): string | null => {
  if (Array.isArray(param)) {
    return param[0] ?? null;
  }
  return param ?? null;
};
