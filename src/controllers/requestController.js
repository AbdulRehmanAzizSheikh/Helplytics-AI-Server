import Request from "../models/request.js";

// Dummy AI rules for smart categorization
export const analyzeContent = async (req, res) => {
  try {
    const { text } = req.body;
    let urgency = "Low";
    let category = "General";
    let tags = [];

    const lowerText = text.toLowerCase();
    
    // Urgency detection
    if (lowerText.match(/urgent|asap|deadline|tomorrow|immediately|emergency|quickly/)) {
      urgency = "High";
    } else if (lowerText.match(/soon|need help|stuck/)) {
      urgency = "Medium";
    }

    // Keyword-based categorization
    if (lowerText.match(/react|html|css|js|javascript|frontend|ui/)) {
      category = "Web Development";
      tags.push("Frontend");
    } else if (lowerText.match(/node|express|api|database|mongodb|backend/)) {
      category = "Backend";
      tags.push("Backend");
    } else if (lowerText.match(/figma|design|poster|ux|ui|layout/)) {
      category = "Design";
      tags.push("UI/UX");
    } else if (lowerText.match(/interview|career|resume|portfolio/)) {
      category = "Career";
      tags.push("Career Guidance");
    }

    if (lowerText.includes("react")) tags.push("React");
    if (lowerText.includes("figma")) tags.push("Figma");
    if (lowerText.includes("interview")) tags.push("Interview Prep");

    // Rewrite suggestion
    const rewriteSuggestion = `I'm struggling with ${tags.length > 0 ? tags[0] : 'a problem'}. ${text.substring(0, 50)}... Could someone help me out?`;

    res.status(200).json({
      suggestedCategory: category,
      detectedUrgency: urgency,
      suggestedTags: tags,
      rewriteSuggestion
    });
  } catch (error) {
    res.status(500).json({ message: "Error analyzing text", error: error.message });
  }
};

export const createRequest = async (req, res) => {
  try {
    const { title, description, tags, category, urgency, author } = req.body;
    const newReq = new Request({
      title,
      description,
      tags,
      category,
      urgency,
      author: author || "Ayesha Khan" // default author if none
    });
    await newReq.save();
    res.status(201).json(newReq);
  } catch (error) {
    res.status(500).json({ message: "Error creating request", error: error.message });
  }
};

export const getRequests = async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests", error: error.message });
  }
};

export const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "Error fetching request", error: error.message });
  }
};

export const addHelper = async (req, res) => {
  try {
    const { name, skills } = req.body;
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.helpers.push({ name, skills });
    await request.save();

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "Error adding helper", error: error.message });
  }
};

export const markAsSolved = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "Solved";
    await request.save();

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "Error solving request", error: error.message });
  }
};
