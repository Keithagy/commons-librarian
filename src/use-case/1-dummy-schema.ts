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
    },
    {
      type: "link",
      name: "parent",
      target: "Person",
      multi: false,
    },
  ],
  constraints: [
    {
      type: "primary-key",
      field: "full_name",
    },
  ],
} satisfies EntityDefinition;


const schema = [
    personEntity
]

export default schema;