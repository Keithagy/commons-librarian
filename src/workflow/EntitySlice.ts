import { InvalidEntityDefinition, NotImplementError } from "src/errors";
import { EntityDefinition, EntityInstance } from "src/schema/entity";

type GetFieldsOptions = "non-primary" | "primary" | "all";

export type EntitySliceFields<T extends EntityDefinition = any> = Partial<
  EntityInstance<T>
> &
  Pick<EntityInstance<T>, "__type">;

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

  getFields(filter_by: GetFieldsOptions) {
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
}

export type EntitySlice<T extends EntityDefinition = any> = Partial<
  Omit<EntitySliceFields<T>, "__type">
> &
  Pick<EntitySliceFields<T>, "__type"> &
  EntityBase<T>;

export const createEntitySlice = EntityBase.create;
