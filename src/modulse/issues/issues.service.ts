import { pool } from "../../db";
import type { Issues } from "./issues.interface";

const issuesIntoDB = async (payLoad: Issues) => {
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

const allIssuesIntoDB = async (sort: string) => {
  let query = `
    SELECT 
      issues.id,
      issues.title,
      issues.description,
      issues.type,
      issues.status,
      issues.created_at,

      json_build_object(
        'id', users.id,
        'name', users.name,
        'role', users.role
      ) AS reporter

    FROM issues
    JOIN users ON issues.reporter_id = users.id
  `;

  if (sort === "newest") {
    query += ` ORDER BY issues.created_at DESC`;
  }

  if (sort === "oldest") {
    query += ` ORDER BY issues.created_at ASC`;
  }

  const result = await pool.query(query);

  return result;
};

const singleIssuesIntoDB = async(id:string) =>{
 const result = await pool.query(`
   SELECT * FROM issues WHERE id=$1
  `,[id]);
  return result;
};


const updateIssuesIntoDB = async(payLoad: Issues,id: string) => {
  const {title, description,type,status} = payLoad;
   const result = await pool.query(
    `
    UPDATE issues 
    SET 
    title=COALESCE($1,title),
    description=COALESCE($2,description),
    type=COALESCE($3,type),
    status=COALESCE($4,status) 

    WHERE id=$5 RETURNING *
    `,
    [title, description,type,status,id],
  );

  return result;
};

const deleteIssuesIntoDB = async(id: string) =>{
  const result = await pool.query(`
    DELETE FROM issues WHERE id=$1
    `,[id]);
    return result;
}

export const issuesService = {
  issuesIntoDB,
  allIssuesIntoDB,
  singleIssuesIntoDB,
  updateIssuesIntoDB,
  deleteIssuesIntoDB
};
