import { Vault } from "obsidian-vault-parser";
import { KnowledgeGraph } from "./types";

export async function persist(
  newGlobalGraph: KnowledgeGraph,
  ouputVault: Vault,
): Promise<void> {
  // NOTE: this is just the commit step
}
