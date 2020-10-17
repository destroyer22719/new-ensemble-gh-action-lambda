export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';
export const ifDev = (cb: () => unknown) => {
  if (isDev) return cb();
};
export const ifProd = (cb: () => unknown) => {
  if (isProd) return cb();
};
