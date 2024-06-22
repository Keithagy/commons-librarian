# commons-librarian


## install

- install nodejs mentioned in package.json
- install yarn
- exec: `yarn install`
- initialize .env file by looking at .env.example

## run

Point yarn dev to the right `.ts`-file:

```bash
yarn run dev src/use-case-1/testPopulateEntity.ts --inspect-brk
yarn run dev src/cli.ts --- -i vault/pile -o vault/out
yarn run dev src/cli.ts --inspect-brk --- -i vault/pile -o vault/out
yarn run dev src/cli.ts --inspect --- -i vault/pile -o vault/out
```


## LLM considerations

## https://mistral.ai/technology/#pricing

```
MISTRAL_API_MODEL=open-mixtral-8x7b
```