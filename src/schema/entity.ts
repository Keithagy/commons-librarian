import z from "zod";
import { zConstraintDefinition } from "./constraints";
import { FieldDefinition, FieldInstance, zFieldDefinition } from "./field";
import { IsAny } from "../helpers/utility-types";
import {
  EntityNotFoundError,
  InvalidEntityDefinition,
  NotImplementError,
} from "src/errors";
import { VaultPage } from "obsidian-vault-parser";
import { EntitySlice } from "src/workflow/types";

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
): EntitySlice<T> {
  const expectedSchema = getSchemaOfEntityDefinition(expected);
  const result = expectedSchema.parse(file.frontMatter) as EntitySlice<T>;
  console.log("Parsed data:", result);
  return result;
}
export function getSchemaOfEntityDefinition(
  entityDefinition: EntityDefinition,
): ReturnType<typeof z.object> {


  let zod_scalar_parser = z.object({});

  for (const field of entityDefinition.fields) {
    let zfield: z.ZodType<any, any, any>;
    if (field.type === "scalar") {
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
            `Field value not implemented`,
          );
      }

      if (field.comment) {
        zfield = zfield.describe(field.comment);
      }

      zod_scalar_parser = zod_scalar_parser.extend({
        [field.name]: zfield,
      });
    } else if (field.type === "zod") {
      zod_scalar_parser = zod_scalar_parser.extend({
        [field.name]: field.value,
      });
    }
  }

  return zod_scalar_parser;
}

export function getPrimaryKeySchemaOfEntityDefinition(
  entityDefinition: EntityDefinition,
): z.AnyZodObject {
  const primaryKeyFieldNames = entityDefinition.constraints
    .filter((c) => c.type === "primary-key")
    .map((pk) => pk.field);

  let schema = z.object({});
  for (const pkFieldName of primaryKeyFieldNames) {
    const pkField = entityDefinition.fields.find((f) => f.name === pkFieldName);
    if (pkField === undefined) {
      throw new InvalidEntityDefinition(
        `This entity definition specifies ${pkFieldName} as primary key, but it is not found in fields`,
      );
    }
    if (pkField.type !== "scalar") {
      throw new InvalidEntityDefinition(
        `This entity definition specifies ${pkFieldName} as primary key, but it is not a scalar field`,
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let zField: z.ZodType<any, any, any>;
    switch (pkField.value) {
      case "string":
        zField = z.string();
        break;
      case "number":
        zField = z.number();
        break;
      case "boolean":
        zField = z.boolean();
        break;
      default:
        throw new NotImplementError(
          `Field type not implemented`,
        );
    }
    schema = schema.extend({ [pkField.name]: zField });
  }
  return schema;
}
