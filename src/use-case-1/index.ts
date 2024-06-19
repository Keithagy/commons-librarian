import {EntityDefinition, zEntityDefintion} from "../schema/entity"

export const userCasePerson = zEntityDefintion.parse({
    type: 'entity',
    name: 'Person',
    fields: [
        {
            name: 'full_name',
            type: 'scalar',
            value: 'string'
        }
    ],
    constraints: [
        {
            type: 'primary-key',
            field: 'full_name'
        },
    ],
} satisfies  EntityDefinition)