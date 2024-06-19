import { NotImplementError } from "@/errors";
import { EntityDefinition } from "@/schema/entity";
import { VaultPage } from "obsidian-vault-parser";

export async function determineIfEntityTypePresent(
  file: VaultPage,
  entDef: EntityDefinition,
): Promise<boolean> {
  throw new NotImplementError();
}
