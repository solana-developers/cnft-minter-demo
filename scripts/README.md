# scripts

This directory should contain a list of various NodeJS/Typescript scripts that
can be run either in your local development environment.

## running a script

In order to run a script located within this directory, you should use the
`script` helper command located within the root `package.json`.

For example, to run a script file named `./scripts/example.ts`:

```
yarn script example
```

## tsconfig.json

The `tsconfig.json` file within this directory should take priority when running
the scripts within this directory. Making the still compatible to exist within
the NextJS project's repo.
