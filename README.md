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
```