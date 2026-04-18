import User from "../models/user.js";

export const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({ username, email, password });

    await newUser.save();

    res.status(201).json({ message: "User add hogaya!", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error aya!", error: error.message });
  }
};
