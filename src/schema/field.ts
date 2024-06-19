import z from 'zod'
import {zEntityDefintion, zEntityName} from "./entity"


export const zFieldName = z.string().min(3).regex(/[a-zA-Z0-9_]*$/i)


export const zFieldLink = z.object({
    type: z.literal('link'),
    name: zFieldName,
    target: zEntityName
})

export const zFieldScalar = z.object({
    type: z.literal('scalar'),
    name: zFieldName,
    // starting out overly strict
    value: z.enum(['string', 'number', 'boolean']),
    parser: z.function().args(z.any()).returns(z.any()).optional()
})

export const zFieldDefinition = z.union([zFieldLink, zFieldScalar])
export type FieldDefinition = z.infer<typeof zFieldDefinition>