import Campus from "../models/Campus.model.js";

export const getAllCampuses = async (req, res) => {
    try {
        const campuses = await Campus.find({}, "name shortCode emailDomain"); // Select specific fields
        res.json(campuses);
    } catch (error) {
        console.error("Error fetching campuses:", error);
        res.status(500).json({ message: "Server error fetching campuses" });
    }
};
