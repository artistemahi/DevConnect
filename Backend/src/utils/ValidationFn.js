const Validator = require("validator");
const ValidationFn = (req) => {
  const { firstName, lastName, email, password, age } = req.body;
  if (!firstName || !email || !password) {
    throw new Error(" name , email and password are required");
  }
  if (!Validator.isEmail(email)) {
    throw new Error("invalid email");
  }
  if (!Validator.isStrongPassword(password)) {
    throw new Error(
      "password should be " +
        "[ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1, returnScore: false, pointsPerUnique: 1, pointsPerRepeat: 0.5, pointsForContainingLower: 10, pointsForContainingUpper: 10, pointsForContainingNumber: 10, pointsForContainingSymbol: 10 ]",
    );
  }

  //   if (firstName.length < 3 || firstName.length > 20) {
  //     throw new Error("first name should be between 3 and 20 characters");
  //   }  ye bhi schema level pr validation kr rakha h waha se hi error throw ho jayega
  // if(age && age<18){
  //     throw new Error("age should be greater than or equal to 18");
  // }  ye age vala validation db level pr bhi kr rakha h waha se hi error throw ho jayega
};
const validateProfileEdit = (req) => {
  const allowedFields = [
  "firstName",
  "lastName",
  "email",
  "skills",
  "age",
  "gender",
  "about",
  "photoURL",
];
  const fields = Object.keys(req.body || {});
  if (fields.length === 0) {
    throw new Error("No fields provided for update");
  }

  fields.forEach((field) => {
    if (!allowedFields.includes(field)) {
      throw new Error("field is not allowed to update");
    }
  });

  return true;
};
module.exports = { ValidationFn, validateProfileEdit };
