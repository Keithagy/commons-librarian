import { EntityDefinition } from "../schema/entity";
import { Vault } from "obsidian-vault-parser";
import { EntitySlice } from "./EntitySlice";

export * from "./EntitySlice";

export type KnowledgeGraph = Set<EntitySlice<EntityDefinition>>;

export interface Context {
  validEntities: Set<EntityDefinition>;
  existingVault: Vault;
}
