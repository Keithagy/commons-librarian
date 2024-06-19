import { NotImplementError } from "@/errors";
import { EntitySlice, KnowledgeGraph } from "./types";

export async function retrieveEntity(
  searchTarget: EntitySlice,
  existingGlobalGraph: KnowledgeGraph,
): Promise<EntitySlice | null> {
  // NOTE: we are passing in entire EntitySlice given that we don't know yet which fields we'll need to triangulate against
  // e.g. alias keys?
  // should expect this function to make use of definition-specific type narrowing
  throw new NotImplementError();
}
