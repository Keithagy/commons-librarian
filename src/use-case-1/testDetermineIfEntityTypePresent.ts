import { VaultPage } from "obsidian-vault-parser";
import { personEntity } from "./index";
import { determineIfEntityTypePresent } from "src/workflow/determineIfEntityTypePresent";

(async () => {
  await determineIfEntityTypePresent(
    {
      content:
        "Mario Johns and Luigi Antetokunmpo are brothers, and they hail from the Nintendo universe.",
    } as VaultPage,
    personEntity,
  );
  await determineIfEntityTypePresent(
    {
      content:
        "Mario and Luigi are brothers, and they hail from the Nintendo universe.",
    } as VaultPage,
    personEntity,
  );
  await determineIfEntityTypePresent(
    {
      content: "The sun rises from the east every day.",
    } as VaultPage,
    personEntity,
  );
})();
