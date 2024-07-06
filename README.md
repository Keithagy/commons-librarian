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

rm vault/out/*; yarn run dev src/cli.ts --- -i vault/pile -o vault/out -s ../dist/use-case/1-dummy-schema.js
yarn run dev src/use-case/4-hd-schema.ts
rm vault/out/*; yarn run dev src/cli.ts --- -i vault/pile2 -o vault/out -s ../dist/use-case/2-regen-schema.js

yarn run dev src/cli.ts --inspect-brk --- -i vault/pile -o vault/out
yarn run dev src/cli.ts --inspect --- -i vault/pile -o vault/out
```


## LLM considerations

https://openai.com/api/pricing/
https://mistral.ai/technology/#pricing

set `LLM_PROVIDER=MISTRAL` or `LLM_PROVIDER=OPENAI` (default is the latter)

### mistral notes

`MISTRAL_API_MODEL=open-mixtral-8x7b` or

`MISTRAL_API_MODEL=open-mixtral-8x22b`


