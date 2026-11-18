// Type definitions for @blueconic/blueconic-react-native 5.3
// Project: https://www.npmjs.com/package/@blueconic/blueconic-react-native
// Published as: @landerp/blueconic-react-native-types

declare module "@blueconic/blueconic-react-native" {
    /** A JSON value that the event bridge can transport. */
    export type PropertyValue = string | number | boolean | null | readonly PropertyValue[] | PropertyBag;

    /** Properties for page views, interactions, and timeline events. */
    export type PropertyBag = { [key: string]: PropertyValue };

    /** String properties for generic events and advanced events with object context. */
    export type StringPropertyBag = Record<string, string>;

    /**
     * Fluent builder for {@link BlueConicConfiguration}. Configure hostname,
     * debug flag, and optional simulator/override fields, then call `build()`.
     */
    export interface BlueConicConfigurationBuilder<Host extends string | undefined = string | undefined> {
        /** Sets the server URL and returns the builder ready for initialization. */
        setHostName(hostName: string): BlueConicConfigurationBuilder<string>;
        /** Enables verbose native logging. Disable in production. */
        setDebug(debug: boolean): this;
        /** Overrides the bundle/app identifier reported to BlueConic. */
        setOverrideAppId(overrideAppId: string): this;
        /** Sets the simulator username used when testing from the BlueConic simulator. */
        setSimulatorUsername(simulatorUsername: string): this;
        /** Sets the simulator session ID used when testing from the BlueConic simulator. */
        setSimulatorSessionId(simulatorSessionId: string): this;
        /** Finalizes the configuration and returns a {@link BlueConicConfiguration}. */
        build(): BlueConicConfiguration<Host>;
    }

    /**
     * Configuration object passed to `BlueConicClient.initialize`.
     * Call `setHostName()` on the builder before initializing the client.
     */
    export class BlueConicConfiguration<Host extends string | undefined = string> {
        constructor(builder: BlueConicConfigurationBuilder<Host>);
        bc_hostname: Host;
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

    /** JavaScript event model. Its fields start out undefined. */
    export class Event {
        name?: string;
        context?: Record<string, unknown>;
    }

    /** Plain object delivered on the `blueConicEvent` channel for a custom subscription. */
    export interface BlueConicEventPayload {
        name: string;
        context?: Record<string, unknown>;
    }

    /** JavaScript Properties Dialogue model. Its fields start out undefined. */
    export class PropertiesDialogueEvent {
        variantId?: string;
        position?: string;
        data?: string;
    }

    /** Plain object delivered on the `propertiesDialogueEvent` channel. */
    export interface PropertiesDialoguePayload {
        variantId: string;
        position: string;
        /** JSON text containing the dialogue's properties. */
        data: string;
    }

    /** An item shape for applications that validate the decoded recommendations. */
    export interface Recommendation {
        id: string;
        [field: string]: unknown;
    }

    /** JavaScript Recommendations Dialogue model. Its fields start out undefined. */
    export class RecommendationsDialogueEvent {
        variantId?: string;
        position?: string;
        storeId?: string;
        recommendations?: string;
    }

    /** Plain object delivered on the `recommendationsDialogueEvent` channel. */
    export interface RecommendationsDialoguePayload {
        variantId: string;
        position: string;
        storeId: string;
        /** JSON text containing the recommendations. */
        recommendations: string;
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

    /** Callback accepting a single array of strings. */
    export type StringArrayCallback = (values: string[]) => void;

    /** Callback receiving a single boolean, as delivered by iOS. */
    export type BooleanCallback = (value: boolean) => void;

    /** Alias for {@link SuccessErrorCallback}. Kept for readability on void-returning operations. */
    export type VoidCallback = SuccessErrorCallback;

    /** Callback accepting profile properties grouped by property ID. */
    export type PropertiesCallback = (properties: Record<string, string[]>) => void;

    /** A BlueConic segment the current profile belongs to. */
    export interface Segment {
        id: string;
        name: string;
    }

    /** Android callback receiving the list of segments as one argument. */
    export type SegmentsCallback = (segments: Segment[]) => void;

    /** A single property entry returned by `getAllProfilePropertiesAsync`. */
    export interface ProfileProperty {
        id: string;
        /** Comma-joined list of values the native side serializes. */
        value: string;
    }

    /**
     * Operations with the same signature on the iOS and Android native clients.
     * Event creation and profile update promises resolve with an empty array
     * when the SDK finishes, including on SDK errors. Use the callback forms
     * to receive the success flag and error.
     *
     * @see https://support.blueconic.com/en/articles/248017-blueconic-sdk-for-react-native
     */
    interface BlueConicCommonClient {
        /**
         * Initializes the BlueConic client. Must be called before any tracking
         * or profile API. The callback fires once the native side has connected
         * to the configured host.
         */
        initialize(properties: BlueConicConfiguration, callback: InitializeCallback): void;

        // Profile read
        /** Resolves with every property on the current profile and its values. */
        getAllProfilePropertiesAsync(): Promise<ProfileProperty[]>;

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
        /** Increments a numeric profile property by the given integer. */
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
        createEventAsync(eventName: string, properties: StringPropertyBag): Promise<[]>;
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
        updateProfileAsync(): Promise<[]>;
        /** Callback variant of {@link BlueConicClientStatic.updateProfile}. */
        updateProfileWithCallback(callback: VoidCallback): void;

        // Config
        /** Sets the locale used when resolving localized dialogue content. */
        setLocale(locale: string): void;
        /** Enables or disables the BlueConic client without uninitializing it. */
        setEnabled(isEnabled: boolean): void;
        /** Resolves with a one-element array containing the current enabled flag. */
        isEnabledAsync(): Promise<[boolean]>;

        // Page view / interaction events
        /**
         * Records a PAGEVIEW event for the given screen. Must be called on every
         * screen change — this is what triggers BlueConic plugins (listeners,
         * dialogues, recommendations) to evaluate for the screen.
         */
        createPageViewEvent(screenName: string, properties: PropertyBag): void;
        /** Promise variant of {@link BlueConicClientStatic.createPageViewEvent}. */
        createPageViewEventAsync(screenName: string, properties: PropertyBag): Promise<[]>;
        /** Callback variant of {@link BlueConicClientStatic.createPageViewEvent}. */
        createPageViewEventWithCallback(screenName: string, properties: PropertyBag, callback: VoidCallback): void;

        /** Records a VIEW interaction event (e.g. user saw a specific element). */
        createViewEvent(interactionId: string, properties: PropertyBag): void;
        /** Promise variant of {@link BlueConicClientStatic.createViewEvent}. */
        createViewEventAsync(interactionId: string, properties: PropertyBag): Promise<[]>;
        /** Callback variant of {@link BlueConicClientStatic.createViewEvent}. */
        createViewEventWithCallback(interactionId: string, properties: PropertyBag, callback: VoidCallback): void;

        /** Records a CONVERSION interaction event (e.g. user completed a goal). */
        createConversionEvent(interactionId: string, properties: PropertyBag): void;
        /** Promise variant of {@link BlueConicClientStatic.createConversionEvent}. */
        createConversionEventAsync(interactionId: string, properties: PropertyBag): Promise<[]>;
        /** Callback variant of {@link BlueConicClientStatic.createConversionEvent}. */
        createConversionEventWithCallback(
            interactionId: string,
            properties: PropertyBag,
            callback: VoidCallback,
        ): void;

        /** Records a CLICK interaction event (e.g. user tapped a tracked element). */
        createClickEvent(interactionId: string, properties: PropertyBag): void;
        /** Promise variant of {@link BlueConicClientStatic.createClickEvent}. */
        createClickEventAsync(interactionId: string, properties: PropertyBag): Promise<[]>;
        /** Callback variant of {@link BlueConicClientStatic.createClickEvent}. */
        createClickEventWithCallback(interactionId: string, properties: PropertyBag, callback: VoidCallback): void;

        // Timeline events
        /** Records a timeline event at the given Unix timestamp in milliseconds. */
        createTimelineEvent(eventType: string, eventDate: number, properties: PropertyBag): void;
        /** Promise variant of {@link BlueConicClientStatic.createTimelineEvent}. */
        createTimelineEventAsync(eventType: string, eventDate: number, properties: PropertyBag): Promise<[]>;
        /** Callback variant of {@link BlueConicClientStatic.createTimelineEvent}. */
        createTimelineEventWithCallback(
            eventType: string,
            eventDate: number,
            properties: PropertyBag,
            callback: VoidCallback,
        ): void;
        /** Records a timeline event with an explicit ID and a Unix timestamp in milliseconds. */
        createTimelineEventById(
            eventId: string,
            eventType: string,
            eventDate: number,
            properties: PropertyBag,
        ): void;
        /** Promise variant of {@link BlueConicClientStatic.createTimelineEventById}. */
        createTimelineEventByIdAsync(
            eventId: string,
            eventType: string,
            eventDate: number,
            properties: PropertyBag,
        ): Promise<[]>;
        /** Callback variant of {@link BlueConicClientStatic.createTimelineEventById}. */
        createTimelineEventByIdWithCallback(
            eventId: string,
            eventType: string,
            eventDate: number,
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
        ): Promise<[]>;
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
        /** Publishes an advanced event with string values keyed by context name. */
        publishAdvancedEventWithObjectContext(name: string, context: StringPropertyBag): void;
        /** Reports the outcome of publishing the object context to listeners. */
        publishAdvancedEventWithObjectContextWithCallback(
            name: string,
            context: StringPropertyBag,
            callback: SuccessErrorCallback,
        ): void;

        // Misc
        /** Tears down any active plugins. Normally called as part of unmount. */
        destroyPlugins(): void;
        /** Receives the last screen name set via `createPageViewEvent`. */
        getScreenNameWithCallback(callback: StringCallback): void;

        // NativeModule conformance — required so BlueConicClient can be
        // passed to `new NativeEventEmitter(...)` under RN 0.65+.
        /** Required by `NativeEventEmitter` to register a listener for a given event type. */
        addListener(eventType: string): void;
        /** Required by `NativeEventEmitter` to remove the given number of listeners. */
        removeListeners(count: number): void;
    }

    /**
     * The iOS bridge preserves its result arrays for promises. For callbacks it
     * passes each element of the native array as a separate JavaScript argument.
     */
    export interface BlueConicIOSClient extends BlueConicCommonClient {
        /** Profile ID or an empty string, inside a one-element array. */
        getProfileIdAsync(): Promise<[string]>;
        getProfileIdWithCallback(callback: StringCallback): void;
        getProfileValueAsync(property: string): Promise<[string]>;
        getProfileValueWithCallback(property: string, callback: StringCallback): void;
        /** Resolves with undefined when the native profile supplies no list. */
        getProfileValuesAsync(property: string): Promise<string[] | undefined>;
        getProfileValuesWithCallback(property: string, callback: (...values: string[]) => void): void;

        getPrivacyLegislationAsync(): Promise<[string]>;
        getPrivacyLegislationWithCallback(callback: StringCallback): void;
        getConsentedObjectivesAsync(): Promise<string[] | undefined>;
        getConsentedObjectivesWithCallback(callback: (...objectiveIds: string[]) => void): void;
        getRefusedObjectivesAsync(): Promise<string[] | undefined>;
        getRefusedObjectivesWithCallback(callback: (...objectiveIds: string[]) => void): void;

        getSegmentsAsync(): Promise<Segment[]>;
        /** Receives one argument per segment, or no arguments for an empty list. */
        getSegmentsWithCallback(callback: (...segments: Segment[]) => void): void;
        hasSegmentAsync(segmentId: string): Promise<[boolean]>;
        hasSegmentWithCallback(segmentId: string, callback: BooleanCallback): void;

        isEnabledWithCallback(callback: BooleanCallback): void;
        getScreenNameAsync(): Promise<[string]>;
    }

    /**
     * The Android bridge passes a single argument to each read callback.
     * Lists of profile values and objectives are nested inside a one-element array.
     */
    export interface BlueConicAndroidClient extends BlueConicCommonClient {
        getProfileIdAsync(): Promise<string | null>;
        getProfileIdWithCallback(callback: (value: string | null) => void): void;
        getProfileValueAsync(property: string): Promise<[string | null]>;
        getProfileValueWithCallback(property: string, callback: (value: [string | null]) => void): void;
        getProfileValuesAsync(property: string): Promise<[string[]]>;
        getProfileValuesWithCallback(property: string, callback: (values: [string[]]) => void): void;

        getPrivacyLegislationAsync(): Promise<[string | null]>;
        getPrivacyLegislationWithCallback(callback: (legislation: [string | null]) => void): void;
        getConsentedObjectivesAsync(): Promise<[string[]]>;
        getConsentedObjectivesWithCallback(callback: (objectiveIds: [string[]]) => void): void;
        getRefusedObjectivesAsync(): Promise<[string[]]>;
        getRefusedObjectivesWithCallback(callback: (objectiveIds: [string[]]) => void): void;

        getSegments(): Promise<Segment[]>;
        getSegmentsWithCallback(callback: SegmentsCallback): void;
        /**
         * SDK 5.3.0 sends a Java ArrayList that React Native 0.85.1 cannot
         * serialize. Use `getSegments()` and check the IDs on that version.
         */
        hasSegment(segmentId: string): Promise<[boolean]>;
        /** Has the same Android serialization issue as {@link BlueConicAndroidClient.hasSegment}. */
        hasSegmentWithCallback(segmentId: string, callback: (membership: [boolean]) => void): void;
        /** Uses the same Java ArrayList as `hasSegment`. Use `isEnabledAsync()` on React Native 0.85.1. */
        isEnabledWithCallback(callback: (enabled: [boolean]) => void): void;
        getScreenNameAsync(): Promise<string>;
    }

    /**
     * Use `"getSegmentsAsync" in client` to narrow the type to iOS. Also check
     * `typeof client.getSegmentsAsync === "function"` in a runtime type guard,
     * since Hermes native host objects can report missing properties as present.
     */
    export type BlueConicClientStatic = BlueConicIOSClient | BlueConicAndroidClient;

    const BlueConicClient: BlueConicClientStatic;
    export default BlueConicClient;
}
