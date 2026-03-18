import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
  const hashedPass = await bcrypt.hash(password, 10);
  return hashedPass;
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};