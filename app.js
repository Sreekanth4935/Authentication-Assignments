//SOLUTION
const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");

const databasePath = path.join(__dirname, "userData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const validatePassword = (password) => {
  return password.length > 4;
};

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const databaseUser = await database.get(selectUserQuery);

  if (databaseUser === undefined) {
    const createUserQuery = `
     INSERT INTO
      user (username, name, password, gender, location)
     VALUES
      (
       '${username}',
       '${name}',
       '${hashedPassword}',
       '${gender}',
       '${location}'  
      );`;
    if (validatePassword(password)) {
      await database.run(createUserQuery);
      response.send("User created successfully");
    } else {
      response.status(400);
      response.send("Password is too short");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const databaseUser = await database.get(selectUserQuery);

  if (databaseUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(
      password,
      databaseUser.password
    );
    if (isPasswordMatched === true) {
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const databaseUser = await database.get(selectUserQuery);
  if (databaseUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(
      oldPassword,
      databaseUser.password
    );
    if (isPasswordMatched === true) {
      if (validatePassword(newPassword)) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatePasswordQuery = `
          UPDATE
            user
          SET
            password = '${hashedPassword}'
          WHERE
            username = '${username}';`;

        const user = await database.run(updatePasswordQuery);

        response.send("Password updated");
      } else {
        response.status(400);
        response.send("Password is too short");
      }
    } else {
      response.status(400);
      response.send("Invalid current password");
    }
  }
});

module.exports = app;

// OWN CODE
// const express = require("express");
// const app = express();

// const path = require("path");
// const dbFile = path.join(__dirname, "userData.db");
// // console.log(dbFile);

// const { open } = require("sqlite");
// const sqlite3 = require("sqlite3");
// const bcrypt = require("bcrypt");

// app.use(express.json());
// let db = null;

// const initializeDbAndServer = async () => {
//   try {
//     db = await open({
//       filename: dbFile,
//       driver: sqlite3.Database,
//     });
//     app.listen(3000, () => {
//       console.log("Server is running at http://localhost:3000/");
//     });
//   } catch (error) {
//     console.log(`Error is ${error.message}`);
//     process.exit(1);
//   }
// };

// initializeDbAndServer();

// // API 1

// app.post("/register/", async (request, response) => {
//   const { username, name, password, gender, location } = request.body;
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const getUserDetailsQuery = `
//   SELECT
//      *
//   FROM
//     user
//   WHERE
//     username = '${username}';
//   `;
//   const dbResponse = await db.get(getUserDetailsQuery);

//   if (dbResponse === undefined) {
//     const createUserQuery = `
//       INSERT INTO
//                user(username,name,password,gender,location)
//       VALUES(
//           '${username}',
//           '${name}',
//           '${hashedPassword}',
//           '${gender}',
//           '${location}'
//       );`;

//     const lengthOfPassword = password.length;
//     if (lengthOfPassword < 5) {
//       //Scenario 2  If the registrant provides a password with less than 5 characters
//       response.status(400);
//       response.send("Password is too short");
//     } else {
//       await db.run(createUserQuery);
//       //Scenario 3  Successful registration of the registrant
//       response.status(200);
//       response.send("User created successfully");
//     }
//   } else {
//     //Scenario 1  If the username already exists
//     response.status(400);
//     response.send("User already exists");
//   }
// });

// //API 2
// app.post("/login/", async (request, response) => {
//   const { username, password } = request.body;
//   //   console.log(username);
//   const getUserDetailsQuery = `
//   SELECT
//      *
//   FROM
//     user
//   WHERE
//     username = '${username}';
//   `;
//   const dbUser = await db.get(getUserDetailsQuery);
//   //   console.log(dbUser);
//   if (dbUser === undefined) {
//     //Scenario 1  If an unregistered user tries to login
//     response.status(400);
//     response.send("Invalid user");
//   } else {
//     const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
//     if (isPasswordMatched === true) {
//       //Scenario 3  Successful login of the user
//       response.status(200);
//       response.send("Login success!");
//     } else {
//       //Scenario 2 If the user provides incorrect password
//       response.status(400);
//       response.send("Invalid password");
//     }
//   }
// });

// //API 3
// app.put("/change-password/", async (request, response) => {
//   const { username, oldPassword, newPassword } = request.body;
//   const getUserDetailsQuery = `
//     SELECT
//       *
//     FROM
//       user
//     WHERE
//       username = '${username}'
//     `;
//   const dbUser = await db.get(getUserDetailsQuery);
//   //   console.log(dbUser);

//   const isPasswordMatched = await bcrypt.compare(oldPassword, dbUser.password);
//   console.log(isPasswordMatched);
//   if (isPasswordMatched === true) {
//     if (newPassword.length < 5) {
//       //Scenario 2 If the user provides new password with less than 5 characters
//       response.status(400);
//       response.send("Password is too short");
//     } else {
//       const newHashedPassword = await bcrypt.hash(newPassword, 10);
//       const updatePasswordQuery = `
//         UPDATE
//             user
//          SET
//             password = '${newHashedPassword}'
//         WHERE
//             username = '${username}';
//         `;
//       await db.run(updatePasswordQuery);
//       response.status(200);
//       response.send("Password updated");
//     }
//   } else if (isPasswordMatched === false) {
//     response.status(400);
//     response.send("Invalid current password");
//   } else {
//     response.send("user not exist");
//   }
// });

// module.exports = app;
