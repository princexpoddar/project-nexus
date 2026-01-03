import mongoose from "mongoose";

const campusSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        shortCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        emailDomain: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Campus = mongoose.model("Campus", campusSchema);

export default Campus;
