const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

require("dotenv").config({ path: "//.env" });

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
  }
);

userSchema.virtual("postCount", {
  ref: "Post",
  localField: "_id",
  foreignField: "user",
  count: true,
})

userSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.getToken = function () {
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
    },
    process.env.SECRET_KEY,
    { expiresIn: "12h" }
  );
};

function autoPopulate(next) {
  //this.populate('postCount')
  next();
}

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.pre("find", autoPopulate);
userSchema.pre("findOne", autoPopulate);

module.exports = mongoose.model("User", userSchema);
