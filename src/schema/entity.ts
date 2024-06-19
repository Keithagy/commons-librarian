import z from "zod";
import { zConstraintDefinition } from "./constraints";
import { zFieldDefinition } from "./field";

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
