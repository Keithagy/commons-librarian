import { populateEntity } from "../workflow/populateEntity";
import { Vault, VaultPage } from "obsidian-vault-parser";
import { personEntity } from "./1-dummy-schema";
import { Context, EntitySlice, createEntitySlice } from "../workflow/types";

(async () => {
  const ctx = {
    validEntities: new Set([personEntity]),
    existingVault: null as any as Vault,
  } as Context;
  // const personInstance: EntitySlice<typeof personEntity> = {
  //   __type: "Person",
  //   full_name: "John Doe",
  // } satisfies EntitySlice<typeof personEntity>;

  const personInstance = createEntitySlice<typeof personEntity>(personEntity, {
    full_name: "John Doe",
  });

  await populateEntity(ctx, personInstance, {
    content: "John Doe, age 33 is the father of Tim Cook, age 66",
  } as VaultPage);
})();
