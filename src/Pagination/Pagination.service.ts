// utils/paginate.ts

import {
  Model,
  Types,
} from "mongoose";
import type { QueryFilter } from "mongoose";
/**
 * Cursor fields allowed for stable pagination.
 * Restricting this prevents accidental pagination
 * on non-indexed or unstable fields.
 */
type CursorField = "createdAt" | "updatedAt";

interface PaginationCursor {
  value: string;
  id: string;
}

interface PaginateOptions<T extends { _id: Types.ObjectId }> {
  model: Model<T>;
  query: QueryFilter<T>;

  limit?: number;
  cursor: string | undefined;

  /**
   * Stable indexed field only.
   * Default: createdAt
   */
  cursorField?: CursorField;

  /**
   * -1 => latest first
   *  1 => oldest first
   */
  sortOrder?: 1 | -1;

  /**
   * Optional populate paths.
   * Keep lightweight.
   */
  populate?: string[];
}

export interface PaginatedResult<T> {
  data: T[];

  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    count: number;
  };
}

const encodeCursor = (cursor: PaginationCursor): string => {
  return Buffer.from(JSON.stringify(cursor)).toString("base64"); // prefer base64url
};

const decodeCursor = (cursor: string): PaginationCursor => {
  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, "base64").toString("utf8") // prefer base64url
    );

    // validation
    if (
      !decoded?.value ||
      !decoded?.id ||
      typeof decoded.value !== "string" ||
      typeof decoded.id !== "string"
    ) {
      throw new Error();
    }

    const parsedDate = new Date(decoded.value);

    if (isNaN(parsedDate.getTime())) {
      throw new Error();
    }

    return decoded;
  } catch {
    throw new Error("Invalid pagination cursor");
  }
};

export async function paginate<
  T extends {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  }
>({
  model,
  query,
  limit = 5,
  cursor,
  cursorField = "createdAt",
  sortOrder = -1,
  populate = [],
}: PaginateOptions<T>): Promise<
  PaginatedResult<T>
> {
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  /**
   * Clone query safely,
   * why we clone, bcz we dont want to mutate the caller’s original query object, and it may be used for other reasons
   */
  const paginatedQuery: QueryFilter<T> = {
    ...query,
  };

  /**
   * Apply cursor conditions,
   * // use the discussion: be-me-docs/Readme/Contracts&Reports/ArchitecturalDecisionsReports/Pagination/cursorConditionDiscussions.D.md
   */
  if (cursor) {
    const decodedCursor = decodeCursor(cursor);

    const cursorDate = new Date(decodedCursor.value);
    const cursorId = new Types.ObjectId(decodedCursor.id);

    const operator = sortOrder === -1 ? "$lt" : "$gt";

    paginatedQuery.$or = [
      {
        [cursorField]: {
          [operator]: cursorDate,
        },
      },
      {
        [cursorField]: cursorDate,
        _id: {
          [operator]: cursorId,
        },
      },
    ];
  }

  /**
   * Stable deterministic sorting,
   * here if we dont use await or .then and console the query when .find fnc is getting used could revel the whole db secrets that we used, means,
   * The reason that the database secrets prints in console is because model.find() does not execute the query immediately. Instead, it returns a Mongoose Query object, which is a complex internal wrapper containing the entire database instance, connection pool, and credentials. to prevent this we must use await or .then bcz they return the results of the query rather than the Query object itself, but we need to build the query first to populate the fields if needed, then execute it at the end of the function after population.
   */
  let dbQuery = model
    .find(paginatedQuery)
    .sort({
      [cursorField]: sortOrder,
      _id: sortOrder,
    })
    .limit(safeLimit + 1) // <--- fetch one extra to detect if there is a next document
    .lean();

  /**
   * Optional population: -> means: “For every requested reference field, replace its ObjectId with full document data.”
   * ref docs: be-me-docs/Readme/Contracts&Reports/ArchitecturalDecisionsReports/Pagination/MongoosePopulationOverFields.D.md
   */
  for (const field of populate) {
    dbQuery = dbQuery.populate(field);
  }

  const results = await dbQuery;

  const hasMore = results.length > safeLimit;

  /**
   * // why don't we use this method, bcz it make a cpoy of original array to perform the action on targeted array
   * const data = hasMore
    ? results.slice(0, safeLimit)
    : results;
   */

  // but this pop method comes with Privileges, it use original array to perfrom action, Intentionally we need that
  if (hasMore) {
    results.pop();
  }
  const data = results;

  /**
   * Generate next cursor
   */
  let nextCursor: string | null = null;

  if (hasMore && data.length > 0) {
    const lastItem = data[data.length - 1];

    if (!lastItem) {
      throw new Error("Pagination invariant violated");
    }

    const cursorValue = lastItem[cursorField];

    if (cursorValue instanceof Date) {
      nextCursor = encodeCursor({
        value: cursorValue.toISOString(),
        id: lastItem._id.toString(),
      });
    }
  }

  return {
    data,

    pagination: {
      nextCursor,
      hasMore,
      count: data.length,
    },
  };
}