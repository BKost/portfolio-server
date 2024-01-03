const nodemailer = require("nodemailer");

// Testing setup with Ethereal
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "brenda.rempel44@ethereal.email",
    pass: "mGVHa5V6Gwd3ZfhNfX",
  },
});

// const message = {
//   from: "my-project@server",
//   to: "brenda.rempel44@ethereal.email",
//   subject: `Registered new user: ${user_name}`,
//   text: `Thank you for registering ${first_name} ${last_name}`,
//   html: "<p style:'color: red' >HTML vesrion of the message</p>",
// };

// transporter.sendMail(message, (err) => {
//   if (err) {
//     console.log(err);
//     return res.status(500).json({ msg: "Error sending email" });
//   }
// });

module.exports = transporter;
