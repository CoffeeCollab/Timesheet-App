import jwt from "jsonwebtoken";

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check if the jwt exists
  if (token) {
    jwt.verify(token, "rhf%7<#Y5U1££cKx(3=q{LCF3c", (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect("/");
      } else {
        next();
      }
    });
  } else {
    res.redirect("/");
  }
};

export default requireAuth;
