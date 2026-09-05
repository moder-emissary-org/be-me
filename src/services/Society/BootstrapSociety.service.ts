import { ServiceError } from "@/error/ServicesErrors/MainCatcher/ServiceError.js";
import { SystemError } from "@/error/SystemError/System.Error.js";
import { societyRepository_Repository } from "@/repository/SocietyRepository/Society.repository.js";
import { userRepository } from "@/repository/UserRepository/User.repository.js";
import mongoose from "mongoose";

interface BootstrapInput { /** service input assembled by its controller */
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

  /**
   * Prevent duplicate local application users before starting
   * the society bootstrap transaction.
   *
   * Mongoose's unique index on `clerkUserId` provides the
   * database-level duplicate protection, while this service-level
   * check allows us to return a meaningful business error.
  */
  const existingUser =
    await userRepository.findByClerkUserId(input.clerkUserId);

  if (existingUser) {
    throw new ServiceError(
      "USER_ALREADY_REGISTERED",
      "A local user already exists for this Clerk account.",
      { clerkUserId: input.clerkUserId }
    );
  }

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

    if (!society) {
      throw new ServiceError(
        'SOCIETY_CREATION_FAILED',
        'Failed to create society during bootstrap.',
        { input }
      );
    }

    const adminUser = await userRepository.createUser(
      {
        clerkUserId: input.clerkUserId,
        role: "admin",
        societyId: society._id,
        isActive: true,
        email: input.email,
        fullName: input.fullName,
        apartmentId: null
      },
      { session }
    );
    if (!adminUser) {
      throw new SystemError(
        'ADMIN_USER_CREATION_FAILED',
        'Failed to create admin user during bootstrap.',
        { input }
      );
    }

    await session.commitTransaction();

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