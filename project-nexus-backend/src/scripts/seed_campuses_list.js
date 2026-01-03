import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Campus from "../models/Campus.model.js";

dotenv.config();

const campuses = [
    {
        name: "IIT Bombay",
        shortCode: "IITB",
        emailDomain: "iitb.ac.in",
    },
    {
        name: "IIT Delhi",
        shortCode: "IITD",
        emailDomain: "iitd.ac.in",
    },
    {
        name: "NIT Trichy",
        shortCode: "NITT",
        emailDomain: "nitt.edu",
    },
    {
        name: "NIT Warangal",
        shortCode: "NITW",
        emailDomain: "nitw.ac.in",
    },
    {
        name: "IIT Madras",
        shortCode: "IITM",
        emailDomain: "iitm.ac.in",
    },
];

const seedCampuses = async () => {
    try {
        await connectDB();

        for (const campusData of campuses) {
            const existingCampus = await Campus.findOne({ shortCode: campusData.shortCode });
            if (existingCampus) {
                console.log(`Skipping: ${campusData.name} already exists.`);
            } else {
                await Campus.create(campusData);
                console.log(`Created: ${campusData.name}`);
            }
        }

        console.log("Seeding completed.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding campuses:", error);
        process.exit(1);
    }
};

seedCampuses();
