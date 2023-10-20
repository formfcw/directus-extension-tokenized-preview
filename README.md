# Tokenized Preview Endpoint for Directus

[![NPM version](https://img.shields.io/npm/v/directus-extension-tokenized-preview)](https://www.npmjs.com/package/directus-extension-tokenized-preview)

An endpoint that adds an active auth token to your preview URL. The auth token, which has a limited TTL, allows you to to preview content that is not publicly available through the API.

```sh
# Install via npm
npm install directus-extension-tokenized-preview
# Install via yarn
yarn add directus-extension-tokenized-preview
# Install via pnpm
pnpm add directus-extension-tokenized-preview
```

## Usage

Prefix the `Preview URL` of your data model collection with `/preview/`, like:

`/preview/http://localhost:3000/posts/{{slug}}?preview=true`

![](docs/preview-url.png)

Or if you set `TOKENIZED_PREVIEW_BASE_URL` (see below), you can achieve the same result without adding the base URL, like:

`/preview/posts/{{slug}}?preview=true`

![](docs/preview-relative-url.png)

### Result:

```
http://localhost:3000/posts/?preview=true&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ2ZjA1OGFjLTkyY2QtNDIzYi1hODgzLWU2OTQ5YTMxMjM2YiIsInJvbGUiOiJlMjgyOGMwYy05NzdkLTQzMzYtYjAyMy1hZTJhNGY5OTE1ZTIiLCJhcHBfYWNjZXNzIjoxLCJhZG1pbl9hY2Nlc3MiOjEsImlhdCI6MTY5Nzc5OTQ1MSwiZXhwIjoxNjk3ODAwMzUxLCJpc3MiOiJkaXJlY3R1cyJ9.qUme3vwuDTa9YNc9Ivewjvj2hThPT7t-6K7e_KO6QOU
```

## Config

You can configure the endpoint via ENV vars:

```sh
# The route of the endpoint. If it is `preview`, it will be `http://localhost:8055/preview`
# Default: preview
TOKENIZED_PREVIEW_ENDPOINT=preview
```

```sh
# The key of the appended auth token. If it is `token`, it will append something like `?token=10932874539847`
# Default: token
TOKENIZED_PREVIEW_TOKEN_KEY=token
```

```sh
# The base URL of your project (e.g. website).
TOKENIZED_PREVIEW_BASE_URL=

# If `TOKENIZED_PREVIEW_BASE_URL` is not set, it will use `PROJECT_URL`.
PROJECT_URL=

# If `PROJECT_URL` is not set, it will use `PUBLIC_URL`. If `PUBLIC_URL` is not set, it will use `http://localhost:8055`.
PUBLIC_URL=
```

> **Note:** You should add `PUBLIC_URL` to your ENV vars!

> **Note,** that for the preview feature to work, you should set the `CONTENT_SECURITY_POLICY_DIRECTIVES__FRAME_SRC` ENV var for the directus base URL (`PUBLIC_URL`) as well as for the preview base URL.
