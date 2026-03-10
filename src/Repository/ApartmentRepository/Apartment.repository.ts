import { Apartment } from "@/models/Apartment.models.js";
import type { ClientSession, Types } from "mongoose";

interface CreateOptions {
  session?: ClientSession;
}

export const ApartmentRepository_Repository = {
  create: async (
    data: {
      apartmentCode: string;
      towerLabel?: string;
      societyId: Types.ObjectId
    },
    options?: CreateOptions
  ): Promise<any> => {
    console.log("Creating apartment with data:", data);
    const docs = await Apartment.create([data], {
      session: options?.session ?? null,
    });

    console.log("Apartment created in repository:", docs);
    return docs[0];

  /*
    // instance method: alternative to create() for more control
    const doc = new Apartment(data);
    await doc.save({ session: options?.session ?? null });
    return doc;
  */
  },
}               