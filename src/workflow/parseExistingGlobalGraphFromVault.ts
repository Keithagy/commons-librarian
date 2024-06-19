import { NotImplementError } from "../errors";
import { Vault } from "obsidian-vault-parser";
import { KnowledgeGraph } from "./types";

export function parseExistingGlobalGraphFromVault(
  existingVault: Vault,
): KnowledgeGraph {
  throw new NotImplementError();
}
