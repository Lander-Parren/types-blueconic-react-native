import client, {
    BlueConicConfiguration,
    Event,
    EventName,
    PropertiesDialogueEvent,
    RecommendationsDialogueEvent,
} from "@blueconic/blueconic-react-native";
import type {
    BlueConicAndroidClient,
    BlueConicIOSClient,
    PropertiesDialoguePayload,
    RecommendationsDialoguePayload,
    Segment,
} from "@blueconic/blueconic-react-native";

declare function expectType<T>(value: T): void;
declare const onOutcome: (success: boolean, error: string | null) => void;

// Configuration, initialization and the NativeEventEmitter module contract.
const builder = new BlueConicConfiguration.Builder()
    .setHostName("https://example.blueconic.net")
    .setDebug(true)
    .setOverrideAppId("com.example.app")
    .setSimulatorUsername("tester")
    .setSimulatorSessionId("session-123");
const config: BlueConicConfiguration = builder.build();
expectType<string>(config.bc_hostname);
client.initialize(new BlueConicConfiguration(builder), onOutcome);
const hostSetLast = new BlueConicConfiguration.Builder().setDebug(true).setHostName("https://example.blueconic.net");
client.initialize(hostSetLast.build(), onOutcome);
client.initialize({ bc_hostname: "https://example.blueconic.net", bc_debug: true }, onOutcome);
// @ts-expect-error The JS constructor reads configuration from its builder argument.
new BlueConicConfiguration();
const withoutHost = new BlueConicConfiguration.Builder().setDebug(true).build();
expectType<string | undefined>(withoutHost.bc_hostname);
// @ts-expect-error A configuration built before setting its hostname lacks this required string.
expectType<string>(withoutHost.bc_hostname);
// @ts-expect-error The native initializer reads a string hostname.
client.initialize(withoutHost, onOutcome);
// @ts-expect-error An empty configuration supplies no hostname.
client.initialize({}, onOutcome);
client.initialize(config, (success, error) => {
    expectType<boolean>(success);
    expectType<string | null>(error);
});
expectType<{ addListener(name: string): void; removeListeners(count: number): void }>(client);

// The JS event constructors create empty instances. Native listeners deliver populated plain objects.
expectType<"propertiesDialogueEvent">(EventName.PropertiesDialogue);
expectType<"recommendationsDialogueEvent">(EventName.RecommendationsDialogue);
const event = new Event();
event.name = EventName.PropertiesDialogue;
event.context = { screen: "home" };
const propertiesEvent = new PropertiesDialogueEvent();
const recommendationsEvent = new RecommendationsDialogueEvent();
// @ts-expect-error A fresh instance has no populated dialogue fields.
expectType<PropertiesDialoguePayload>(propertiesEvent);
// @ts-expect-error A fresh instance has no populated recommendations fields.
expectType<RecommendationsDialoguePayload>(recommendationsEvent);
// @ts-expect-error The bridge delivers serialized JSON.
propertiesEvent.data = { key: "value" };
// @ts-expect-error The bridge delivers serialized JSON.
recommendationsEvent.recommendations = [{ id: "item-1" }];
declare const propertiesPayload: PropertiesDialoguePayload;
declare const recommendationsPayload: RecommendationsDialoguePayload;
expectType<string>(propertiesPayload.data);
expectType<string>(recommendationsPayload.recommendations);
expectType<string>(recommendationsPayload.storeId);

// Read APIs shared by iOS and Android.
expectType<Promise<[boolean]>>(client.isEnabledAsync());
// @ts-expect-error Even a disabled SDK resolves an array.
expectType<Promise<boolean>>(client.isEnabledAsync());
expectType<Promise<Array<{ id: string; value: string }>>>(client.getAllProfilePropertiesAsync());
// @ts-expect-error The default client may be Android.
client.getSegmentsAsync();
// @ts-expect-error The default client may be iOS.
client.getSegments();
// @ts-expect-error The membership method name depends on the platform.
client.hasSegmentAsync("vip");
// @ts-expect-error The membership method name depends on the platform.
client.hasSegment("vip");
// @ts-expect-error A shared callback must also handle the positional iOS arguments.
client.getSegmentsWithCallback((segments: Segment[]) => segments.length);

if ("getSegmentsAsync" in client) {
    expectType<BlueConicIOSClient>(client);
    expectType<Promise<Segment[]>>(client.getSegmentsAsync());
    expectType<Promise<[boolean]>>(client.hasSegmentAsync("vip"));
    client.getSegmentsWithCallback((...segments) => expectType<Segment[]>(segments));
    client.hasSegmentWithCallback("vip", member => expectType<boolean>(member));
    client.isEnabledWithCallback(enabled => expectType<boolean>(enabled));

    expectType<Promise<[string]>>(client.getProfileIdAsync());
    expectType<Promise<[string]>>(client.getScreenNameAsync());
    expectType<Promise<[string]>>(client.getProfileValueAsync("email"));
    expectType<Promise<[string]>>(client.getPrivacyLegislationAsync());
    client.getProfileIdWithCallback(id => expectType<string>(id));
    client.getScreenNameWithCallback(screen => expectType<string>(screen));
    client.getProfileValueWithCallback("email", value => expectType<string>(value));
    client.getPrivacyLegislationWithCallback(code => expectType<string>(code));

    const profileValues = client.getProfileValuesAsync("tags");
    expectType<Promise<string[] | undefined>>(profileValues);
    // @ts-expect-error An iOS profile can have no values for a property.
    expectType<Promise<string[]>>(profileValues);
    expectType<Promise<string[] | undefined>>(client.getConsentedObjectivesAsync());
    expectType<Promise<string[] | undefined>>(client.getRefusedObjectivesAsync());
    client.getProfileValuesWithCallback("tags", (...values) => expectType<string[]>(values));
    client.getConsentedObjectivesWithCallback((...ids) => expectType<string[]>(ids));
    client.getRefusedObjectivesWithCallback((...ids) => expectType<string[]>(ids));
    // @ts-expect-error Each iOS segment is a separate argument.
    client.getSegmentsWithCallback((segments: Segment[]) => segments.length);
} else {
    expectType<BlueConicAndroidClient>(client);
    expectType<Promise<Segment[]>>(client.getSegments());
    client.getSegmentsWithCallback(segments => expectType<Segment[]>(segments));
    // Native list payloads of these three methods encounter a serializer issue on RN 0.85.1.
    expectType<Promise<[boolean]>>(client.hasSegment("vip"));
    client.hasSegmentWithCallback("vip", result => expectType<[boolean]>(result));
    client.isEnabledWithCallback(result => expectType<[boolean]>(result));

    const profileId = client.getProfileIdAsync();
    expectType<Promise<string | null>>(profileId);
    // @ts-expect-error The Android profile ID can be null.
    expectType<Promise<string>>(profileId);
    expectType<Promise<string>>(client.getScreenNameAsync());
    expectType<Promise<[string | null]>>(client.getProfileValueAsync("email"));
    expectType<Promise<[string | null]>>(client.getPrivacyLegislationAsync());
    client.getProfileIdWithCallback(id => {
        expectType<string | null>(id);
        // @ts-expect-error The callback can also receive a null profile ID.
        id.toUpperCase();
    });
    client.getScreenNameWithCallback(screen => expectType<string>(screen));
    client.getProfileValueWithCallback("email", result => {
        expectType<[string | null]>(result);
        // @ts-expect-error A missing Android property can yield [null].
        expectType<[string]>(result);
    });
    client.getPrivacyLegislationWithCallback(result => expectType<[string | null]>(result));

    expectType<Promise<[string[]]>>(client.getProfileValuesAsync("tags"));
    expectType<Promise<[string[]]>>(client.getConsentedObjectivesAsync());
    expectType<Promise<[string[]]>>(client.getRefusedObjectivesAsync());
    client.getProfileValuesWithCallback("tags", result => expectType<[string[]]>(result));
    client.getConsentedObjectivesWithCallback(result => expectType<[string[]]>(result));
    client.getRefusedObjectivesWithCallback(result => expectType<[string[]]>(result));
    // @ts-expect-error Android delivers the whole list as one callback argument.
    client.getSegmentsWithCallback((...segments: Segment[]) => segments.length);
}

// Profile and consent writes.
client.addProfileValue("tags", "loyal");
client.addProfileValues("tags", ["loyal", "returning"]);
client.setProfileValue("email", "a@b.c");
client.setProfileValues("tags", ["one", "two"]);
client.incrementProfileValue("visits", 1);
// @ts-expect-error Both 5.3 bridges accept a numeric increment.
client.incrementProfileValue("visits", "1");
client.setPrivacyLegislation("GDPR");
client.setConsentedObjectives(["analytics"]);
client.setRefusedObjectives(["advertising"]);
client.addConsentedObjective("analytics");
client.addRefusedObjective("advertising");
client.createProfile(onOutcome);
client.deleteProfile(onOutcome);
client.updateProfile();
expectType<Promise<[]>>(client.updateProfileAsync());
client.updateProfileWithCallback(onOutcome);
client.setLocale("en_US");
client.setEnabled(true);

// Generic, interaction and timeline events.
client.createEvent("custom", { source: "app" });
expectType<Promise<[]>>(client.createEventAsync("custom", { source: "app" }));
client.createEventWithCallback("custom", { source: "app" }, onOutcome);
// @ts-expect-error Generic event properties take string values.
client.createEvent("custom", { count: 1 });
const properties = { userId: "u1", count: 2, premium: true };
client.createPageViewEvent("Home", properties);
expectType<Promise<[]>>(client.createPageViewEventAsync("Home", properties));
client.createPageViewEventWithCallback("Home", properties, onOutcome);
client.createViewEvent("int-1", properties);
expectType<Promise<[]>>(client.createViewEventAsync("int-1", properties));
client.createViewEventWithCallback("int-1", properties, onOutcome);
client.createConversionEvent("int-1", properties);
expectType<Promise<[]>>(client.createConversionEventAsync("int-1", properties));
client.createConversionEventWithCallback("int-1", properties, onOutcome);
client.createClickEvent("int-1", properties);
expectType<Promise<[]>>(client.createClickEventAsync("int-1", properties));
client.createClickEventWithCallback("int-1", properties, onOutcome);

const purchase = { order: { currency: "EUR", items: [{ sku: "A", quantity: 2 }], gift: false } };
const timestamp = Date.now();
client.createTimelineEvent("purchase", timestamp, purchase);
expectType<Promise<[]>>(client.createTimelineEventAsync("purchase", timestamp, purchase));
client.createTimelineEventWithCallback("purchase", timestamp, purchase, onOutcome);
client.createTimelineEventById("order-1", "purchase", timestamp, purchase);
expectType<Promise<[]>>(client.createTimelineEventByIdAsync("order-1", "purchase", timestamp, purchase));
client.createTimelineEventByIdWithCallback("order-1", "purchase", timestamp, purchase, onOutcome);
// @ts-expect-error Portable timeline timestamps are epoch milliseconds.
client.createTimelineEvent("purchase", new Date(), {});
// @ts-expect-error The ID-based variant also takes epoch milliseconds.
client.createTimelineEventByIdAsync("order-1", "purchase", new Date(), {});
// @ts-expect-error Functions cannot be serialized as timeline properties.
client.createTimelineEvent("purchase", timestamp, { order: { items: () => [] } });

client.createRecommendationEvent("store-1", "click", ["a", "b"]);
expectType<Promise<[]>>(client.createRecommendationEventAsync("store-1", "click", ["a"]));
client.createRecommendationEventWithCallback("store-1", "click", ["a"], onOutcome);

// Subscriptions and publish helpers.
client.subscribe(EventName.PropertiesDialogue, false, "sub-1");
client.unsubscribe("sub-1");
client.publishClickEvent(".btn", ["x"]);
client.publishClickEventWithCallback(".btn", ["x"], onOutcome);
client.publishFormSubmitEvent("#form", ["x"]);
client.publishFormSubmitEventWithCallback("#form", ["x"], onOutcome);
client.publishUpdateContentEvent("#a", "html");
client.publishUpdateContentEventWithCallback("#a", "html", onOutcome);
client.publishUpdateValuesEvent("#a", "v");
client.publishUpdateValuesEventWithCallback("#a", "v", onOutcome);
client.publishAdvancedEvent("named", ["v"]);
client.publishAdvancedEventWithCallback("named", ["v"], onOutcome);
const context = { type: "pdp", category: "shoes" };
expectType<void>(client.publishAdvancedEventWithObjectContext("view", context));
client.publishAdvancedEventWithObjectContextWithCallback("view", context, (success, error) => {
    expectType<boolean>(success);
    expectType<string | null>(error);
});
// @ts-expect-error Every object context value must be a string.
client.publishAdvancedEventWithObjectContext("view", { count: 1 });
// @ts-expect-error The callback variant has the same string-only context.
client.publishAdvancedEventWithObjectContextWithCallback("view", purchase, onOutcome);
// @ts-expect-error SDK 5.3 exposes synchronous and callback object-context variants.
client.publishAdvancedEventWithObjectContextAsync("view", context);
client.destroyPlugins();
