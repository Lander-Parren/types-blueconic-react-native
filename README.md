# @landerp/blueconic-react-native-types

Unofficial TypeScript definitions for version `5.3.x` of the BlueConic React Native SDK. [SDK on npm](https://www.npmjs.com/package/@blueconic/blueconic-react-native)

> **Not affiliated with or endorsed by BlueConic.** The upstream SDK is commercially licensed — these types describe its public JavaScript API only and do not redistribute any upstream code.

## Install

Install the SDK as an application dependency and the matching types as a development dependency.

```sh
pnpm add @blueconic/blueconic-react-native@~5.3.0
pnpm add -D @landerp/blueconic-react-native-types@~5.3.0
```

With npm, run `npm install @blueconic/blueconic-react-native@~5.3.0` and `npm install --save-dev @landerp/blueconic-react-native-types@~5.3.0`. For native project setup, follow the [BlueConic SDK guide](https://support.blueconic.com/en/articles/248017-blueconic-sdk-for-react-native).

Add the following line to an `env.d.ts` included by your app's `tsconfig.json`. TypeScript then loads the declarations. All application imports come from the SDK.

```ts title="env.d.ts"
/// <reference types="@landerp/blueconic-react-native-types" />
```

## Initialize the client

Initialize once at app startup. The JavaScript builder can produce an incomplete configuration, but `initialize` requires a string `bc_hostname`. Set it with `setHostName` before calling `build()`, or provide the field directly. The first callback argument reports success. Send events after initialization succeeds.

```ts title="app.ts"
import client, { BlueConicConfiguration } from "@blueconic/blueconic-react-native";

export function initializeBlueConic(hostName: string, onError: (message: string) => void) {
  const config = new BlueConicConfiguration.Builder().setHostName(hostName).build();

  client.initialize(config, (success, error) => {
    if (!success) {
      onError(error ?? "BlueConic initialization failed");
      return;
    }
    client.createPageViewEvent("Catalog", {});
    client.publishAdvancedEventWithObjectContext("category_opened", { category: "shoes" });
  });
}
```

SDK 5.3 also provides `publishAdvancedEventWithObjectContextWithCallback(name, context, callback)`. Both object-context methods accept a map of string values. The callback receives `(success, error)`. [SDK release notes](https://support.blueconic.com/en/articles/248068-blueconic-sdk-for-react-native-release-notes)

## Read segments on both platforms

Call this after initialization and a page view. Read the first element of the enabled result because an array containing `false` is still truthy.

```ts title="segments.ts"
import client from "@blueconic/blueconic-react-native";
import type { BlueConicClientStatic, BlueConicIOSClient } from "@blueconic/blueconic-react-native";

function isIOSClient(client: BlueConicClientStatic): client is BlueConicIOSClient {
  return "getSegmentsAsync" in client && typeof client.getSegmentsAsync === "function";
}

export async function isEnabledMember(segmentId: string): Promise<boolean> {
  const [enabled] = await client.isEnabledAsync();
  if (!enabled) return false;

  const segments = isIOSClient(client)
    ? await client.getSegmentsAsync()
    : await client.getSegments();
  return segments.some(segment => segment.id === segmentId);
}
```

The `in` check narrows the TypeScript union. Hermes can report a missing native module property as present, so the guard also checks that `getSegmentsAsync` is callable before taking the iOS branch. [Hermes property lookup](https://github.com/facebook/hermes/blob/hermes-v250829098.0.10/lib/VM/JSObject.cpp) · [React Native 0.85.1 native module binding](https://github.com/facebook/react-native/blob/v0.85.1/packages/react-native/ReactCommon/react/nativemodule/core/ReactCommon/TurboModuleBinding.cpp#L203-L212)

On Android, SDK 5.3.0 passes a Java `ArrayList` from `hasSegment`, `hasSegmentWithCallback`, and `isEnabledWithCallback`. React Native 0.85.1's callback serializer rejects that value. The example uses `getSegments()` for membership and `isEnabledAsync()` for the flag, both of which return bridge-compatible arrays. [BlueConic 5.3.0 bridge source](https://registry.npmjs.org/@blueconic/blueconic-react-native/-/blueconic-react-native-5.3.0.tgz) · [React Native 0.85.1 serializer](https://github.com/facebook/react-native/blob/v0.85.1/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/bridge/Arguments.kt#L141-L160)

## Migrating from 5.2

The types follow the SDK's major and minor version. If your app stays on SDK `5.2.x`, pin `@landerp/blueconic-react-native-types` to `~5.2.4`. When upgrading to `5.3.x`, check these calls.

| Call | What to change |
| --- | --- |
| `incrementProfileValue` | Pass an integer such as `1`. |
| Timeline events | Pass epoch milliseconds such as `Date.now()`. Timeline properties can contain nested objects and arrays. |
| `getProfileIdAsync()` | iOS wraps the ID in a one-element array. Android returns a string or `null`. |
| Multiple profile values and consent lists | iOS returns the list when present and passes its values as separate callback arguments. Android wraps the list in an outer array and passes that array as one callback argument. |
| `getSegmentsWithCallback` | On iOS use `(...segments) => …`. On Android use `segments => …` to receive one array. |

Dialogue listeners receive plain objects with populated fields. The SDK's JavaScript event constructors create objects with unset fields. Type listener parameters with the payload types and decode `data` or `recommendations` as JSON. Validate the decoded value against your dialogue's configuration before using it.

```ts title="dialogues.ts"
import type {
  PropertiesDialoguePayload,
  RecommendationsDialoguePayload,
} from "@blueconic/blueconic-react-native";

export function decodeDialogue(event: PropertiesDialoguePayload | RecommendationsDialoguePayload): unknown {
  const json = "recommendations" in event ? event.recommendations : event.data;
  return JSON.parse(json);
}
```

## Keeping types in sync with upstream

The sync script compares the latest SDK version, JavaScript export names and iOS method signatures with the committed snapshot.

```sh
pnpm sync           # prints diff vs committed snapshot (exits 1 on drift)
pnpm sync:write     # updates the snapshot
```

The upstream-check workflow is configured for weekly checks and can open a snapshot PR. Review both native bridges and update the declarations and tests before merging.

## Releasing

Release Please uses Conventional Commits on `main` to prepare a release PR with the version and changelog. A `feat:` commit requests a minor version, a `fix:` requests a patch, and a breaking change requests a major version. [Release Please](https://github.com/googleapis/release-please) · [Conventional Commits](https://www.conventionalcommits.org/)

Merging the release PR creates a `vX.Y.Z` tag and a GitHub Release. The publish job in the same workflow checks out that tag, runs the tests and publishes to npm with provenance. The separate Publish workflow supports manual retries.

## Contributing

1. Fork, branch, edit `index.d.ts` and `blueconic__blueconic-react-native-tests.ts`.
2. Run `pnpm test` to check the declarations and compile the README examples as a consumer of the packed types.
3. Commit using Conventional Commits (`feat: add X`, `fix: correct Y`).
4. Open a PR. CI runs `pnpm test` on pull requests and pushes to `main`.

## License

MIT — see [LICENSE](./LICENSE). The upstream SDK retains its own commercial license.
