const express = require('express');
const { conn } = require('../dbconnect');
const util = require('util');

const queryAsync = util.promisify(conn.query).bind(conn);
const router = express.Router();

// login
// router.post('/', async (req, res) => {
//   try {
//     const { identifier, password } = req.body; 

//     const sql = 'SELECT * FROM users WHERE (phone = ? OR email = ?) AND password = ?';
//     const result = await queryAsync(sql, [identifier, identifier, password]);

//     // If the user exists
//     if (result.length > 0) {
//       res.json({ success: true, user: result[0] });
//     } else {
//       res.json({ success: false, message: 'Invalid phone/email or password' });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// });
router.post("/login", (req, res) => {
  let { phone, password } = req.body;

  // Query for checking if the phone or email exists
  let sql = `
      SELECT * FROM users 
      WHERE email = ? OR phone = ?`;

  sql = mysql.format(sql, [phone, phone]);

  conn.query(sql, (err, result) => {
      if (err) {
          return res.status(500).json({ message: "Internal server error" });
      }

      if (result.length === 0) {
          // If no user found with the given email/phone
          return res.status(401).json({ message: "Email/phone incorrect" });
      }

      // If the user exists, check for password
      let user = result[0]; // Get the first matching user
      let sqlPass = `SELECT * FROM users WHERE uid = ? AND password = ?`;
      sqlPass = mysql.format(sqlPass, [user.uid, password]);

      conn.query(sqlPass, (err, result) => {
          if (err) {
              return res.status(500).json({ message: "Internal server error" });
          }

          if (result.length === 0) {
              return res.status(401).json({ message: "Password incorrect" });
          } else {
              // If both phone/email and password match
              res.status(200).json(result);
          }
      });
  });
});
module.exports = router;
