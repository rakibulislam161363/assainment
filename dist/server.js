
        import { createRequire } from 'module';
        const require = createRequire(import.meta.url)
        

// src/app.ts
import express, { urlencoded } from "express";

// src/modulse/user/user.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTIONSTRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESHTOKEN
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(30) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(50) DEFAULT 'contributor'
             CHECK (role IN ('contributor', 'maintainer')),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues(
      id SERIAL PRIMARY KEY,
      title TEXT,
      description TEXT,
      type VARCHAR(50) CHECK (type IN ('bug','feature_request')),
      status VARCHAR(50) CHECK (status IN ('open','in_progress','resolved')),
      reporter_id INT REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      ) 
      `);
    console.log("database connected succssesfully");
  } catch (error) {
    console.log(error);
  }
};

// src/modulse/user/user.service.ts
import bcrypt from "bcrypt";
var createUserIntoDB = async (payload) => {
  const { name, email, password } = payload;
  const role = payload.role ?? "contributor";
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
    INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING *
    `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var allUsersIntoDB = async () => {
  const result = await pool.query(`
   SELECT * FROM users
  `);
  return result;
};
var singleUserIntoDB = async (id) => {
  const result = await pool.query(`
  SELECT * FROM users WHERE id=$1
  `, [id]);
  return result;
};
var updateUserIntoDB = async (payload, id) => {
  const { name, password } = payload;
  const result = await pool.query(
    `
     UPDATE users 
    SET 
    name=COALESCE($1,name),
    password=COALESCE($2,password)
    WHERE id=$3 RETURNING *
    `,
    [name, password, id]
  );
  delete result.rows[0].password;
  return result;
};
var deleteUserIntoDB = async (id) => {
  const result = await pool.query(`
    DELETE FROM users WHERE id=$1
    `, [id]);
  return result;
};
var userService = {
  createUserIntoDB,
  allUsersIntoDB,
  singleUserIntoDB,
  updateUserIntoDB,
  deleteUserIntoDB
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modulse/user/user.controllar.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "user create successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "user cannot cerated",
      error
    });
  }
};
var getAllUsers = async (req, res) => {
  try {
    const result = await userService.allUsersIntoDB();
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "All users",
      data: result.rows
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "user not found",
      error
    });
  }
};
var getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.singleUserIntoDB(id);
    if (result.rows.length === 0) {
      sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "user not found"
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Single users",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "user not found",
      error
    });
  }
};
var userUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.updateUserIntoDB(req.body, id);
    if (result.rows.length === 0) {
      sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "user not found"
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "updated successfull",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "cannot update user",
      error
    });
  }
};
var deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteUserIntoDB(id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "delete successfull",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "cannot update user",
      error
    });
  }
};
var userControllar = {
  createUser,
  getAllUsers,
  getSingleUser,
  userUpdate,
  deleteUser
};

// src/types/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/middleware/auth.ts
import jwt from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access!"
        });
      }
      const decoded = jwt.verify(
        token,
        config_default.secret
      );
      const userData = await pool.query(
        `SELECT * FROM users WHERE email=$1`,
        [decoded.email]
      );
      if (userData.rows.length === 0) {
        return sendResponse_default(res, {
          statusCode: 404,
          success: false,
          message: "User not found"
        });
      }
      const user = userData.rows[0];
      if (roles.length && !roles.includes(user.role)) {
        return sendResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/modulse/user/user.route.ts
var route = Router();
route.post("/", userControllar.createUser);
route.get("/", auth_default(USER_ROLE.maintainer), userControllar.getAllUsers);
route.get("/:id", userControllar.getSingleUser);
route.put("/:id", userControllar.userUpdate);
route.delete("/:id", userControllar.deleteUser);
var userRoute = route;

// src/modulse/auth/auth.route.ts
import { Router as Router2 } from "express";

// src/modulse/auth/auth.service.ts
import bcrypt2 from "bcrypt";
import jwt2 from "jsonwebtoken";
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt2.compare(
    String(password),
    String(user.password)
  );
  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }
  const jwtpayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    is_active: user.is_active,
    email: user.email
  };
  const accessToken = jwt2.sign(jwtpayload, config_default.secret, {
    expiresIn: "1d"
  });
  const refreshToken2 = jwt2.sign(jwtpayload, config_default.refreshSecret, {
    expiresIn: "1d"
  });
  delete userData.rows[0].password;
  return { accessToken, refreshToken: refreshToken2, user };
};
var generateRefreshToken = async (token) => {
  if (!token) {
    throw new Error("unothrozed");
  }
  const encoded = jwt2.verify(
    token,
    config_default.refreshSecret
  );
  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email=$1
        `,
    [encoded.email]
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
    email: user.email
  };
  const accessToken = jwt2.sign(jwtpayload, config_default.secret, {
    expiresIn: "1d"
  });
  return { accessToken };
};
var authService = {
  loginUserIntoDB,
  generateRefreshToken
};

// src/modulse/auth/auth.controllar.ts
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    const { refreshToken: refreshToken2 } = result;
    res.cookie("refreshToken", refreshToken2, {
      secure: false,
      // In production true
      httpOnly: true,
      sameSite: "lax"
    });
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "login successfull",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "something want wrong please try again",
      error
    });
  }
};
var refreshToken = async (req, res) => {
  try {
    const result = await authService.generateRefreshToken(
      req.cookies.refreshToken
    );
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "access token genarated!",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  loginUser,
  refreshToken
};

// src/modulse/auth/auth.route.ts
var route2 = Router2();
route2.post("/", authController.loginUser);
route2.post("/refresh-token", authController.refreshToken);
var authRoute = route2;

// src/modulse/issues/issues.route.ts
import { Router as Router3 } from "express";

// src/modulse/issues/issues.service.ts
var issuesIntoDB = async (payLoad) => {
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
    [title, description, type, status, reporter_id]
  );
  return result;
};
var allIssuesIntoDB = async (sort) => {
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
var singleIssuesIntoDB = async (id) => {
  const result = await pool.query(`
   SELECT * FROM issues WHERE id=$1
  `, [id]);
  return result;
};
var updateIssuesIntoDB = async (payLoad, id) => {
  const { title, description, type, status } = payLoad;
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
    [title, description, type, status, id]
  );
  return result;
};
var deleteIssuesIntoDB = async (id) => {
  const result = await pool.query(`
    DELETE FROM issues WHERE id=$1
    `, [id]);
  return result;
};
var issuesService = {
  issuesIntoDB,
  allIssuesIntoDB,
  singleIssuesIntoDB,
  updateIssuesIntoDB,
  deleteIssuesIntoDB
};

// src/modulse/issues/issues.controllar.ts
var issuesManage = async (req, res) => {
  try {
    const result = await issuesService.issuesIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "something went problem",
      error
    });
  }
};
var allIssues = async (req, res) => {
  try {
    const sort = req.query.sort || "newest";
    const result = await issuesService.allIssuesIntoDB(sort);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "all issue is here",
      data: result.rows
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "cannot find out all issues",
      error
    });
  }
};
var getSingleIssues = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issuesService.singleIssuesIntoDB(id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "single issues",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "something went problem",
      error
    });
  }
};
var updateIssues = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issuesService.updateIssuesIntoDB(
      req.body,
      id
    );
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "update issues",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "issues cannot update",
      error
    });
  }
};
var deleteIssues = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issuesService.deleteIssuesIntoDB(id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: "issues cannot deleted",
      error
    });
  }
};
var issuesControllar = {
  issuesManage,
  allIssues,
  getSingleIssues,
  updateIssues,
  deleteIssues
};

// src/modulse/issues/issues.route.ts
var route3 = Router3();
route3.post("/", issuesControllar.issuesManage);
route3.get("/", issuesControllar.allIssues);
route3.get("/:id", issuesControllar.getSingleIssues);
route3.patch("/:id", issuesControllar.updateIssues);
route3.delete("/:id", issuesControllar.deleteIssues);
var issuesRoute = route3;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(urlencoded({ extended: true }));
app.use("/api/auth/signup", userRoute);
app.use("/api/users", userRoute);
app.use("/api/users/:id", userRoute);
app.use("/api/users/:id", userRoute);
app.use("/api/users/:id", userRoute);
app.use("/api/auth/login", authRoute);
app.use("/api", authRoute);
app.use("/api/issues", issuesRoute);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Server running on ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map