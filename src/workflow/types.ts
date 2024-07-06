import { EntityDefinition } from "../schema/entity";
import { Vault } from "obsidian-vault-parser";
import { EntitySlice } from "./EntitySlice";
import { z } from "zod";

export * from "./EntitySlice";

export type KnowledgeGraph = EntitySlice[];

export interface Context {
  validEntities: Set<EntityDefinition>;
  existingVault: Vault;
}

export const zTextSnippet = z.object({
  type: z.literal("zTextSnippet"),
  content: z.string(),
});

export type TextSnippet = z.infer<typeof zTextSnippet>;
