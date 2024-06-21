export class NotImplementError extends Error {
  constructor(msg = "Not implemented") {
    super(msg);
  }
}

export class EntityNotFoundError extends Error {
  constructor(entityName: string) {
    super(`Entity not found: ${entityName}`);
  }
}

export class InvalidEntityDefinition extends Error {}

export class BadLLMResponse extends Error {
  constructor(msg: string) {
    super(msg);
  }
}
