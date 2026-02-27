import { ServiceError } from "@/Error/ServicesErrors/MainCatcher/ServiceError.js";
import { SystemError } from "@/Error/SystemError/System.Error.js";
import { societyRepository_Repository } from "@/Repository/SocietyRepository/Society.repository.js";
import { UserRepository_Repository } from "@/Repository/userRepository/UserRepository.repository.js";
import mongoose from "mongoose";

interface BootstrapInput {
  name: string;
  address: string;
  clerkUserId: string;
  email: string;
  fullName: string;
}

interface BootstrapOutput {
  societyId: string;
  adminUserId: string;
}

export const bootstrapSociety_Service = async (input: BootstrapInput): Promise<BootstrapOutput> => {

  console.log("BootstrapSocietyService called with input:", input);

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    /*
    const existingSocietyCount = await societyRepository_Repository.count({ session });

    if (existingSocietyCount > 0) {
      throw new ServiceError(
        "SOCIETY_ALREADY_BOOTSTRAPPED",
        "A society has already been bootstrapped. Multiple societies are not allowed.",
        { existingSocietyCount }
      )
    }
    */

    const society = await societyRepository_Repository.create(
      {
        name: input.name.trim(),
        address: input.address.trim(),
      },
      { session }
    ); 

    console.log("Society created:", society);

    if (!society) {
      throw new ServiceError(
        'SOCIETY_CREATION_FAILED',
        'Failed to create society during bootstrap.',
        { input}
      );
    }

    const adminUser = await UserRepository_Repository.create(
      {
        clerkUserId: input.clerkUserId,
        role: "admin",
        societyId: society._id,
        isActive: true,
        email: input.email,
        fullName: input.fullName,
      },
      { session }
    );

    console.log("Admin user created:", adminUser);

    if (!adminUser) {
      throw new SystemError(
        'ADMIN_USER_CREATION_FAILED',
        'Failed to create admin user during bootstrap.',
        { input }
      );
    }

    await session.commitTransaction();

    console.log("BootstrapSocietyService completed successfully:");
    return {
      societyId: society._id.toString(),
      adminUserId: adminUser._id.toString(),
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}