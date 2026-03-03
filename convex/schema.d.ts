declare const _default: import("convex/server").SchemaDefinition<{
    users: import("convex/server").TableDefinition<import("convex/values").VObject<{
        name?: string | undefined;
        email?: string | undefined;
        image?: string | undefined;
        convexUserId?: string | undefined;
        stripeCustomerId?: string | undefined;
        role?: "superAdmin" | "user" | "reseller" | undefined;
        createdAt?: number | undefined;
    }, {
        name: import("convex/values").VString<string | undefined, "optional">;
        email: import("convex/values").VString<string | undefined, "optional">;
        image: import("convex/values").VString<string | undefined, "optional">;
        convexUserId: import("convex/values").VString<string | undefined, "optional">;
        stripeCustomerId: import("convex/values").VString<string | undefined, "optional">;
        role: import("convex/values").VUnion<"superAdmin" | "user" | "reseller" | undefined, [import("convex/values").VLiteral<"superAdmin", "required">, import("convex/values").VLiteral<"user", "required">, import("convex/values").VLiteral<"reseller", "required">], "optional", never>;
        createdAt: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "name" | "email" | "image" | "convexUserId" | "stripeCustomerId" | "role" | "createdAt">, {
        by_convex_user: ["convexUserId", "_creationTime"];
    }, {}, {}>;
    projects: import("convex/server").TableDefinition<import("convex/values").VObject<{
        resellerId?: import("convex/values").GenericId<"users"> | undefined;
        prospectId?: import("convex/values").GenericId<"prospects"> | undefined;
        prompt?: string | undefined;
        vercelProjectId?: string | undefined;
        githubRepoId?: string | undefined;
        primaryUrl?: string | undefined;
        name: string;
        createdAt: number;
        userId: import("convex/values").GenericId<"users">;
        slug: string;
        plan: "website" | "webapp" | "authdb" | "ai";
        status: "preview" | "creating" | "live" | "suspended" | "deleted";
    }, {
        userId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        resellerId: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        prospectId: import("convex/values").VId<import("convex/values").GenericId<"prospects"> | undefined, "optional">;
        name: import("convex/values").VString<string, "required">;
        slug: import("convex/values").VString<string, "required">;
        prompt: import("convex/values").VString<string | undefined, "optional">;
        plan: import("convex/values").VUnion<"website" | "webapp" | "authdb" | "ai", [import("convex/values").VLiteral<"website", "required">, import("convex/values").VLiteral<"webapp", "required">, import("convex/values").VLiteral<"authdb", "required">, import("convex/values").VLiteral<"ai", "required">], "required", never>;
        status: import("convex/values").VUnion<"preview" | "creating" | "live" | "suspended" | "deleted", [import("convex/values").VLiteral<"preview", "required">, import("convex/values").VLiteral<"creating", "required">, import("convex/values").VLiteral<"live", "required">, import("convex/values").VLiteral<"suspended", "required">, import("convex/values").VLiteral<"deleted", "required">], "required", never>;
        vercelProjectId: import("convex/values").VString<string | undefined, "optional">;
        githubRepoId: import("convex/values").VString<string | undefined, "optional">;
        primaryUrl: import("convex/values").VString<string | undefined, "optional">;
        createdAt: import("convex/values").VFloat64<number, "required">;
    }, "required", "name" | "createdAt" | "userId" | "resellerId" | "prospectId" | "slug" | "prompt" | "plan" | "status" | "vercelProjectId" | "githubRepoId" | "primaryUrl">, {
        by_user: ["userId", "_creationTime"];
        by_slug: ["slug", "_creationTime"];
        by_reseller: ["resellerId", "_creationTime"];
    }, {}, {}>;
    project_settings: import("convex/server").TableDefinition<import("convex/values").VObject<{
        aiModel?: string | undefined;
        featureFlags?: {} | undefined;
        projectId: import("convex/values").GenericId<"projects">;
        updatedAt: number;
    }, {
        projectId: import("convex/values").VId<import("convex/values").GenericId<"projects">, "required">;
        aiModel: import("convex/values").VString<string | undefined, "optional">;
        featureFlags: import("convex/values").VObject<{} | undefined, {}, "optional", never>;
        updatedAt: import("convex/values").VFloat64<number, "required">;
    }, "required", "projectId" | "aiModel" | "featureFlags" | "updatedAt">, {
        by_project: ["projectId", "_creationTime"];
    }, {}, {}>;
    jobs: import("convex/server").TableDefinition<import("convex/values").VObject<{
        step?: string | undefined;
        startedAt?: number | undefined;
        finishedAt?: number | undefined;
        error?: string | undefined;
        type: "preview" | "create" | "upgrade" | "redeploy" | "attach_domain" | "release" | "convert" | "campaign_send";
        projectId: import("convex/values").GenericId<"projects">;
        state: "queued" | "running" | "failed" | "done";
    }, {
        projectId: import("convex/values").VId<import("convex/values").GenericId<"projects">, "required">;
        type: import("convex/values").VUnion<"preview" | "create" | "upgrade" | "redeploy" | "attach_domain" | "release" | "convert" | "campaign_send", [import("convex/values").VLiteral<"create", "required">, import("convex/values").VLiteral<"upgrade", "required">, import("convex/values").VLiteral<"redeploy", "required">, import("convex/values").VLiteral<"attach_domain", "required">, import("convex/values").VLiteral<"release", "required">, import("convex/values").VLiteral<"preview", "required">, import("convex/values").VLiteral<"convert", "required">, import("convex/values").VLiteral<"campaign_send", "required">], "required", never>;
        state: import("convex/values").VUnion<"queued" | "running" | "failed" | "done", [import("convex/values").VLiteral<"queued", "required">, import("convex/values").VLiteral<"running", "required">, import("convex/values").VLiteral<"failed", "required">, import("convex/values").VLiteral<"done", "required">], "required", never>;
        step: import("convex/values").VString<string | undefined, "optional">;
        startedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        finishedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        error: import("convex/values").VString<string | undefined, "optional">;
    }, "required", "type" | "projectId" | "state" | "step" | "startedAt" | "finishedAt" | "error">, {
        by_project: ["projectId", "_creationTime"];
        by_state: ["state", "_creationTime"];
    }, {}, {}>;
    job_logs: import("convex/server").TableDefinition<import("convex/values").VObject<{
        jobId: import("convex/values").GenericId<"jobs">;
        timestamp: number;
        level: "error" | "info" | "warn";
        message: string;
    }, {
        jobId: import("convex/values").VId<import("convex/values").GenericId<"jobs">, "required">;
        timestamp: import("convex/values").VFloat64<number, "required">;
        level: import("convex/values").VUnion<"error" | "info" | "warn", [import("convex/values").VLiteral<"info", "required">, import("convex/values").VLiteral<"warn", "required">, import("convex/values").VLiteral<"error", "required">], "required", never>;
        message: import("convex/values").VString<string, "required">;
    }, "required", "jobId" | "timestamp" | "level" | "message">, {
        by_job: ["jobId", "_creationTime"];
    }, {}, {}>;
    domains: import("convex/server").TableDefinition<import("convex/values").VObject<{
        registrarDomainId?: string | undefined;
        renewalDate?: number | undefined;
        status: "failed" | "purchased" | "configuring" | "verifying" | "active";
        projectId: import("convex/values").GenericId<"projects">;
        domainName: string;
        registrar: string;
        purchasePriceCents: number;
        renewalPriceCents: number;
    }, {
        projectId: import("convex/values").VId<import("convex/values").GenericId<"projects">, "required">;
        domainName: import("convex/values").VString<string, "required">;
        registrar: import("convex/values").VString<string, "required">;
        registrarDomainId: import("convex/values").VString<string | undefined, "optional">;
        status: import("convex/values").VUnion<"failed" | "purchased" | "configuring" | "verifying" | "active", [import("convex/values").VLiteral<"purchased", "required">, import("convex/values").VLiteral<"configuring", "required">, import("convex/values").VLiteral<"verifying", "required">, import("convex/values").VLiteral<"active", "required">, import("convex/values").VLiteral<"failed", "required">], "required", never>;
        purchasePriceCents: import("convex/values").VFloat64<number, "required">;
        renewalPriceCents: import("convex/values").VFloat64<number, "required">;
        renewalDate: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "status" | "projectId" | "domainName" | "registrar" | "registrarDomainId" | "purchasePriceCents" | "renewalPriceCents" | "renewalDate">, {
        by_project: ["projectId", "_creationTime"];
        by_domain_name: ["domainName", "_creationTime"];
    }, {}, {}>;
    subscriptions: import("convex/server").TableDefinition<import("convex/values").VObject<{
        graceUntil?: number | undefined;
        status: string;
        projectId: import("convex/values").GenericId<"projects">;
        stripeSubscriptionId: string;
        stripePriceId: string;
        currentPeriodStart: number;
        currentPeriodEnd: number;
    }, {
        projectId: import("convex/values").VId<import("convex/values").GenericId<"projects">, "required">;
        stripeSubscriptionId: import("convex/values").VString<string, "required">;
        stripePriceId: import("convex/values").VString<string, "required">;
        status: import("convex/values").VString<string, "required">;
        currentPeriodStart: import("convex/values").VFloat64<number, "required">;
        currentPeriodEnd: import("convex/values").VFloat64<number, "required">;
        graceUntil: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "status" | "projectId" | "stripeSubscriptionId" | "stripePriceId" | "currentPeriodStart" | "currentPeriodEnd" | "graceUntil">, {
        by_project: ["projectId", "_creationTime"];
        by_stripe_sub: ["stripeSubscriptionId", "_creationTime"];
    }, {}, {}>;
    ai_allowance_periods: import("convex/server").TableDefinition<import("convex/values").VObject<{
        projectId: import("convex/values").GenericId<"projects">;
        periodStart: number;
        periodEnd: number;
        creditsGranted: number;
        creditsUsed: number;
    }, {
        projectId: import("convex/values").VId<import("convex/values").GenericId<"projects">, "required">;
        periodStart: import("convex/values").VFloat64<number, "required">;
        periodEnd: import("convex/values").VFloat64<number, "required">;
        creditsGranted: import("convex/values").VFloat64<number, "required">;
        creditsUsed: import("convex/values").VFloat64<number, "required">;
    }, "required", "projectId" | "periodStart" | "periodEnd" | "creditsGranted" | "creditsUsed">, {
        by_project: ["projectId", "_creationTime"];
    }, {}, {}>;
    ai_usage_events: import("convex/server").TableDefinition<import("convex/values").VObject<{
        projectId: import("convex/values").GenericId<"projects">;
        timestamp: number;
        model: string;
        credits: number;
        requestId: string;
    }, {
        projectId: import("convex/values").VId<import("convex/values").GenericId<"projects">, "required">;
        timestamp: import("convex/values").VFloat64<number, "required">;
        model: import("convex/values").VString<string, "required">;
        credits: import("convex/values").VFloat64<number, "required">;
        requestId: import("convex/values").VString<string, "required">;
    }, "required", "projectId" | "timestamp" | "model" | "credits" | "requestId">, {
        by_project: ["projectId", "_creationTime"];
        by_request_id: ["requestId", "_creationTime"];
    }, {}, {}>;
    secrets: import("convex/server").TableDefinition<import("convex/values").VObject<{
        scopeId?: string | undefined;
        scope: "registrar" | "platform" | "project";
        key: string;
        encryptedValue: string;
        rotatedAt: number;
    }, {
        scope: import("convex/values").VUnion<"registrar" | "platform" | "project", [import("convex/values").VLiteral<"platform", "required">, import("convex/values").VLiteral<"project", "required">, import("convex/values").VLiteral<"registrar", "required">], "required", never>;
        key: import("convex/values").VString<string, "required">;
        encryptedValue: import("convex/values").VString<string, "required">;
        rotatedAt: import("convex/values").VFloat64<number, "required">;
        scopeId: import("convex/values").VString<string | undefined, "optional">;
    }, "required", "scope" | "key" | "encryptedValue" | "rotatedAt" | "scopeId">, {
        by_scope_key: ["scope", "key", "_creationTime"];
    }, {}, {}>;
    reseller_profiles: import("convex/server").TableDefinition<import("convex/values").VObject<{
        logoUrl?: string | undefined;
        primaryColor?: string | undefined;
        customDomain?: string | undefined;
        resendApiKey?: string | undefined;
        stripeConnectAccountId?: string | undefined;
        emailFromName?: string | undefined;
        emailFromDomain?: string | undefined;
        onboardingComplete?: boolean | undefined;
        createdAt: number;
        userId: import("convex/values").GenericId<"users">;
        companyName: string;
    }, {
        userId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        companyName: import("convex/values").VString<string, "required">;
        logoUrl: import("convex/values").VString<string | undefined, "optional">;
        primaryColor: import("convex/values").VString<string | undefined, "optional">;
        customDomain: import("convex/values").VString<string | undefined, "optional">;
        resendApiKey: import("convex/values").VString<string | undefined, "optional">;
        stripeConnectAccountId: import("convex/values").VString<string | undefined, "optional">;
        emailFromName: import("convex/values").VString<string | undefined, "optional">;
        emailFromDomain: import("convex/values").VString<string | undefined, "optional">;
        onboardingComplete: import("convex/values").VBoolean<boolean | undefined, "optional">;
        createdAt: import("convex/values").VFloat64<number, "required">;
    }, "required", "createdAt" | "userId" | "companyName" | "logoUrl" | "primaryColor" | "customDomain" | "resendApiKey" | "stripeConnectAccountId" | "emailFromName" | "emailFromDomain" | "onboardingComplete">, {
        by_user: ["userId", "_creationTime"];
    }, {}, {}>;
    prospects: import("convex/server").TableDefinition<import("convex/values").VObject<{
        email?: string | undefined;
        website?: string | undefined;
        contactName?: string | undefined;
        phone?: string | undefined;
        previewProjectId?: import("convex/values").GenericId<"projects"> | undefined;
        aiSummary?: string | undefined;
        createdAt: number;
        resellerId: import("convex/values").GenericId<"users">;
        status: "new" | "contacted" | "negotiating" | "won" | "lost";
        businessName: string;
        location: string;
        niche: string;
    }, {
        resellerId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        businessName: import("convex/values").VString<string, "required">;
        contactName: import("convex/values").VString<string | undefined, "optional">;
        email: import("convex/values").VString<string | undefined, "optional">;
        phone: import("convex/values").VString<string | undefined, "optional">;
        website: import("convex/values").VString<string | undefined, "optional">;
        location: import("convex/values").VString<string, "required">;
        niche: import("convex/values").VString<string, "required">;
        status: import("convex/values").VUnion<"new" | "contacted" | "negotiating" | "won" | "lost", [import("convex/values").VLiteral<"new", "required">, import("convex/values").VLiteral<"contacted", "required">, import("convex/values").VLiteral<"negotiating", "required">, import("convex/values").VLiteral<"won", "required">, import("convex/values").VLiteral<"lost", "required">], "required", never>;
        previewProjectId: import("convex/values").VId<import("convex/values").GenericId<"projects"> | undefined, "optional">;
        aiSummary: import("convex/values").VString<string | undefined, "optional">;
        createdAt: import("convex/values").VFloat64<number, "required">;
    }, "required", "email" | "createdAt" | "resellerId" | "website" | "status" | "businessName" | "contactName" | "phone" | "location" | "niche" | "previewProjectId" | "aiSummary">, {
        by_reseller: ["resellerId", "_creationTime"];
        by_status: ["resellerId", "status", "_creationTime"];
        by_niche: ["resellerId", "niche", "_creationTime"];
    }, {}, {}>;
    campaigns: import("convex/server").TableDefinition<import("convex/values").VObject<{
        complianceAcknowledged?: boolean | undefined;
        totalProspects?: number | undefined;
        totalSent?: number | undefined;
        totalOpened?: number | undefined;
        totalReplied?: number | undefined;
        name: string;
        createdAt: number;
        resellerId: import("convex/values").GenericId<"users">;
        status: "active" | "draft" | "paused" | "completed";
        location: string;
        niche: string;
        complianceMarket: "EU" | "US" | "UK" | "DACH";
        templateSubject: string;
        templateBody: string;
    }, {
        resellerId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        name: import("convex/values").VString<string, "required">;
        niche: import("convex/values").VString<string, "required">;
        location: import("convex/values").VString<string, "required">;
        status: import("convex/values").VUnion<"active" | "draft" | "paused" | "completed", [import("convex/values").VLiteral<"draft", "required">, import("convex/values").VLiteral<"active", "required">, import("convex/values").VLiteral<"paused", "required">, import("convex/values").VLiteral<"completed", "required">], "required", never>;
        complianceMarket: import("convex/values").VUnion<"EU" | "US" | "UK" | "DACH", [import("convex/values").VLiteral<"EU", "required">, import("convex/values").VLiteral<"US", "required">, import("convex/values").VLiteral<"UK", "required">, import("convex/values").VLiteral<"DACH", "required">], "required", never>;
        complianceAcknowledged: import("convex/values").VBoolean<boolean | undefined, "optional">;
        templateSubject: import("convex/values").VString<string, "required">;
        templateBody: import("convex/values").VString<string, "required">;
        totalProspects: import("convex/values").VFloat64<number | undefined, "optional">;
        totalSent: import("convex/values").VFloat64<number | undefined, "optional">;
        totalOpened: import("convex/values").VFloat64<number | undefined, "optional">;
        totalReplied: import("convex/values").VFloat64<number | undefined, "optional">;
        createdAt: import("convex/values").VFloat64<number, "required">;
    }, "required", "name" | "createdAt" | "resellerId" | "status" | "location" | "niche" | "complianceMarket" | "complianceAcknowledged" | "templateSubject" | "templateBody" | "totalProspects" | "totalSent" | "totalOpened" | "totalReplied">, {
        by_reseller: ["resellerId", "_creationTime"];
        by_status: ["resellerId", "status", "_creationTime"];
    }, {}, {}>;
    campaign_emails: import("convex/server").TableDefinition<import("convex/values").VObject<{
        sentAt?: number | undefined;
        openedAt?: number | undefined;
        repliedAt?: number | undefined;
        resendMessageId?: string | undefined;
        prospectId: import("convex/values").GenericId<"prospects">;
        status: "queued" | "failed" | "sent" | "opened" | "replied" | "bounced";
        campaignId: import("convex/values").GenericId<"campaigns">;
    }, {
        campaignId: import("convex/values").VId<import("convex/values").GenericId<"campaigns">, "required">;
        prospectId: import("convex/values").VId<import("convex/values").GenericId<"prospects">, "required">;
        status: import("convex/values").VUnion<"queued" | "failed" | "sent" | "opened" | "replied" | "bounced", [import("convex/values").VLiteral<"queued", "required">, import("convex/values").VLiteral<"sent", "required">, import("convex/values").VLiteral<"opened", "required">, import("convex/values").VLiteral<"replied", "required">, import("convex/values").VLiteral<"bounced", "required">, import("convex/values").VLiteral<"failed", "required">], "required", never>;
        sentAt: import("convex/values").VFloat64<number | undefined, "optional">;
        openedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        repliedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        resendMessageId: import("convex/values").VString<string | undefined, "optional">;
    }, "required", "prospectId" | "status" | "campaignId" | "sentAt" | "openedAt" | "repliedAt" | "resendMessageId">, {
        by_campaign: ["campaignId", "_creationTime"];
        by_prospect: ["prospectId", "_creationTime"];
        by_resend_id: ["resendMessageId", "_creationTime"];
    }, {}, {}>;
    prospect_conversations: import("convex/server").TableDefinition<import("convex/values").VObject<{
        resendMessageId?: string | undefined;
        subject?: string | undefined;
        prospectId: import("convex/values").GenericId<"prospects">;
        timestamp: number;
        direction: "inbound" | "outbound";
        body: string;
    }, {
        prospectId: import("convex/values").VId<import("convex/values").GenericId<"prospects">, "required">;
        direction: import("convex/values").VUnion<"inbound" | "outbound", [import("convex/values").VLiteral<"inbound", "required">, import("convex/values").VLiteral<"outbound", "required">], "required", never>;
        subject: import("convex/values").VString<string | undefined, "optional">;
        body: import("convex/values").VString<string, "required">;
        timestamp: import("convex/values").VFloat64<number, "required">;
        resendMessageId: import("convex/values").VString<string | undefined, "optional">;
    }, "required", "prospectId" | "timestamp" | "resendMessageId" | "direction" | "subject" | "body">, {
        by_prospect: ["prospectId", "_creationTime"];
    }, {}, {}>;
    compliance_rules: import("convex/server").TableDefinition<import("convex/values").VObject<{
        updatedAt: number;
        market: "EU" | "US" | "UK" | "DACH";
        ruleName: string;
        description: string;
        severity: "info" | "warning" | "critical";
    }, {
        market: import("convex/values").VUnion<"EU" | "US" | "UK" | "DACH", [import("convex/values").VLiteral<"EU", "required">, import("convex/values").VLiteral<"US", "required">, import("convex/values").VLiteral<"UK", "required">, import("convex/values").VLiteral<"DACH", "required">], "required", never>;
        ruleName: import("convex/values").VString<string, "required">;
        description: import("convex/values").VString<string, "required">;
        severity: import("convex/values").VUnion<"info" | "warning" | "critical", [import("convex/values").VLiteral<"info", "required">, import("convex/values").VLiteral<"warning", "required">, import("convex/values").VLiteral<"critical", "required">], "required", never>;
        updatedAt: import("convex/values").VFloat64<number, "required">;
    }, "required", "updatedAt" | "market" | "ruleName" | "description" | "severity">, {
        by_market: ["market", "_creationTime"];
    }, {}, {}>;
    call_schedules: import("convex/server").TableDefinition<import("convex/values").VObject<{
        meetingUrl?: string | undefined;
        notes?: string | undefined;
        createdAt: number;
        resellerId: import("convex/values").GenericId<"users">;
        prospectId: import("convex/values").GenericId<"prospects">;
        status: "completed" | "scheduled" | "cancelled" | "no_show";
        scheduledAt: number;
    }, {
        prospectId: import("convex/values").VId<import("convex/values").GenericId<"prospects">, "required">;
        resellerId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        scheduledAt: import("convex/values").VFloat64<number, "required">;
        status: import("convex/values").VUnion<"completed" | "scheduled" | "cancelled" | "no_show", [import("convex/values").VLiteral<"scheduled", "required">, import("convex/values").VLiteral<"completed", "required">, import("convex/values").VLiteral<"cancelled", "required">, import("convex/values").VLiteral<"no_show", "required">], "required", never>;
        meetingUrl: import("convex/values").VString<string | undefined, "optional">;
        notes: import("convex/values").VString<string | undefined, "optional">;
        createdAt: import("convex/values").VFloat64<number, "required">;
    }, "required", "createdAt" | "resellerId" | "prospectId" | "status" | "scheduledAt" | "meetingUrl" | "notes">, {
        by_reseller: ["resellerId", "_creationTime"];
        by_prospect: ["prospectId", "_creationTime"];
    }, {}, {}>;
    reseller_usage: import("convex/server").TableDefinition<import("convex/values").VObject<{
        revenueCollectedCents?: number | undefined;
        platformFeeCents?: number | undefined;
        resellerId: import("convex/values").GenericId<"users">;
        month: string;
        deployedProjects: number;
        emailsSent: number;
        aiCreditsUsed: number;
    }, {
        resellerId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        month: import("convex/values").VString<string, "required">;
        deployedProjects: import("convex/values").VFloat64<number, "required">;
        emailsSent: import("convex/values").VFloat64<number, "required">;
        aiCreditsUsed: import("convex/values").VFloat64<number, "required">;
        revenueCollectedCents: import("convex/values").VFloat64<number | undefined, "optional">;
        platformFeeCents: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "resellerId" | "month" | "deployedProjects" | "emailsSent" | "aiCreditsUsed" | "revenueCollectedCents" | "platformFeeCents">, {
        by_reseller: ["resellerId", "_creationTime"];
        by_month: ["resellerId", "month", "_creationTime"];
    }, {}, {}>;
    authSessions: import("convex/server").TableDefinition<import("convex/values").VObject<{
        userId: import("convex/values").GenericId<"users">;
        expirationTime: number;
    }, {
        userId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        expirationTime: import("convex/values").VFloat64<number, "required">;
    }, "required", "userId" | "expirationTime">, {
        userId: ["userId", "_creationTime"];
    }, {}, {}>;
    authAccounts: import("convex/server").TableDefinition<import("convex/values").VObject<{
        secret?: string | undefined;
        emailVerified?: string | undefined;
        phoneVerified?: string | undefined;
        userId: import("convex/values").GenericId<"users">;
        provider: string;
        providerAccountId: string;
    }, {
        userId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        provider: import("convex/values").VString<string, "required">;
        providerAccountId: import("convex/values").VString<string, "required">;
        secret: import("convex/values").VString<string | undefined, "optional">;
        emailVerified: import("convex/values").VString<string | undefined, "optional">;
        phoneVerified: import("convex/values").VString<string | undefined, "optional">;
    }, "required", "secret" | "userId" | "provider" | "providerAccountId" | "emailVerified" | "phoneVerified">, {
        userIdAndProvider: ["userId", "provider", "_creationTime"];
        providerAndAccountId: ["provider", "providerAccountId", "_creationTime"];
    }, {}, {}>;
    authRefreshTokens: import("convex/server").TableDefinition<import("convex/values").VObject<{
        firstUsedTime?: number | undefined;
        parentRefreshTokenId?: import("convex/values").GenericId<"authRefreshTokens"> | undefined;
        expirationTime: number;
        sessionId: import("convex/values").GenericId<"authSessions">;
    }, {
        sessionId: import("convex/values").VId<import("convex/values").GenericId<"authSessions">, "required">;
        expirationTime: import("convex/values").VFloat64<number, "required">;
        firstUsedTime: import("convex/values").VFloat64<number | undefined, "optional">;
        parentRefreshTokenId: import("convex/values").VId<import("convex/values").GenericId<"authRefreshTokens"> | undefined, "optional">;
    }, "required", "expirationTime" | "sessionId" | "firstUsedTime" | "parentRefreshTokenId">, {
        sessionId: ["sessionId", "_creationTime"];
        sessionIdAndParentRefreshTokenId: ["sessionId", "parentRefreshTokenId", "_creationTime"];
    }, {}, {}>;
    authVerificationCodes: import("convex/server").TableDefinition<import("convex/values").VObject<{
        emailVerified?: string | undefined;
        phoneVerified?: string | undefined;
        verifier?: string | undefined;
        expirationTime: number;
        provider: string;
        accountId: import("convex/values").GenericId<"authAccounts">;
        code: string;
    }, {
        accountId: import("convex/values").VId<import("convex/values").GenericId<"authAccounts">, "required">;
        provider: import("convex/values").VString<string, "required">;
        code: import("convex/values").VString<string, "required">;
        expirationTime: import("convex/values").VFloat64<number, "required">;
        verifier: import("convex/values").VString<string | undefined, "optional">;
        emailVerified: import("convex/values").VString<string | undefined, "optional">;
        phoneVerified: import("convex/values").VString<string | undefined, "optional">;
    }, "required", "expirationTime" | "provider" | "emailVerified" | "phoneVerified" | "accountId" | "code" | "verifier">, {
        accountId: ["accountId", "_creationTime"];
        code: ["code", "_creationTime"];
    }, {}, {}>;
    authVerifiers: import("convex/server").TableDefinition<import("convex/values").VObject<{
        sessionId?: import("convex/values").GenericId<"authSessions"> | undefined;
        signature?: string | undefined;
    }, {
        sessionId: import("convex/values").VId<import("convex/values").GenericId<"authSessions"> | undefined, "optional">;
        signature: import("convex/values").VString<string | undefined, "optional">;
    }, "required", "sessionId" | "signature">, {
        signature: ["signature", "_creationTime"];
    }, {}, {}>;
    authRateLimits: import("convex/server").TableDefinition<import("convex/values").VObject<{
        identifier: string;
        lastAttemptTime: number;
        attemptsLeft: number;
    }, {
        identifier: import("convex/values").VString<string, "required">;
        lastAttemptTime: import("convex/values").VFloat64<number, "required">;
        attemptsLeft: import("convex/values").VFloat64<number, "required">;
    }, "required", "identifier" | "lastAttemptTime" | "attemptsLeft">, {
        identifier: ["identifier", "_creationTime"];
    }, {}, {}>;
}, true>;
export default _default;
//# sourceMappingURL=schema.d.ts.map