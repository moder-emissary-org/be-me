import { ServiceError } from "@/error/ServicesErrors/MainCatcher/ServiceError.js";
import { resolveCurrentUser_Service } from "../User/resolveCurrentUserService.service.js";
import { Types } from "mongoose";
import { visitorRepository } from "@/repository/VisitorRepository/Visitor.repository.js";
import { apartmentRepository } from "@/repository/ApartmentRepository/Apartment.repository.js";

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

    const actor = await resolveCurrentUser_Service({ clerkUserId });
    if (actor.authority.role !== "guard") {
        throw new ServiceError(
            "OPERATION_NOT_ALLOWED",
            "Not authorized to create visitor, User is not a guard",
            { clerkUserId }
        );
    };
    if (!actor.user.isActive) {
        throw new ServiceError(
            "OPERATION_NOT_ALLOWED",
            "Not authorized to create visitor, User is not a guard",
            { clerkUserId }
        );
    };

    const apartment = await apartmentRepository.findById(apartmentId);
    if (!apartment) {
        throw new ServiceError(
            "APARTMENT_NOT_FOUND",
            "Target apartment does not exist",
            { apartmentId }
        );
    };
    if (!apartment.societyId.equals(actor.scope.society.id)) {
        throw new ServiceError(
            "OPERATION_NOT_ALLOWED",
            "Cannot create visitor outside your society scope",
            { apartmentId, guardSocietyId: actor.scope.society.id }
        );
    };

    if (!name || !purpose || !contactNumber || !expectedAt) {
        throw new ServiceError(
            "SERVICE_INPUT_INVALID",
            "Missing required visitor fields",
            { name, purpose, contactNumber, expectedAt }
        );
    };

    const visitorPayload = {
        name,
        purpose,
        contactNumber,
        apartmentId: new Types.ObjectId(apartmentId),
        societyId: new Types.ObjectId(actor.scope.society.id),
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
  };
};

/** Resident-facing transition only: pending → approved | rejected (system owns pending). */
export const VISITOR_RESIDENT_APPROVAL_DECISIONS = [
  "approved",
  "rejected",
] as const;

export type VisitorResidentApprovalDecision =
  (typeof VISITOR_RESIDENT_APPROVAL_DECISIONS)[number];

function isVisitorResidentApprovalDecision(
  value: string,
): value is VisitorResidentApprovalDecision {
  return (VISITOR_RESIDENT_APPROVAL_DECISIONS as readonly string[]).includes(
    value,
  );
}

export interface updateVisitorApprovalStatusInput {
  clerkUserId: string;
  visitorId: Types.ObjectId;
  approvalStatus: string; /** Raw from HTTP body; validated and narrowed inside the service */
}

// service discussions /be-me-docs/Readme/Contracts&Reports/ArchitecturalDecisionsReports/visitor/ApprovalStatusSystemFlow.Report.md
export const updateVisitorApprovalStatus_Service = async (
  input: updateVisitorApprovalStatusInput,
) => {
  const { clerkUserId, visitorId, approvalStatus: rawApprovalStatus } = input;

  // TODO: make a seperate valodators + policy file for that stuff.
  const decision =
    typeof rawApprovalStatus === "string" ? rawApprovalStatus.trim() : "";

  if (!isVisitorResidentApprovalDecision(decision)) {
    throw new ServiceError(
      "SERVICE_INPUT_INVALID",
      "approvalStatus must be approved or rejected",
      { approvalStatus: rawApprovalStatus },
    );
  }

  const actor = await resolveCurrentUser_Service({ clerkUserId });
  if (!actor.scope.apartment) {
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "Not authorized to update visitor approval status, User does not have an apartment",
      { clerkUserId },
    );
  }
  if (actor.authority.role !== "resident") {
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "Not authorized to update visitor approval status, User is not a resident",
      { clerkUserId },
    );
  }
  if (!actor.user.isActive) {
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "Not authorized to update visitor approval status, User is not active",
      { clerkUserId },
    );
  }

  const approvedBy = new Types.ObjectId(actor.user.id);

  const visitor = await visitorRepository.findById(visitorId);
  if (!visitor) {
    throw new ServiceError("VISITOR_NOT_FOUND", "Visitor not found", {
      visitorId,
    });
  }
  if (visitor.approvalStatus !== "pending") {
    throw new ServiceError(
      "INVALID_VISITOR_APPROVAL_TRANSITION",
      "Visitor approval decision already finalized",
      {
        visitorId,
        currentApprovalStatus: visitor.approvalStatus,
      },
    );
  }
  if (!visitor.societyId.equals(actor.scope.society.id)) {
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "Not authorized to update visitor approval status, Visitor does not belong to this society",
      { visitorId, residentSocietyId: actor.scope.society.id },
    );
  }
  if (!visitor.apartmentId.equals(actor.scope.apartment.id)) {
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "Not authorized to update visitor approval status, Visitor does not belong to this apartment",
      { visitorId, residentApartmentId: actor.scope.apartment.id },
    );
  }

  await visitorRepository.updateApprovalStatus({
    visitorId,
    approvalStatus: decision,
    approvedBy,
  });
};

export interface getPendingVisitorsForResidentInput {
  clerkUserId: string;
  cursor: string | undefined;
  limit: number;
}

export const getPendingVisitorsForResident_Service = async (
  input: getPendingVisitorsForResidentInput,
) => {
  const { clerkUserId } = input;

  const actor = await resolveCurrentUser_Service({ clerkUserId });
  if (!actor.user.isActive) {
    throw new ServiceError(
      "USER_INACTIVE",
      "Inactive user cannot fetch visitors",
      { clerkUserId },
    );
  }
  if (actor.authority.role !== "resident") {
    throw new ServiceError(
      "OPERATION_NOT_ALLOWED",
      "Only residents can access pending visitors",
      { clerkUserId },
    );
  }
  if (!actor.scope.apartment) {
    throw new ServiceError(
      "APARTMENT_NOT_FOUND",
      "Resident is not assigned to an apartment",
      { clerkUserId },
    );
  }

  const visitors = await visitorRepository.findPendingByApartment({
    societyId: actor.scope.society.id,
    apartmentId: actor.scope.apartment.id,
    limit: input.limit,
    cursor: input.cursor,
  });

  if (!visitors) {
    throw new ServiceError("VISITOR_NOT_FOUND", "No pending visitors found", {
      residentApartmentId: actor.scope.apartment.id,
    });
  }
  return visitors;
};
