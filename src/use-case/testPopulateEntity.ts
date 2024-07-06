import { populateEntity } from "../workflow/populateEntity";
import { Vault } from "obsidian-vault-parser";
import { personEntity } from "./1-dummy-schema";
import {
  Context,
  EntitySlice,
  TextSnippet,
  createEntitySlice,
} from "../workflow/types";

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

  await populateEntity(personInstance, {
    content: "John Doe, age 33 is the father of Tim Cook, age 66",
  } as TextSnippet);
})();
