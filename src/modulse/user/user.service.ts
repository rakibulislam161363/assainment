import { pool } from "../../db";
import bcrypt from "bcrypt";
import type { Iuser } from "./user.interface";

const createUserIntoDB = async (payload: Iuser) => {
  const { name, email, password } = payload;
  const role = payload.role ?? "contributor";
  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING *
    `,
    [name, email, hashPassword, role],
  );
  delete result.rows[0].password;

  return result;
};

const allUsersIntoDB = async () => {
  const result = await pool.query(`
   SELECT * FROM users
  `);

  return result;
};

const singleUserIntoDB = async(id: string)=>{
 const result = await pool.query(`
  SELECT * FROM users WHERE id=$1
  `,[id]);
  return result;
};

const updateUserIntoDB = async(payload:Iuser,id: string) =>{
  const {name,password} = payload;
  const result = await pool.query(`
     UPDATE users 
    SET 
    name=COALESCE($1,name),
    password=COALESCE($2,password)
    WHERE id=$3 RETURNING *
    `,
    [name, password, id],
  );
  delete result.rows[0].password;
    
  return result;
};

const deleteUserIntoDB = async(id:string) =>{
  const result = await pool.query(`
    DELETE FROM users WHERE id=$1
    `, [id])

  return result;
}
export const userService = {
  createUserIntoDB,
  allUsersIntoDB,
  singleUserIntoDB,
  updateUserIntoDB,
  deleteUserIntoDB
};
