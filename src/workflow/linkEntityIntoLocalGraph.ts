import { NotImplementError } from "src/errors";
import { EntitySlice, KnowledgeGraph } from "./types";

export async function linkEntityIntoLocalGraph(
  incoming: EntitySlice,
  localGraph: KnowledgeGraph,
): Promise<void> {
  // TODO: How to decide the links that a new node should have to any/all existing nodes?
  // NOTE: modifies `localGraph` in place

  throw new NotImplementError();
}
