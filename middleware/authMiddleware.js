import jwt from "jsonwebtoken";
import { getUserBySin } from "../modules/data-service-auth.js";
import { client } from "../modules/database.js";

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check if the jwt exists
  if (token) {
    jwt.verify(token, "rhf%7<#Y5U1££cKx(3=q{LCF3c", (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect("/");
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect("/");
  }
};

const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(
      token,
      "rhf%7<#Y5U1££cKx(3=q{LCF3c",
      async (err, decodedToken) => {
        if (err) {
          console.log(err.message);
          res.locals.user = null;
          next();
        } else {
          console.log(decodedToken);
          let user = await getUserBySin(client, decodedToken.id);
          console.log(user._id);
          res.locals.user = user;
          next();
        }
      }
    );
  } else {
    res.locals.user = null;
    next();
  }
};

export { requireAuth, checkUser };
