import { EntityDefinition, EntityInstance } from "src/schema/entity";

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
}

export type EntitySlice<T extends EntityDefinition = any> = Partial<
  Omit<EntitySliceFields<T>, "__type">
> &
  Pick<EntitySliceFields<T>, "__type"> &
  EntityBase<T>;

export const createEntitySlice = EntityBase.create;
