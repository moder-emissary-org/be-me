import { ServiceError } from "@/error/ServicesErrors/MainCatcher/ServiceError.js";
import { resolveCurrentUser_Service } from "../User/resolveCurrentUserService.service.js";
import { FindApartment_Repository } from "@/repository/ApartmentRepository/FindApartment.repository.js";
import { Types } from "mongoose";
import { visitorRepository } from "@/repository/VisitorRepository/Visitor.repository.js";

export interface createVisitorInput {
    clerkUserId: string;
    name: string;
    purpose: string;
    contactNumber: string;
    apartmentId: string;
    expectedAt: Date;
}

export const createVisitor_Service = async (input: createVisitorInput) => {
    const {
        clerkUserId,
        name,
        purpose,
        contactNumber,
        apartmentId,
        expectedAt,
    } = input;
    const guard = await resolveCurrentUser_Service({ clerkUserId });
    if (guard.authority.role !== "guard") {
        throw new ServiceError(
            "OPERATION_NOT_ALLOWED",
            "Not authorized to create visitor, User is not a guard",
            { clerkUserId }
        )
    };
    if (!guard.user.isActive) {
        throw new ServiceError(
            "OPERATION_NOT_ALLOWED",
            "Not authorized to create visitor, User is not a guard",
            { clerkUserId }
        );
    };

    const apartment = await FindApartment_Repository.findById(apartmentId);
    if (!apartment) {
        throw new ServiceError(
            "APARTMENT_NOT_FOUND",
            "Target apartment does not exist",
            { apartmentId }
        );
    }
    if (apartment.societyId.toString() !== guard.scope.society.id) {
        throw new ServiceError(
            "OPERATION_NOT_ALLOWED",
            "Cannot create visitor outside your society scope",
            { apartmentId, guardSocietyId: guard.scope.society.id }
        );
    }

    if (!name || !purpose || !contactNumber || !expectedAt) {
        throw new ServiceError(
            "SERVICE_INPUT_INVALID",
            "Missing required visitor fields",
            { name, purpose, contactNumber, expectedAt }
        );
    }

    const visitorPayload = {
        name,
        purpose,
        contactNumber,
        apartmentId: new Types.ObjectId(apartmentId),
        societyId: new Types.ObjectId(guard.scope.society.id),
        expectedAt,

        // backend controlled fields
        approvalStatus: "pending" as const,
        visitStatus: "expected" as const,
        approvedBy: null,
        actualEntryAt: null,
        actualExitAt: null,
    };
    const visitor = await visitorRepository.create(visitorPayload);
    return {
        id: visitor._id.toString(),
        name: visitor.name,
        visitStatus: visitor.visitStatus,
        approvalStatus: visitor.approvalStatus,
    }
}