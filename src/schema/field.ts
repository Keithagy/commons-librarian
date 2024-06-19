import z from "zod";
import { zEntityName } from "./entity";

export const zFieldName = z
  .string()
  .min(3)
  .regex(/[a-zA-Z0-9_]*$/i);

export const zFieldLink = z.object({
  type: z.literal("link"),
  name: zFieldName,
  target: zEntityName,
  muli: z.boolean(),
});

export const zFieldScalar = z.object({
  type: z.literal("scalar"),
  name: zFieldName,
  // starting out overly strict
  value: z.enum(["string", "number", "boolean"]),
  parser: z.function().args(z.any()).returns(z.any()).optional(),
});

export const zFieldDefinition = z.union([zFieldLink, zFieldScalar]);
export type FieldDefinition = z.infer<typeof zFieldDefinition>;

// @eslint-ignore-next-statement
export type FieldInstance<T> = T extends z.infer<typeof zFieldLink>
  ? { type: 'link', entity: T['target'], target_primary_keys: string[] } // muli: false links will also be represented as an array
  : T extends z.infer<typeof zFieldScalar>
  ? T extends { value: "string" }
    ? string
    : T extends { value: "number" }
    ? number
    : T extends { value: "boolean" }
    ? boolean
    : never
  : never;
