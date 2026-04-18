// Type definitions for @blueconic/blueconic-react-native 5.2
// Project: https://www.npmjs.com/package/@blueconic/blueconic-react-native
// Published as: @landerp/blueconic-react-native-types

declare module "@blueconic/blueconic-react-native" {
    export type PropertyBag = Record<string, string | number | boolean | ReadonlyArray<string>>;
    export type StringPropertyBag = Record<string, string>;

    export interface BlueConicConfigurationBuilder {
        setHostName(hostName: string): this;
        setDebug(debug: boolean): this;
        setOverrideAppId(overrideAppId: string): this;
        setSimulatorUsername(simulatorUsername: string): this;
        setSimulatorSessionId(simulatorSessionId: string): this;
        build(): BlueConicConfiguration;
    }

    export class BlueConicConfiguration {
        bc_hostname?: string;
        bc_debug?: boolean;
        override_app_id?: string;
        simulator_username?: string;
        simulator_session_id?: string;
        static readonly Builder: new () => BlueConicConfigurationBuilder;
    }

    export class EventName {
        static readonly PropertiesDialogue: "propertiesDialogueEvent";
        static readonly RecommendationsDialogue: "recommendationsDialogueEvent";
    }

    export class Event {
        name: string;
        context: unknown;
    }

    export class PropertiesDialogueEvent {
        variantId: string;
        position: string;
        data: Record<string, string | ReadonlyArray<string>>;
    }

    export interface Recommendation {
        id: string;
        [field: string]: unknown;
    }

    export class RecommendationsDialogueEvent {
        variantId: string;
        position: string;
        storeId: string;
        recommendations: Recommendation[];
    }

    export type InitializeCallback = (error: string | null) => void;
    export type StringCallback = (value: string) => void;
    export type StringArrayCallback = (values: string[]) => void;
    export type BooleanCallback = (value: boolean) => void;
    export type VoidCallback = () => void;
    export type PropertiesCallback = (properties: Record<string, string[]>) => void;

    export interface BlueConicClientStatic {
        initialize(properties: BlueConicConfiguration, callback: InitializeCallback): void;

        // Profile read
        getProfileIdAsync(): Promise<string>;
        getProfileIdWithCallback(callback: StringCallback): void;
        getProfileValueAsync(property: string): Promise<string>;
        getProfileValuesAsync(property: string): Promise<string[]>;
        getProfileValueWithCallback(property: string, callback: StringCallback): void;
        getProfileValuesWithCallback(property: string, callback: StringArrayCallback): void;
        getAllProfilePropertiesAsync(): Promise<Record<string, string[]>>;

        // Privacy
        getPrivacyLegislationAsync(): Promise<string>;
        getPrivacyLegislationWithCallback(callback: StringCallback): void;
        getConsentedObjectivesAsync(): Promise<string[]>;
        getConsentedObjectivesWithCallback(callback: StringArrayCallback): void;
        getRefusedObjectivesAsync(): Promise<string[]>;
        getRefusedObjectivesWithCallback(callback: StringArrayCallback): void;

        // Segments
        getSegmentsAsync(): Promise<string[]>;
        getSegmentsWithCallback(callback: StringArrayCallback): void;
        hasSegmentAsync(segmentId: string): Promise<boolean>;
        hasSegmentWithCallback(segmentId: string, callback: BooleanCallback): void;

        // Profile write
        addProfileValue(property: string, value: string): void;
        addProfileValues(property: string, values: ReadonlyArray<string>): void;
        addConsentedObjective(objectiveId: string): void;
        addRefusedObjective(objectiveId: string): void;
        setProfileValue(property: string, value: string): void;
        setProfileValues(property: string, values: ReadonlyArray<string>): void;
        incrementProfileValue(property: string, value: number): void;
        setPrivacyLegislation(privacyLegislation: string): void;
        setConsentedObjectives(objectiveIds: ReadonlyArray<string>): void;
        setRefusedObjectives(objectiveIds: ReadonlyArray<string>): void;

        // Generic events
        createEvent(eventName: string, properties: StringPropertyBag): void;
        createEventAsync(eventName: string, properties: StringPropertyBag): Promise<void>;
        createEventWithCallback(eventName: string, properties: StringPropertyBag, callback: VoidCallback): void;

        // Profile lifecycle
        createProfile(callback: VoidCallback): void;
        deleteProfile(callback: VoidCallback): void;
        updateProfile(): void;
        updateProfileAsync(): Promise<void>;
        updateProfileWithCallback(callback: VoidCallback): void;

        // Config
        setLocale(locale: string): void;
        setEnabled(isEnabled: boolean): void;
        isEnabledAsync(): Promise<boolean>;
        isEnabledWithCallback(callback: BooleanCallback): void;

        // Page view / interaction events
        createPageViewEvent(screenName: string, properties: PropertyBag): void;
        createPageViewEventAsync(screenName: string, properties: PropertyBag): Promise<void>;
        createPageViewEventWithCallback(screenName: string, properties: PropertyBag, callback: VoidCallback): void;

        createViewEvent(interactionId: string, properties: PropertyBag): void;
        createViewEventAsync(interactionId: string, properties: PropertyBag): Promise<void>;
        createViewEventWithCallback(interactionId: string, properties: PropertyBag, callback: VoidCallback): void;

        createConversionEvent(interactionId: string, properties: PropertyBag): void;
        createConversionEventAsync(interactionId: string, properties: PropertyBag): Promise<void>;
        createConversionEventWithCallback(
            interactionId: string,
            properties: PropertyBag,
            callback: VoidCallback,
        ): void;

        createClickEvent(interactionId: string, properties: PropertyBag): void;
        createClickEventAsync(interactionId: string, properties: PropertyBag): Promise<void>;
        createClickEventWithCallback(interactionId: string, properties: PropertyBag, callback: VoidCallback): void;

        // Timeline events
        createTimelineEvent(eventType: string, eventDate: Date | number, properties: PropertyBag): void;
        createTimelineEventAsync(eventType: string, eventDate: Date | number, properties: PropertyBag): Promise<void>;
        createTimelineEventWithCallback(
            eventType: string,
            eventDate: Date | number,
            properties: PropertyBag,
            callback: VoidCallback,
        ): void;
        createTimelineEventById(
            eventId: string,
            eventType: string,
            eventDate: Date | number,
            properties: PropertyBag,
        ): void;
        createTimelineEventByIdAsync(
            eventId: string,
            eventType: string,
            eventDate: Date | number,
            properties: PropertyBag,
        ): Promise<void>;
        createTimelineEventByIdWithCallback(
            eventId: string,
            eventType: string,
            eventDate: Date | number,
            properties: PropertyBag,
            callback: VoidCallback,
        ): void;

        // Recommendation events
        createRecommendationEvent(storeId: string, action: string, itemIds: ReadonlyArray<string>): void;
        createRecommendationEventAsync(
            storeId: string,
            action: string,
            itemIds: ReadonlyArray<string>,
        ): Promise<void>;
        createRecommendationEventWithCallback(
            storeId: string,
            action: string,
            itemIds: ReadonlyArray<string>,
            callback: VoidCallback,
        ): void;

        // Pub/sub
        subscribe(eventName: string, onlyOnce: boolean, identifier: string): void;
        unsubscribe(identifier: string): void;

        // Publish helpers
        publishClickEvent(selector: string, values: ReadonlyArray<string>): void;
        publishClickEventWithCallback(
            selector: string,
            values: ReadonlyArray<string>,
            callback: VoidCallback,
        ): void;
        publishFormSubmitEvent(selector: string, values: ReadonlyArray<string>): void;
        publishFormSubmitEventWithCallback(
            selector: string,
            values: ReadonlyArray<string>,
            callback: VoidCallback,
        ): void;
        publishUpdateContentEvent(selector: string, value: string): void;
        publishUpdateContentEventWithCallback(selector: string, value: string, callback: VoidCallback): void;
        publishUpdateValuesEvent(selector: string, value: string): void;
        publishUpdateValuesEventWithCallback(selector: string, value: string, callback: VoidCallback): void;
        publishAdvancedEvent(name: string, values: ReadonlyArray<string>): void;
        publishAdvancedEventWithCallback(
            name: string,
            values: ReadonlyArray<string>,
            callback: VoidCallback,
        ): void;

        // Misc
        destroyPlugins(): void;
        getScreenNameAsync(): Promise<string>;
        getScreenNameWithCallback(callback: StringCallback): void;
    }

    const BlueConicClient: BlueConicClientStatic;
    export default BlueConicClient;
}
