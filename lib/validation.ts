import { z } from "zod";

export const idParamSchema = z.coerce.number().int().positive();

export const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export function parsePagination(searchParams: URLSearchParams) {
  const parsed = paginationSchema.safeParse({
    limit: searchParams.get("limit") ?? undefined,
    offset: searchParams.get("offset") ?? undefined,
  });
  // Falls back to defaults on bad input rather than erroring — pagination
  // params are a convenience, not something worth rejecting requests over.
  return parsed.success ? parsed.data : { limit: 10, offset: 0 };
}
