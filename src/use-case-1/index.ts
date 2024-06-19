import { EntityDefinition, EntityInstance } from "@/schema/entity";

export const userCasePerson = {
  type: "entity",
  name: "Person",
  fields: [
    {
      name: "full_name",
      type: "scalar",
      value: "string",
    },
  ],
  constraints: [
    {
      type: "primary-key",
      field: "full_name",
    },
  ],
} as const satisfies EntityDefinition;

const instance: EntityInstance<typeof userCasePerson> = {
  __type: "Person",
  full_name: "John Doe",
};
