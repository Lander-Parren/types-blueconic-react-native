import BlueConicClient, {
    BlueConicConfiguration,
    Event,
    EventName,
    PropertiesDialogueEvent,
    RecommendationsDialogueEvent,
} from "@blueconic/blueconic-react-native";

// --- Configuration builder ---
const config: BlueConicConfiguration = new BlueConicConfiguration.Builder()
    .setHostName("https://example.blueconic.net")
    .setDebug(true)
    .setOverrideAppId("com.example.app")
    .setSimulatorUsername("tester")
    .setSimulatorSessionId("session-123")
    .build();

// $ExpectType string | undefined
config.bc_hostname;

// --- Event constants ---
const propName: "propertiesDialogueEvent" = EventName.PropertiesDialogue;
const recName: "recommendationsDialogueEvent" = EventName.RecommendationsDialogue;

const ev = new Event();
ev.name = propName;
ev.context = { anything: true };

const pde = new PropertiesDialogueEvent();
pde.variantId = "v1";
pde.position = "header";
pde.data = { key: "value", list: ["a", "b"] };

const rde = new RecommendationsDialogueEvent();
rde.variantId = "v2";
rde.position = "sidebar";
rde.storeId = "store-1";
rde.recommendations = [{ id: "item-1", price: 9.99 }];

// --- Initialize ---
BlueConicClient.initialize(config, (success, err) => {
    const ok: boolean = success;
    const message: string | null = err;
    void ok;
    void message;
});

// --- Profile read (async + callback) ---
BlueConicClient.getProfileIdAsync().then(id => id.toUpperCase());
BlueConicClient.getProfileIdWithCallback(id => id.length);
BlueConicClient.getProfileValueAsync("email").then(v => v);
BlueConicClient.getProfileValuesAsync("tags").then(values => values.map(v => v));
BlueConicClient.getProfileValueWithCallback("email", v => v);
BlueConicClient.getProfileValuesWithCallback("tags", values => values.length);
BlueConicClient.getAllProfilePropertiesAsync().then(props => props.map(p => `${p.id}=${p.value}`));

// --- Privacy / consent ---
BlueConicClient.getPrivacyLegislationAsync().then(l => l);
BlueConicClient.getPrivacyLegislationWithCallback(l => l);
BlueConicClient.getConsentedObjectivesAsync().then(o => o.length);
BlueConicClient.getConsentedObjectivesWithCallback(o => o.length);
BlueConicClient.getRefusedObjectivesAsync().then(o => o);
BlueConicClient.getRefusedObjectivesWithCallback(o => o);
BlueConicClient.setPrivacyLegislation("GDPR");
BlueConicClient.setConsentedObjectives(["analytics"]);
BlueConicClient.setRefusedObjectives(["advertising"]);
BlueConicClient.addConsentedObjective("analytics");
BlueConicClient.addRefusedObjective("advertising");

// --- Segments ---
BlueConicClient.getSegmentsAsync().then(segments => segments.map(s => `${s.id}:${s.name}`));
BlueConicClient.getSegmentsWithCallback(segments => segments.forEach(s => void s.id));
BlueConicClient.hasSegmentAsync("vip").then(has => !has);
BlueConicClient.hasSegmentWithCallback("vip", has => has);

// --- Profile writes ---
BlueConicClient.addProfileValue("tags", "loyal");
BlueConicClient.addProfileValues("tags", ["loyal", "returning"]);
BlueConicClient.setProfileValue("email", "a@b.c");
BlueConicClient.setProfileValues("tags", ["one", "two"]);
BlueConicClient.incrementProfileValue("visits", "1");

// --- Generic events ---
BlueConicClient.createEvent("custom", { foo: "bar" });
BlueConicClient.createEventAsync("custom", { foo: "bar" }).then(() => undefined);
BlueConicClient.createEventWithCallback("custom", { foo: "bar" }, () => undefined);

// --- Profile lifecycle ---
BlueConicClient.createProfile(() => undefined);
BlueConicClient.deleteProfile(() => undefined);
BlueConicClient.updateProfile();
BlueConicClient.updateProfileAsync().then(() => undefined);
BlueConicClient.updateProfileWithCallback(() => undefined);

// --- Config ---
BlueConicClient.setLocale("en_US");
BlueConicClient.setEnabled(true);
BlueConicClient.isEnabledAsync().then(b => b);
BlueConicClient.isEnabledWithCallback(b => b);

// --- Page view / interaction events ---
const props = { userId: "u1", count: 2, premium: true };
BlueConicClient.createPageViewEvent("Home", props);
BlueConicClient.createPageViewEventAsync("Home", props).then(() => undefined);
BlueConicClient.createPageViewEventWithCallback("Home", props, () => undefined);
BlueConicClient.createViewEvent("int-1", props);
BlueConicClient.createViewEventAsync("int-1", props).then(() => undefined);
BlueConicClient.createViewEventWithCallback("int-1", props, () => undefined);
BlueConicClient.createConversionEvent("int-1", props);
BlueConicClient.createConversionEventAsync("int-1", props).then(() => undefined);
BlueConicClient.createConversionEventWithCallback("int-1", props, () => undefined);
BlueConicClient.createClickEvent("int-1", props);
BlueConicClient.createClickEventAsync("int-1", props).then(() => undefined);
BlueConicClient.createClickEventWithCallback("int-1", props, () => undefined);

// --- Timeline ---
BlueConicClient.createTimelineEvent("purchase", new Date(), props);
BlueConicClient.createTimelineEventAsync("purchase", Date.now(), props).then(() => undefined);
BlueConicClient.createTimelineEventWithCallback("purchase", new Date(), props, () => undefined);
BlueConicClient.createTimelineEventById("e1", "purchase", new Date(), props);
BlueConicClient.createTimelineEventByIdAsync("e1", "purchase", Date.now(), props).then(() => undefined);
BlueConicClient.createTimelineEventByIdWithCallback("e1", "purchase", new Date(), props, () => undefined);

// --- Recommendations ---
BlueConicClient.createRecommendationEvent("store-1", "click", ["a", "b"]);
BlueConicClient.createRecommendationEventAsync("store-1", "click", ["a"]).then(() => undefined);
BlueConicClient.createRecommendationEventWithCallback("store-1", "click", ["a"], () => undefined);

// --- Pub/sub ---
BlueConicClient.subscribe(EventName.PropertiesDialogue, false, "sub-1");
BlueConicClient.unsubscribe("sub-1");

// --- Publish helpers ---
BlueConicClient.publishClickEvent(".btn", ["x"]);
BlueConicClient.publishClickEventWithCallback(".btn", ["x"], () => undefined);
BlueConicClient.publishFormSubmitEvent("#form", ["x"]);
BlueConicClient.publishFormSubmitEventWithCallback("#form", ["x"], () => undefined);
BlueConicClient.publishUpdateContentEvent("#a", "html");
BlueConicClient.publishUpdateContentEventWithCallback("#a", "html", () => undefined);
BlueConicClient.publishUpdateValuesEvent("#a", "v");
BlueConicClient.publishUpdateValuesEventWithCallback("#a", "v", () => undefined);
BlueConicClient.publishAdvancedEvent("named", ["v"]);
BlueConicClient.publishAdvancedEventWithCallback("named", ["v"], () => undefined);

// --- Misc ---
BlueConicClient.destroyPlugins();
BlueConicClient.getScreenNameAsync().then(n => n);
BlueConicClient.getScreenNameWithCallback(n => n);
