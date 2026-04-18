# @landerp/blueconic-react-native-types

Unofficial TypeScript definitions for [`@blueconic/blueconic-react-native`](https://www.npmjs.com/package/@blueconic/blueconic-react-native).

> **Not affiliated with or endorsed by BlueConic.** The upstream SDK is commercially licensed — these types describe its public JavaScript API only and do not redistribute any upstream code.

## Install

```sh
pnpm add -D @landerp/blueconic-react-native-types
# or
npm install --save-dev @landerp/blueconic-react-native-types
```

## Usage

The package augments the `@blueconic/blueconic-react-native` module declaration, so once installed, normal imports of the upstream package pick up the types automatically — no import changes needed in your code:

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

If TypeScript doesn't pick up the augmentation automatically, add one of the following to any `.ts` file in your project (for example a `src/types/blueconic.d.ts`):

```ts
import "@landerp/blueconic-react-native-types";
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

1. `pnpm release:patch` — bumps patch, runs `tsc`, publishes to npm, pushes tag.
2. The tag push triggers `.github/workflows/publish.yml`, which also publishes with provenance (idempotent).

Use `release:minor` / `release:major` for larger changes, or `release:upstream` after a sync to ship a new upstream-tracking version.

## Contributing

1. Fork, branch, edit `index.d.ts` and `blueconic__blueconic-react-native-tests.ts`.
2. Run `pnpm test` — must pass with zero errors under strict mode.
3. Open a PR. CI runs `pnpm test` on every push and pull request.

## License

MIT — see [LICENSE](./LICENSE). The upstream SDK retains its own commercial license.
