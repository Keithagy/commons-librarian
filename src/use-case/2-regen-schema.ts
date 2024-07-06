import { z } from "zod";
import { EntityDefinition, EntityInstance } from "../schema/entity";

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
      name: "age",
      type: "scalar",
      value: "number",
      comment: "This person's age in years.",
    },
    {
      type: "link",
      name: "parent",
      target: "Person",
      multi: false,
    },
    {
      type: "zod",
      name: "urls",
      value: z.array(z.string()),
    },
  ],
  constraints: [
    {
      type: "primary-key",
      field: "full_name",
    },
  ],
} satisfies EntityDefinition;

const schema = [personEntity];

export default schema;
