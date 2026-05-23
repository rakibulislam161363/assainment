import { pool } from "../../db";

const issuesIntoDB = async (payLoad: any) => {
  const { title, description, type, status, reporter_id } = payLoad;
  const result = await pool.query(
    `
  INSERT INTO issues(
    title,
    description,
    type,
    status,
    reporter_id
  )
  VALUES($1,$2,$3,$4,$5)
  RETURNING *
  `,
    [title, description, type, status, reporter_id],
  );

  return result;
};

export const issuesService = {
  issuesIntoDB,
};
