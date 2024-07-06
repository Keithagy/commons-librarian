import { z } from "zod";
import { EntityDefinition } from "../schema/entity";
import { Librarian } from "src/librarian";
import { DirectedGraph } from "graphology";
import { log } from "console";
import {
  MDFindEntityOccurenceRecipe,
  RecipeRawUrl,
  Url2MDRecipe,
} from "src/recipes-web";

export const personEntity = {
  type: "entity",
  name: "Person",
  fields: [
    {
      name: "full_name",
      type: "scalar",
      value: "string",
    },
    {
      type: "link",
      name: "locations",
      target: "Location",
      multi: true,
      comment: "locations this person has been affiliated with",
    },
    {
      type: "zod",
      name: "interests",
      value: z.array(z.string()),
      comment:
        "conceptual, political or creative interests associated with this person",
    },
  ],
  constraints: [
    {
      type: "primary-key",
      field: "full_name",
    },
  ],
} satisfies EntityDefinition;

export const locationEntity = {
  type: "entity",
  name: "Location",
  fields: [
    {
      name: "name",
      type: "scalar",
      value: "string",
      comment: "name of this location.",
    },
  ],
  constraints: [
    {
      type: "primary-key",
      field: "name",
    },
  ],
} satisfies EntityDefinition;
const schema = [personEntity, locationEntity];

(async () => {
  const graph = new DirectedGraph();

  graph.on("nodeAdded", async (n) => {
    console.log(`add ${n.key}`, n.attributes);
  });

  graph.on("edgeAdded", async (e) => {
    console.log(
      `lnk [${e.source} -[${e.attributes.kind ?? "-"}]-> ${e.target}]`,
    );
  });

  const librarian = new Librarian("david", graph, [
    new RecipeRawUrl(),
    new Url2MDRecipe(),
    new MDFindEntityOccurenceRecipe([personEntity, locationEntity], []),
  ]);

  await librarian.presentBlob(`
  https://www.russelldavies.com/

`);
})();
