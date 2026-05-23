import { pool } from "../../db";

const issuesIntoDB = async (payLoad: any) => {
  const { title, description, type, status, reporter } = payLoad;
  const result = await pool.query(
    `
  INSERT INTO issues(
    title,
    description,
    type,
    status,
    reporter
  )
  VALUES($1,$2,$3,$4,$5)
  RETURNING *
  `,
    [title, description, type, status, reporter],
  );

  const issue = await pool.query(
    `
  SELECT 
    issues.*,

    json_build_object(
      'id', users.id,
      'name', users.name,
      'role', users.role
    ) AS reporter

  FROM issues
  JOIN users ON issues.reporter = users.id
  WHERE issues.id = $1
  `,
    [result.rows[0].id],
  );
  return issue;
};

export const issuesService = {
  issuesIntoDB,
};
