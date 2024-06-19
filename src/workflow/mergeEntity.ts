import { NotImplementError } from "@/errors";
import { EntitySlice } from "./types";

export async function mergeEntity(
  incoming: EntitySlice,
  existing: EntitySlice,
): Promise<EntitySlice> {
  // TODO: identify specific merging strategy
  throw new NotImplementError();
}
