import z from "zod";
import { zConstraintDefinition } from "./constraints";
import { FieldInstance, zFieldDefinition } from "./field";

export const zEntityName = z
  .string()
  .min(3)
  .regex(/[a-zA-Z0-9_]*$/i);

export const zEntityDefintion = z.object({
  type: z.literal("entity"),
  /// entity name
  name: zEntityName,
  fields: z.array(zFieldDefinition).default([]),
  constraints: z.array(zConstraintDefinition).default([]),
});

export type EntityDefinition = z.infer<typeof zEntityDefintion>;

export type EntityInstance<T extends EntityDefinition> = {
  [K in T["fields"][number]["name"]]: FieldInstance<
    Extract<T["fields"][number], { name: K }>
  >;
} & {
  __type: T["name"];
};
