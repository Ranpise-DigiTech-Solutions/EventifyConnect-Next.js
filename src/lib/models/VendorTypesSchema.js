import mongoose from "mongoose";

const vendorTypesSchema = new mongoose.Schema({
    vendorType: { type: String, required: true, unique:true},
    vendorTypeDesc: { type: String, required: true },

    // programId: { type: String, required: true },
    // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'serviceprovidermasters', required: true }
}, { timestamps: true });

const vendorTypes = mongoose.model("vendorTypes", vendorTypesSchema);

export default vendorTypes;