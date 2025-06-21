const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    console.log("🔍 Incoming Request:");
    console.log("🔹 Method:", req.method);
    console.log("🔹 URL:", req.originalUrl);
    console.log("🔹 Headers:", req.headers);

    // Ensure authorization header exists
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        console.log("❌ No 'Authorization' header present");
        return res.status(401).json({ message: "Access denied: No authorization header provided" });
    }

    // Extract Bearer Token
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
        console.log("❌ No token found in the Authorization header");
        return res.status(401).json({ message: "Access denied: No token provided" });
    }

    try {
        console.log("🔹 Extracted Token:", token);

        // Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Decoded JWT Payload:", decoded);

        if (!decoded.userId) {
            console.log("❌ Token structure is incorrect. Missing 'userId'");
            return res.status(403).json({ message: "Invalid token structure" });
        }

        // Attach user details to request object
        req.user = {
            id: decoded.userId, 
            username: decoded.username,
            isAdmin: decoded.isAdmin || false
        };

        console.log("✅ User Authorized:", req.user);
        next();
    } catch (error) {
        console.error("❌ JWT verification failed:", error.message);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;
