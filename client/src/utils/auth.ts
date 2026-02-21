export const isLoggedIn = (): boolean => {
  return Boolean(localStorage.getItem("token"));
};
