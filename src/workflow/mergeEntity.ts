import { EntitySlice } from "./types";
import _ from "lodash";

export async function mergeEntity(
  incoming: EntitySlice,
  existing: EntitySlice,
): Promise<EntitySlice> {
  // TODO: this applies a simple merge strategy: conflicts simply favor the incoming value (existing gets overwritten).
  // A more realistic approach would include a conflict resolution strategy
  return _.merge({}, existing, incoming);
}
