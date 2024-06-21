import { NotImplementError } from "src/errors";
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
    return result satisfies EntitySlice<T> as EntitySlice<T>;
  }

  getFields(filter_by: GetFieldsOptions) {
    if (filter_by === "all") {
      return this._entity.fields;
    } else if (["primary", "non-primary"].includes(filter_by)) {
      return this._entity.fields.filter((f) => {
        const is_primary = this._entity.constraints.find(
          (c) => c.type === "primary-key" && c.field === f.name,
        ) ?? false;
        return filter_by === "primary" ? is_primary : !is_primary;
      });
    } else {
      throw new NotImplementError(`Filter by ${filter_by} not implemented`);
    }
  }
}

export type EntitySlice<T extends EntityDefinition = any> = Partial<
  Omit<EntitySliceFields<T>, "__type">
> &
  Pick<EntitySliceFields<T>, "__type"> &
  EntityBase<T>;

export const createEntitySlice = EntityBase.create;
