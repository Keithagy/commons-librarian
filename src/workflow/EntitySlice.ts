import { InvalidEntityDefinition, NotImplementError } from "src/errors";
import { EntityDefinition, EntityInstance } from "src/schema/entity";
import type { IsAny } from "../helpers/utility-types";

type GetFieldsOptions = "non-primary" | "primary" | "all" | "link";

export type EntitySliceFields<T extends EntityDefinition = any> = Partial<
  EntityInstance<T>
> &
  Pick<EntityInstance<T>, "__type">;

// *TD*efault
type TD<T extends EntityDefinition> = IsAny<T> extends true
  ? EntityDefinition
  : T;

class EntityBase<T extends EntityDefinition> {
  private constructor(private _entity: EntityDefinition) {}

  get definition() {
    return this._entity;
  }

  static create<
    T extends EntityDefinition,
    F extends Partial<EntitySliceFields<T>> = Partial<EntitySliceFields<T>>,
  >(entity: EntityDefinition, fields: F) {
    const slice = new EntityBase(entity);
    const result = Object.assign(slice, fields, { __type: entity.name });
    return result as EntitySlice<T>;
  }

  getFields<F extends GetFieldsOptions>(
    filter_by: F,
  ): F extends "all"
    ? TD<T>["fields"]
    : F extends "link"
    ? Extract<TD<T>["fields"][number], { type: "link" }>[]
    : F extends "primary" | "non-primary"
    ? Extract<TD<T>["fields"][number], { type: "scalar" }>[]
    : never;

  getFields<F extends GetFieldsOptions>(filter_by: F): any {
    if (filter_by === "all") {
      return this._entity.fields;
    } else if (["primary", "non-primary"].includes(filter_by)) {
      return this._entity.fields.filter((f) => {
        const is_primary =
          this._entity.constraints.find(
            (c) => c.type === "primary-key" && c.field === f.name,
          ) ?? false;
        return filter_by === "primary" ? is_primary : !is_primary;
      });
    } else if (filter_by === "link") {
      return this._entity.fields.filter((f) => f.type === "link");
    } else {
      throw new NotImplementError(`Filter by ${filter_by} not implemented`);
    }
  }

  getPrimaryDef() {
    const pk = this.getFields("primary");

    if (pk.length === 0) {
      throw new InvalidEntityDefinition(
        `Entity ${this._entity.name} has no primary key`,
      );
    } else if (pk.length > 1) {
      throw new InvalidEntityDefinition(
        `Entity ${this._entity.name} has multiple primary keys`,
      );
    } else {
      const p = pk[0];
      if (p.type !== "scalar") {
        throw new InvalidEntityDefinition(
          `Entity ${this._entity.name} primary key is not a scalar`,
        );
      }
      return p;
    }
  }

  getPrimaryKey() {
    const $this = this as any as EntitySlice<T>;
    const name = this.getPrimaryDef().name as keyof EntitySlice<T>;
    return {
      key: name,
      value: $this[name],
    };
  }

  asInstance() {
    for (const f of this._entity.fields) {
      if (!(f.name in this)) {
        throw new InvalidEntityDefinition(
          `Entity ${this._entity.name} missing field ${f.name}`,
        );
      }
    }
  }
}

export type EntitySlice<T extends EntityDefinition = any> = Partial<
  Omit<EntitySliceFields<T>, "__type">
> &
  Pick<EntitySliceFields<T>, "__type"> &
  EntityBase<T>;

export const createEntitySlice = EntityBase.create;
