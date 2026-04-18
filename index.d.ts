// Type definitions for @blueconic/blueconic-react-native 5.2
// Project: https://www.npmjs.com/package/@blueconic/blueconic-react-native
// Published as: @landerp/blueconic-react-native-types

declare module "@blueconic/blueconic-react-native" {
    /** Dictionary of property values that can be attached to BlueConic events. */
    export type PropertyBag = Record<string, string | number | boolean | ReadonlyArray<string>>;

    /** Dictionary of string-only properties (used by generic events). */
    export type StringPropertyBag = Record<string, string>;

    /**
     * Fluent builder for {@link BlueConicConfiguration}. Configure hostname,
     * debug flag, and optional simulator/override fields, then call `build()`.
     */
    export interface BlueConicConfigurationBuilder {
        /** Sets the BlueConic server URL (e.g. `https://example.blueconic.net`). */
        setHostName(hostName: string): this;
        /** Enables verbose native logging. Disable in production. */
        setDebug(debug: boolean): this;
        /** Overrides the bundle/app identifier reported to BlueConic. */
        setOverrideAppId(overrideAppId: string): this;
        /** Sets the simulator username used when testing from the BlueConic simulator. */
        setSimulatorUsername(simulatorUsername: string): this;
        /** Sets the simulator session ID used when testing from the BlueConic simulator. */
        setSimulatorSessionId(simulatorSessionId: string): this;
        /** Finalizes the configuration and returns a {@link BlueConicConfiguration}. */
        build(): BlueConicConfiguration;
    }

    /**
     * Immutable configuration object passed to `BlueConicClient.initialize`.
     * Construct via `new BlueConicConfiguration.Builder()…build()`.
     */
    export class BlueConicConfiguration {
        bc_hostname?: string;
        bc_debug?: boolean;
        override_app_id?: string;
        simulator_username?: string;
        simulator_session_id?: string;
        /** Factory for {@link BlueConicConfigurationBuilder}. */
        static readonly Builder: new () => BlueConicConfigurationBuilder;
    }

    /** Enumeration of event names the client can emit to JS subscribers. */
    export class EventName {
        /** Fired when a Properties Dialogue plugin delivers its payload. */
        static readonly PropertiesDialogue: "propertiesDialogueEvent";
        /** Fired when a Recommendations Dialogue plugin delivers its payload. */
        static readonly RecommendationsDialogue: "recommendationsDialogueEvent";
    }

    /** Base class for events delivered through the `subscribe` channel. */
    export class Event {
        name: string;
        context: unknown;
    }

    /** Payload for a Properties Dialogue interaction. */
    export class PropertiesDialogueEvent {
        variantId: string;
        position: string;
        data: Record<string, string | ReadonlyArray<string>>;
    }

    /** A single recommended item returned by a Recommendations Dialogue. */
    export interface Recommendation {
        id: string;
        [field: string]: unknown;
    }

    /** Payload for a Recommendations Dialogue interaction. */
    export class RecommendationsDialogueEvent {
        variantId: string;
        position: string;
        storeId: string;
        recommendations: Recommendation[];
    }

    /**
     * Callback shape the native layer uses for operations that report outcome
     * without returning a value. Invoked with `(success, error)` where `error`
     * is `null` on success.
     */
    export type SuccessErrorCallback = (success: boolean, error: string | null) => void;

    /** Callback for `initialize`. Invoked with `(success, error)`. */
    export type InitializeCallback = SuccessErrorCallback;

    /** Callback returning a single string value (e.g. profile ID). */
    export type StringCallback = (value: string) => void;

    /** Callback returning an array of strings (e.g. profile values). */
    export type StringArrayCallback = (values: string[]) => void;

    /** Callback returning a single boolean value (e.g. segment membership). */
    export type BooleanCallback = (value: boolean) => void;

    /** Alias for {@link SuccessErrorCallback}. Kept for readability on void-returning operations. */
    export type VoidCallback = SuccessErrorCallback;

    /** Callback returning a map of profile properties to their values. */
    export type PropertiesCallback = (properties: Record<string, string[]>) => void;

    /**
     * The BlueConic React Native client. Mirror of the native `BlueConicClient`
     * singleton; all methods are thin wrappers over the iOS/Android bridge.
     *
     * @see https://support.blueconic.com/hc/en-us/categories/360002108332
     */
    export interface BlueConicClientStatic {
        /**
         * Initializes the BlueConic client. Must be called before any tracking
         * or profile API. The callback fires once the native side has connected
         * to the configured host.
         */
        initialize(properties: BlueConicConfiguration, callback: InitializeCallback): void;

        // Profile read
        /** Resolves with the current BlueConic profile ID. */
        getProfileIdAsync(): Promise<string>;
        /** Callback variant of {@link BlueConicClientStatic.getProfileIdAsync}. */
        getProfileIdWithCallback(callback: StringCallback): void;
        /** Resolves with the first value stored for the given profile property. */
        getProfileValueAsync(property: string): Promise<string>;
        /** Resolves with every value stored for the given profile property. */
        getProfileValuesAsync(property: string): Promise<string[]>;
        /** Callback variant of {@link BlueConicClientStatic.getProfileValueAsync}. */
        getProfileValueWithCallback(property: string, callback: StringCallback): void;
        /** Callback variant of {@link BlueConicClientStatic.getProfileValuesAsync}. */
        getProfileValuesWithCallback(property: string, callback: StringArrayCallback): void;
        /** Resolves with every property on the current profile and its values. */
        getAllProfilePropertiesAsync(): Promise<Record<string, string[]>>;

        // Privacy
        /** Resolves with the privacy legislation code set on the profile (e.g. `GDPR`). */
        getPrivacyLegislationAsync(): Promise<string>;
        /** Callback variant of {@link BlueConicClientStatic.getPrivacyLegislationAsync}. */
        getPrivacyLegislationWithCallback(callback: StringCallback): void;
        /** Resolves with the objective IDs the user has consented to. */
        getConsentedObjectivesAsync(): Promise<string[]>;
        /** Callback variant of {@link BlueConicClientStatic.getConsentedObjectivesAsync}. */
        getConsentedObjectivesWithCallback(callback: StringArrayCallback): void;
        /** Resolves with the objective IDs the user has refused. */
        getRefusedObjectivesAsync(): Promise<string[]>;
        /** Callback variant of {@link BlueConicClientStatic.getRefusedObjectivesAsync}. */
        getRefusedObjectivesWithCallback(callback: StringArrayCallback): void;

        // Segments
        /** Resolves with the segment IDs the current profile belongs to. */
        getSegmentsAsync(): Promise<string[]>;
        /** Callback variant of {@link BlueConicClientStatic.getSegmentsAsync}. */
        getSegmentsWithCallback(callback: StringArrayCallback): void;
        /** Resolves with `true` if the profile is a member of the given segment. */
        hasSegmentAsync(segmentId: string): Promise<boolean>;
        /** Callback variant of {@link BlueConicClientStatic.hasSegmentAsync}. */
        hasSegmentWithCallback(segmentId: string, callback: BooleanCallback): void;

        // Profile write
        /** Appends a single value to a profile property (duplicates are ignored). */
        addProfileValue(property: string, value: string): void;
        /** Appends multiple values to a profile property (duplicates are ignored). */
        addProfileValues(property: string, values: ReadonlyArray<string>): void;
        /** Adds an objective ID to the consented objectives list. */
        addConsentedObjective(objectiveId: string): void;
        /** Adds an objective ID to the refused objectives list. */
        addRefusedObjective(objectiveId: string): void;
        /** Sets a profile property to a single value, replacing any previous values. */
        setProfileValue(property: string, value: string): void;
        /** Sets a profile property to the given values, replacing any previous values. */
        setProfileValues(property: string, values: ReadonlyArray<string>): void;
        /** Increments a numeric profile property by the given delta. */
        incrementProfileValue(property: string, value: number): void;
        /** Sets the privacy legislation code (e.g. `GDPR`, `CCPA`). */
        setPrivacyLegislation(privacyLegislation: string): void;
        /** Replaces the consented objectives list with the given IDs. */
        setConsentedObjectives(objectiveIds: ReadonlyArray<string>): void;
        /** Replaces the refused objectives list with the given IDs. */
        setRefusedObjectives(objectiveIds: ReadonlyArray<string>): void;

        // Generic events
        /** Records a generic named event with string-only properties. */
        createEvent(eventName: string, properties: StringPropertyBag): void;
        /** Promise variant of {@link BlueConicClientStatic.createEvent}. */
        createEventAsync(eventName: string, properties: StringPropertyBag): Promise<void>;
        /** Callback variant of {@link BlueConicClientStatic.createEvent}. */
        createEventWithCallback(eventName: string, properties: StringPropertyBag, callback: VoidCallback): void;

        // Profile lifecycle
        /** Creates a new profile on the BlueConic server and swaps it in locally. */
        createProfile(callback: VoidCallback): void;
        /** Deletes the current profile on the BlueConic server and generates a new one. */
        deleteProfile(callback: VoidCallback): void;
        /** Flushes any pending profile updates to the server (fire-and-forget). */
        updateProfile(): void;
        /** Promise variant of {@link BlueConicClientStatic.updateProfile}. */
        updateProfileAsync(): Promise<void>;
        /** Callback variant of {@link BlueConicClientStatic.updateProfile}. */
        updateProfileWithCallback(callback: VoidCallback): void;

        // Config
        /** Sets the locale used when resolving localized dialogue content. */
        setLocale(locale: string): void;
        /** Enables or disables the BlueConic client without uninitializing it. */
        setEnabled(isEnabled: boolean): void;
        /** Resolves with `true` when the BlueConic client is currently enabled. */
        isEnabledAsync(): Promise<boolean>;
        /** Callback variant of {@link BlueConicClientStatic.isEnabledAsync}. */
        isEnabledWithCallback(callback: BooleanCallback): void;

        // Page view / interaction events
        /**
         * Records a PAGEVIEW event for the given screen. Must be called on every
         * screen change — this is what triggers BlueConic plugins (listeners,
         * dialogues, recommendations) to evaluate for the screen.
         */
        createPageViewEvent(screenName: string, properties: PropertyBag): void;
        /** Promise variant of {@link BlueConicClientStatic.createPageViewEvent}. */
        createPageViewEventAsync(screenName: string, properties: PropertyBag): Promise<void>;
        /** Callback variant of {@link BlueConicClientStatic.createPageViewEvent}. */
        createPageViewEventWithCallback(screenName: string, properties: PropertyBag, callback: VoidCallback): void;

        /** Records a VIEW interaction event (e.g. user saw a specific element). */
        createViewEvent(interactionId: string, properties: PropertyBag): void;
        /** Promise variant of {@link BlueConicClientStatic.createViewEvent}. */
        createViewEventAsync(interactionId: string, properties: PropertyBag): Promise<void>;
        /** Callback variant of {@link BlueConicClientStatic.createViewEvent}. */
        createViewEventWithCallback(interactionId: string, properties: PropertyBag, callback: VoidCallback): void;

        /** Records a CONVERSION interaction event (e.g. user completed a goal). */
        createConversionEvent(interactionId: string, properties: PropertyBag): void;
        /** Promise variant of {@link BlueConicClientStatic.createConversionEvent}. */
        createConversionEventAsync(interactionId: string, properties: PropertyBag): Promise<void>;
        /** Callback variant of {@link BlueConicClientStatic.createConversionEvent}. */
        createConversionEventWithCallback(
            interactionId: string,
            properties: PropertyBag,
            callback: VoidCallback,
        ): void;

        /** Records a CLICK interaction event (e.g. user tapped a tracked element). */
        createClickEvent(interactionId: string, properties: PropertyBag): void;
        /** Promise variant of {@link BlueConicClientStatic.createClickEvent}. */
        createClickEventAsync(interactionId: string, properties: PropertyBag): Promise<void>;
        /** Callback variant of {@link BlueConicClientStatic.createClickEvent}. */
        createClickEventWithCallback(interactionId: string, properties: PropertyBag, callback: VoidCallback): void;

        // Timeline events
        /** Records a timeline event of the given type at the given date. */
        createTimelineEvent(eventType: string, eventDate: Date | number, properties: PropertyBag): void;
        /** Promise variant of {@link BlueConicClientStatic.createTimelineEvent}. */
        createTimelineEventAsync(eventType: string, eventDate: Date | number, properties: PropertyBag): Promise<void>;
        /** Callback variant of {@link BlueConicClientStatic.createTimelineEvent}. */
        createTimelineEventWithCallback(
            eventType: string,
            eventDate: Date | number,
            properties: PropertyBag,
            callback: VoidCallback,
        ): void;
        /** Records a timeline event with an explicit ID (used for idempotent upserts). */
        createTimelineEventById(
            eventId: string,
            eventType: string,
            eventDate: Date | number,
            properties: PropertyBag,
        ): void;
        /** Promise variant of {@link BlueConicClientStatic.createTimelineEventById}. */
        createTimelineEventByIdAsync(
            eventId: string,
            eventType: string,
            eventDate: Date | number,
            properties: PropertyBag,
        ): Promise<void>;
        /** Callback variant of {@link BlueConicClientStatic.createTimelineEventById}. */
        createTimelineEventByIdWithCallback(
            eventId: string,
            eventType: string,
            eventDate: Date | number,
            properties: PropertyBag,
            callback: VoidCallback,
        ): void;

        // Recommendation events
        /** Records a recommendation action event (impression, click, conversion) for a store. */
        createRecommendationEvent(storeId: string, action: string, itemIds: ReadonlyArray<string>): void;
        /** Promise variant of {@link BlueConicClientStatic.createRecommendationEvent}. */
        createRecommendationEventAsync(
            storeId: string,
            action: string,
            itemIds: ReadonlyArray<string>,
        ): Promise<void>;
        /** Callback variant of {@link BlueConicClientStatic.createRecommendationEvent}. */
        createRecommendationEventWithCallback(
            storeId: string,
            action: string,
            itemIds: ReadonlyArray<string>,
            callback: VoidCallback,
        ): void;

        // Pub/sub
        /**
         * Subscribes to a named event (see {@link EventName}). `onlyOnce` makes
         * the subscription fire once and auto-remove; `identifier` is an opaque
         * tag used by {@link BlueConicClientStatic.unsubscribe}.
         */
        subscribe(eventName: string, onlyOnce: boolean, identifier: string): void;
        /** Removes the subscription previously registered with the given identifier. */
        unsubscribe(identifier: string): void;

        // Publish helpers
        /** Publishes a synthetic CLICK event to BlueConic listeners. */
        publishClickEvent(selector: string, values: ReadonlyArray<string>): void;
        /** Callback variant of {@link BlueConicClientStatic.publishClickEvent}. */
        publishClickEventWithCallback(
            selector: string,
            values: ReadonlyArray<string>,
            callback: VoidCallback,
        ): void;
        /** Publishes a synthetic form-submit event to BlueConic listeners. */
        publishFormSubmitEvent(selector: string, values: ReadonlyArray<string>): void;
        /** Callback variant of {@link BlueConicClientStatic.publishFormSubmitEvent}. */
        publishFormSubmitEventWithCallback(
            selector: string,
            values: ReadonlyArray<string>,
            callback: VoidCallback,
        ): void;
        /** Publishes a content update event so BlueConic listeners can update the UI. */
        publishUpdateContentEvent(selector: string, value: string): void;
        /** Callback variant of {@link BlueConicClientStatic.publishUpdateContentEvent}. */
        publishUpdateContentEventWithCallback(selector: string, value: string, callback: VoidCallback): void;
        /** Publishes a value update event so BlueConic listeners can react to changed values. */
        publishUpdateValuesEvent(selector: string, value: string): void;
        /** Callback variant of {@link BlueConicClientStatic.publishUpdateValuesEvent}. */
        publishUpdateValuesEventWithCallback(selector: string, value: string, callback: VoidCallback): void;
        /** Publishes an advanced event with arbitrary named values. */
        publishAdvancedEvent(name: string, values: ReadonlyArray<string>): void;
        /** Callback variant of {@link BlueConicClientStatic.publishAdvancedEvent}. */
        publishAdvancedEventWithCallback(
            name: string,
            values: ReadonlyArray<string>,
            callback: VoidCallback,
        ): void;

        // Misc
        /** Tears down any active plugins. Normally called as part of unmount. */
        destroyPlugins(): void;
        /** Resolves with the last screen name set via `createPageViewEvent`. */
        getScreenNameAsync(): Promise<string>;
        /** Callback variant of {@link BlueConicClientStatic.getScreenNameAsync}. */
        getScreenNameWithCallback(callback: StringCallback): void;
    }

    const BlueConicClient: BlueConicClientStatic;
    export default BlueConicClient;
}
