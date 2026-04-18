import Message from "../models/Message.js";

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { senderId, senderName, receiverId, receiverName, text } = req.body;
    const msg = new Message({ senderId, senderName, receiverId, receiverName, text });
    await msg.save();
    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};

// Get messages for a user
export const getMessages = async (req, res) => {
  try {
    const userId = req.params.userId;
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
};

// Get all messages (for demo)
export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
};
