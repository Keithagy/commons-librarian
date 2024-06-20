import { KnowledgeGraph } from "./types";
import { NotImplementError } from "../errors";

export async function mergeLocalGraphIntoGlobalGraph(
  localGraph: KnowledgeGraph,
  globalGraph: KnowledgeGraph,
): Promise<KnowledgeGraph> {
  // TODO: How to decide the links that a new node should have to any/all existing nodes?
  // NOTE: returns a copy of `globalGraph` with `localGraph` merged in
  throw new NotImplementError();
}
