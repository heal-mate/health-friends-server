import User from "../models/user.js";

const userService = {
  async getUsers() {
    const users = await User.find({});

    return users;
  },
};

export default userService;
