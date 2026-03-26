import { Society } from "@/models/society.models.js";
import type { Types } from "mongoose";

export const FindSociety_repository = {
  findById: async (id: Types.ObjectId | string) => Society.findById(id).lean(),
}

