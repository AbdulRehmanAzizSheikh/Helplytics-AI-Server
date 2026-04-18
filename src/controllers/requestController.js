import Request from "../models/request.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// ===== AI ANALYZE (Keyword-based categorization, tag suggestion, urgency detection, rewrite) =====
export const analyzeContent = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text required" });

    let urgency = "Low";
    let category = "General";
    let tags = [];
    const lowerText = text.toLowerCase();

    // Urgency detection
    if (lowerText.match(/urgent|asap|deadline|tomorrow|immediately|emergency|quickly|tonight/))
      urgency = "High";
    else if (lowerText.match(/soon|need help|stuck|struggling|confused/))
      urgency = "Medium";

    // Keyword-based categorization
    if (lowerText.match(/react|html|css|javascript|js|frontend|ui|vite|next/)) {
      category = "Web Development";
      tags.push("Frontend");
    }
    if (lowerText.match(/node|express|api|database|mongodb|backend|server/)) {
      category = category === "General" ? "Backend" : category;
      tags.push("Backend");
    }
    if (lowerText.match(/figma|design|poster|ux|layout|color|typography/)) {
      category = category === "General" ? "Design" : category;
      tags.push("UI/UX");
    }
    if (lowerText.match(/interview|career|resume|portfolio|internship|job/)) {
      category = category === "General" ? "Career" : category;
      tags.push("Career Guidance");
    }

    // Specific tag suggestions
    if (lowerText.includes("react")) tags.push("React");
    if (lowerText.includes("figma")) tags.push("Figma");
    if (lowerText.includes("css")) tags.push("CSS");
    if (lowerText.includes("responsive")) tags.push("Responsive");
    if (lowerText.includes("interview")) tags.push("Interview Prep");
    if (lowerText.includes("portfolio")) tags.push("Portfolio");
    if (lowerText.includes("mongodb")) tags.push("MongoDB");

    // Remove duplicates
    tags = [...new Set(tags)];

    // Rewrite suggestion
    const rewriteSuggestion = text.length > 20
      ? `I need help with ${category}. ${text.substring(0, 80)}... Looking for someone experienced in ${tags.length > 0 ? tags.join(", ") : "this area"} to guide me.`
      : "Start describing the challenge to generate a stronger version.";

    res.status(200).json({
      suggestedCategory: category,
      detectedUrgency: urgency,
      suggestedTags: tags,
      rewriteSuggestion,
    });
  } catch (error) {
    res.status(500).json({ message: "Error analyzing text", error: error.message });
  }
};

// ===== CREATE REQUEST =====
export const createRequest = async (req, res) => {
  try {
    const { title, description, tags, category, urgency, authorId, authorName } = req.body;

    // Generate AI summary
    const aiSummary = `${urgency} urgency ${category} request. ${
      tags && tags.length > 0
        ? `Best suited for members with expertise in ${tags.join(", ")}.`
        : "General community support needed."
    }`;

    const newReq = new Request({
      title,
      description,
      tags: tags || [],
      category: category || "General",
      urgency: urgency || "Medium",
      authorId,
      authorName: authorName || "Anonymous",
      aiSummary,
    });
    await newReq.save();

    // Notification for the author
    if (authorId) {
      await Notification.create({
        userId: authorId,
        text: `Your request "${title}" is now live in the community feed.`,
        type: "Request",
      });
    }

    res.status(201).json(newReq);
  } catch (error) {
    res.status(500).json({ message: "Error creating request", error: error.message });
  }
};

// ===== GET ALL REQUESTS (with query filters) =====
export const getRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category && req.query.category !== "All") filter.category = req.query.category;
    if (req.query.urgency && req.query.urgency !== "All") filter.urgency = req.query.urgency;
    if (req.query.status && req.query.status !== "All") filter.status = req.query.status;

    const requests = await Request.find(filter).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests", error: error.message });
  }
};

// ===== GET SINGLE REQUEST =====
export const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "Error fetching request", error: error.message });
  }
};

// ===== I CAN HELP — add helper =====
export const addHelper = async (req, res) => {
  try {
    const { userId, name, skills } = req.body;
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.helpers.push({ userId, name, skills });
    await request.save();

    // Increase helper trust score & contributions
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $inc: { contributions: 1, trustScore: 2 },
      });
    }

    // Notification for the request author
    if (request.authorId) {
      await Notification.create({
        userId: request.authorId,
        text: `${name} offered help on "${request.title}"`,
        type: "Match",
      });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "Error adding helper", error: error.message });
  }
};

// ===== MARK AS SOLVED =====
export const markAsSolved = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "Solved";
    await request.save();

    // Give badges to helpers
    for (const helper of request.helpers) {
      if (helper.userId) {
        const user = await User.findById(helper.userId);
        if (user) {
          user.trustScore = Math.min(100, user.trustScore + 5);
          user.contributions += 1;
          if (user.contributions >= 5 && !user.badges.includes("Fast Responder"))
            user.badges.push("Fast Responder");
          if (user.contributions >= 10 && !user.badges.includes("Top Mentor"))
            user.badges.push("Top Mentor");
          if (user.trustScore >= 80 && !user.badges.includes("Trusted Helper"))
            user.badges.push("Trusted Helper");
          await user.save();
        }
      }
    }

    // Give requester badge
    if (request.authorId) {
      const author = await User.findById(request.authorId);
      if (author) {
        author.contributions += 1;
        if (!author.badges.includes("Active Learner")) author.badges.push("Active Learner");
        await author.save();
      }

      await Notification.create({
        userId: request.authorId,
        text: `"${request.title}" was marked as solved!`,
        type: "Status",
      });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "Error solving request", error: error.message });
  }
};

// ===== DELETE REQUEST (Admin) =====
export const deleteRequest = async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting", error: error.message });
  }
};

// ===== AI CENTER — trends & insights =====
export const getAiInsights = async (req, res) => {
  try {
    const totalRequests = await Request.countDocuments();
    const openRequests = await Request.countDocuments({ status: "Open" });
    const solvedRequests = await Request.countDocuments({ status: "Solved" });
    const highUrgency = await Request.countDocuments({ urgency: "High" });
    const totalHelpers = await User.countDocuments({ contributions: { $gt: 0 } });

    // Top category
    const categories = await Request.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    const topCategory = categories.length > 0 ? categories[0]._id : "General";

    // Recent open requests as recommendations
    const recommendations = await Request.find({ status: "Open" })
      .sort({ urgency: -1, createdAt: -1 })
      .limit(5)
      .select("title description category urgency tags aiSummary");

    res.status(200).json({
      totalRequests,
      openRequests,
      solvedRequests,
      highUrgency,
      totalHelpers,
      topCategory,
      recommendations,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
