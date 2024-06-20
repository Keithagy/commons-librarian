import { populateEntity } from "../workflow/populateEntity";
import { Vault, VaultPage } from "obsidian-vault-parser";
import { personEntity } from "./index";
import { Context, EntitySlice } from "../workflow/types";

(async () => {
  const ctx = {
    validEntities: new Set([personEntity]),
    existingVault: null as any as Vault,
  } as Context;
  const personInstance: EntitySlice<typeof personEntity> = {
    __type: "Person",
    full_name: "John Doe",
  } satisfies EntitySlice<typeof personEntity>;

  await populateEntity(ctx, personInstance, {
    content: "John Doe is the father of Tim Cook",
  } as VaultPage);
})();
