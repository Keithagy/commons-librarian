import { TextSnippet } from "src/workflow/types";
import { personEntity } from "./1-dummy-schema";
import { determineIfEntityTypePresent } from "src/workflow/determineIfEntityTypePresent";

(async () => {
  await determineIfEntityTypePresent(
    {
      content:
        "Mario Johns and Luigi Antetokunmpo are brothers, and they hail from the Nintendo universe.",
    } as TextSnippet,
    personEntity,
  );
  await determineIfEntityTypePresent(
    {
      content:
        "Mario and Luigi are brothers, and they hail from the Nintendo universe.",
    } as TextSnippet,
    personEntity,
  );
  await determineIfEntityTypePresent(
    {
      content: "The sun rises from the east every day.",
    } as TextSnippet,
    personEntity,
  );
})();
