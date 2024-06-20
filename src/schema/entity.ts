import z from "zod";
import { zConstraintDefinition } from "./constraints";
import { FieldDefinition, FieldInstance, zFieldDefinition } from "./field";
import { IsAny } from "../helpers/utility-types";
import { EntityNotFoundError, NotImplementError } from "src/errors";
import { VaultPage } from "obsidian-vault-parser";
import { printNode, zodToTs } from "zod-to-ts";

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
  __type: IsAny<T["name"]> extends true ? string : NonNullable<T["name"]>;
};

export type EntityInstanceType = EntityInstance<EntityDefinition>["__type"];

export function retrieveEntityDefinition(
  entityTypeName: EntityInstanceType,
  entityDefinitionsByName: Record<EntityInstanceType, EntityDefinition>,
): EntityDefinition {
  const maybeEntityDefinition = entityDefinitionsByName[entityTypeName];
  if (!maybeEntityDefinition) {
    throw new EntityNotFoundError(entityTypeName);
  }
  return maybeEntityDefinition;
}

export function parseEntity<T extends EntityDefinition>(
  file: VaultPage,
  expected: T,
): EntityInstance<T> {
  const scalarFields = expected.fields.filter(
    (f) => f.type === "scalar",
  ) as Extract<FieldDefinition, { type: "scalar" }>[];
  let zod_scalar_parser = z.object({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let zfield: z.ZodType<any, any, any>;
  scalarFields.forEach((field) => {
    switch (field.value) {
      case "string":
        zfield = z.string();
        break;
      case "number":
        zfield = z.number();
        break;
      case "boolean":
        zfield = z.boolean();
        break;
      default:
        throw new NotImplementError(
          `Field value ${field.value} not implemented`,
        );
    }
    zod_scalar_parser = zod_scalar_parser.extend({
      [field.name]: zfield,
    });
  });
  const result = zod_scalar_parser.parse(file.frontMatter) as EntityInstance<T>;
  console.log("Parsed data:", result);
  return result;
}
