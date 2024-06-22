import { EntityDefinition } from "../schema/entity";
import { Vault } from "obsidian-vault-parser";
import { EntitySlice } from "./EntitySlice";

export * from "./EntitySlice";

export type KnowledgeGraph = EntitySlice[];

export interface Context {
  validEntities: Set<EntityDefinition>;
  existingVault: Vault;
}
