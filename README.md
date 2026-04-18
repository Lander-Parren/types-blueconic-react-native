# @types/blueconic\_\_blueconic-react-native

Unofficial TypeScript definitions for [`@blueconic/blueconic-react-native`](https://www.npmjs.com/package/@blueconic/blueconic-react-native).

> **Not affiliated with or endorsed by BlueConic.** The upstream SDK is commercially licensed — these types describe its public JavaScript API only and do not redistribute any upstream code.

## Install

```sh
pnpm add -D @types/blueconic__blueconic-react-native
# or
npm install --save-dev @types/blueconic__blueconic-react-native
```

The package has `@blueconic/blueconic-react-native` as an implicit runtime dependency and `react-native` as a peer dependency — both should already be installed in a React Native project.

## Usage

```ts
import BlueConicClient, {
  BlueConicConfiguration,
  EventName,
} from "@blueconic/blueconic-react-native";

const config = new BlueConicConfiguration.Builder()
  .setHostName("https://example.blueconic.net")
  .setDebug(true)
  .build();

BlueConicClient.initialize(config, (err) => {
  if (err !== null) {
    // handle init error
  }
});

const profileId = await BlueConicClient.getProfileIdAsync();
BlueConicClient.setProfileValue("email", "user@example.com");
BlueConicClient.subscribe(EventName.PropertiesDialogue, false, "sub-1");
```

All 78 native methods from the iOS/Android bridge are typed, each in its `sync` / `Async` / `WithCallback` variants.

## Versioning

The package version tracks the upstream SDK's `major.minor` — e.g. `5.2.x` covers upstream `5.2.x`. Patch bumps on our side are free to change purely for type fixes.

## Keeping types in sync with upstream

A sync script detects BlueConic API changes automatically:

```sh
pnpm sync           # prints diff vs committed snapshot (exits 1 on drift)
pnpm sync:write     # writes new snapshot + bumps package.json to match upstream
```

A scheduled GitHub Actions workflow (`.github/workflows/upstream-check.yml`) runs this weekly and opens a PR when BlueConic's API surface changes. After merging, update `index.d.ts` to reflect the diff.

## Releasing

1. `pnpm release:patch` — bumps patch, runs `tsc`, publishes, pushes tag.
2. `git push --follow-tags` — triggers `.github/workflows/publish.yml`, which publishes to npm with provenance.

Use `release:minor` / `release:major` for larger changes, or `release:upstream` after a sync to ship a new upstream tracking version.

## Contributing

1. Fork, branch, edit `index.d.ts` and `blueconic__blueconic-react-native-tests.ts`.
2. Run `pnpm test` — must pass with zero errors under strict mode.
3. Open a PR. CI runs `pnpm test` on every push and pull request.

## An alternative: DefinitelyTyped

If you'd prefer these types to ship via the `@types/*` org (where users get them automatically), submit a PR to [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped). This package's structure is already compatible: `index.d.ts`, `*-tests.ts`, `tsconfig.json`, MIT license.

## License

MIT — see [LICENSE](./LICENSE). The upstream SDK retains its own commercial license.
