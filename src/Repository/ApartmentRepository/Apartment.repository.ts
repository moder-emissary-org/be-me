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
    const createOptions = options?.session
      ? { session: options.session }
      : undefined;
    const docs = await Apartment.create([data], createOptions);
    return docs[0];
    /*
      // instance method: alternative to create() for more control.
      const doc = new Apartment(data);
      await doc.save({ session: options?.session ?? null });
      return doc;
    */
  },
}               