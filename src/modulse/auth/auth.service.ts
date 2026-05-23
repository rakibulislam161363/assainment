import bcrypt from "bcrypt";
import { pool } from "./../../db/index";

import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";

const loginUserIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email],
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }

  // 2. Compare the password -> Done
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(
    String(password),
    String(user.password),
  );

  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }

  //3. Generate Token
  const jwtpayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    is_active: user.is_active,
    email: user.email,
  };

  const accessToken = jwt.sign(jwtpayload, config.secret as string, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign(jwtpayload, config.refreshSecret as string, {
    expiresIn: "1d",
  });

  return { accessToken, refreshToken };
};

const generateRefreshToken = async (token: string) => {
  if (!token) {
    throw new Error("unothrozed");
  }

  const encoded = jwt.verify(
    token as string,
    config.refreshSecret as string,
  ) as JwtPayload;

  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email=$1
        `,
    [encoded.email],
  );

  if (userData.rows.length === 0) {
    throw new Error("user not found");
  }
  const user = userData.rows[0];

  const jwtpayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    is_active: user.is_active,
    email: user.email,
  };

  const accessToken = jwt.sign(jwtpayload, config.secret as string, {
    expiresIn: "1d",
  });


  return {accessToken};
};

export const authService = {
  loginUserIntoDB,
  generateRefreshToken,
};