import { NotImplementError } from "@/errors";
import { EntityDefinition } from "@/schema/entity";
import { VaultPage } from "obsidian-vault-parser";
import { EntitySlice } from "./types";

export async function initializeEntitiesForType(
  file: VaultPage,
  entDef: EntityDefinition,
): Promise<EntitySlice[]> {
  // NOTE: this pipeline step prefills primary key of nodes, per zod schema def
  throw new NotImplementError();
}
