# Licensing

Licensing diagrams for Microsoft 365 admins. This file contains 13 topics covering licence assignment, service plan provisioning, add-ons, Copilot readiness, Purview, Intune, Teams and external user billing considerations.

## Contents

- [Group-Based Licensing Architecture](#group-based-licensing-architecture)
- [Guest and External User Licensing](#guest-and-external-user-licensing)
- [Licence Assignment and Service Provisioning Flow](#licence-assignment-and-service-provisioning-flow)
- [Licence Lifecycle: Assignment to Retirement](#licence-lifecycle-assignment-to-retirement)
- [Licence Management Workflow](#licence-management-workflow)
- [Licence Selection Decision Tree](#licence-selection-decision-tree)
- [Licence Upgrade and Migration Pathways](#licence-upgrade-and-migration-pathways)
- [Microsoft 365 Add-on Attachment Model](#microsoft-365-add-on-attachment-model)
- [Microsoft 365 Add-on Licensing Stack](#microsoft-365-add-on-licensing-stack)
- [Microsoft 365 Copilot Licensing Readiness](#microsoft-365-copilot-licensing-readiness)
- [Microsoft 365 E3, E5 and Business Premium Feature Matrix](#microsoft-365-e3-e5-and-business-premium-feature-matrix)
- [Microsoft 365 Licence Hierarchy](#microsoft-365-licence-hierarchy)
- [Microsoft Purview Licensing Stack](#microsoft-purview-licensing-stack)

---

## Group-Based Licensing Architecture

Group-based licensing is the scalable way to manage licence assignment. This diagram shows how dynamic and security groups automatically map to licence plans.

```mermaid
flowchart TB
    subgraph Directory["Entra ID Groups"]
        direction TB
        Dyn["Dynamic Groups<br/>• Department = 'Engineering'<br/>• employeeType = 'FullTime'<br/>• location = 'US'"]
        Sec["Security Groups<br/>• Assigned by admin<br/>• Nested group support"]
        M365G["Microsoft 365 Groups<br/>• Team + SharePoint<br/>• Can carry licence"]
    end

    subgraph LicenceEngine["Group-Based Licensing Engine"]
        direction TB
        Eval["Membership Evaluation<br/>(Real-time + periodic)"]
        Resolve["Licence Conflict Resolution<br/>• Direct vs. Inherited<br/>• Disabled plan merging"]
        Apply["Service Plan Provisioning"]
    end

    subgraph Users["Users"]
        direction TB
        U1["User A<br/>Engineering / US"]
        U2["User B<br/>Sales / UK"]
        U3["User C<br/>Contractor / US"]
    end

    subgraph Plans["Licence Plans Attached"]
        direction TB
        P1["Microsoft 365 E5<br/>• Assigned to Engineering group"]
        P2["Microsoft 365 E3<br/>• Assigned to Sales group"]
        P3["E5 Security Add-On<br/>• Assigned to Security-Users group"]
        P4["Copilot<br/>• Assigned to Leadership group"]
    end

    Directory -->|Membership| Eval
    Eval -->|Resolves to| Users
    Plans -->|Attached to| Directory
    Resolve -->|Conflicts| Apply
    Apply -->|Provisions| Users
```

### Notes
**Key insight**: A user can be a member of **multiple groups with different licences**. The licence engine merges the service plans, enabling the union of capabilities. However, if two groups assign **conflicting plans** (e.g., E3 and E5), the engine uses a precedence rule. Always review **licence errors** in the Entra ID portal—conflicts are reported per user.

---

## Guest and External User Licensing

External user licensing now centres on Microsoft Entra External ID monthly active users, workload entitlements and any premium features assigned to guests.

```mermaid
flowchart TB
    GEL_User["External user signs in"] --> GEL_Type{"Identity pattern"}
    GEL_Type -->|"B2B guest in workforce tenant"| GEL_MAU["External ID MAU billing<br/>for active guest sign-ins"]
    GEL_Type -->|"External tenant user"| GEL_ExternalTenant["External tenant MAU billing"]
    GEL_Type -->|"Internal member from same organisation"| GEL_Internal["Not counted as external MAU"]
    GEL_MAU --> GEL_Workload{"Workload access needed"}
    GEL_ExternalTenant --> GEL_Workload
    GEL_Workload -->|"SharePoint Teams or app access"| GEL_Govern["Apply guest governance<br/>CA access reviews and expiry"]
    GEL_Workload -->|"Premium identity or app feature"| GEL_Licence["Assign required premium licence<br/>or add-on when the feature requires it"]
    GEL_Workload -->|"Customer-facing app"| GEL_App["Link tenant to Azure subscription<br/>and monitor MAU usage"]
    GEL_Govern --> GEL_Report["Review active guests<br/>usage and access packages"]
    GEL_Licence --> GEL_Report
    GEL_App --> GEL_Report
```

### Notes

- Do not use the retired guest-ratio model as the planning model. Check current Microsoft Entra External ID billing and workload-specific licence requirements before rollout.

---

## Licence Assignment and Service Provisioning Flow

When a licence is assigned to a user, Microsoft triggers a cascading provisioning pipeline. This sequence diagram shows the activation flow.

```mermaid
sequenceDiagram
    actor Admin
    participant Portal as Microsoft 365 Admin Center
    participant Graph as Microsoft Graph API
    participant Entra as Entra ID Licence Service
    participant ExO as Exchange Online
    participant SPO as SharePoint Online
    participant Teams as Teams Platform
    participant Intune as Intune Service
    participant Defender as Defender for Endpoint

    Admin->>Portal: Assign Microsoft 365 E5 licence to user
    Portal->>Graph: POST /users/{id}/assignLicense
    Graph->>Entra: Update licence roster

    Entra->>Entra: Evaluate licence plan<br/>against service plans

    par Parallel Service Provisioning
        Entra->>ExO: Provision mailbox<br/>(if Exchange plan enabled)
        ExO-->>Entra: Mailbox ready

        Entra->>SPO: Provision OneDrive<br/>+ SharePoint profile
        SPO-->>Entra: Storage allocated

        Entra->>Teams: Enable Teams licence<br/>+ Teams Phone if applicable
        Teams-->>Entra: Voice routing updated

        Entra->>Intune: Enable Intune licence<br/>+ Device limit raised
        Intune-->>Entra: Enrollment profile ready

        Entra->>Defender: Onboard to Defender<br/>(if E5 / P2 licence)
        Defender-->>Entra: Sensor deployment key ready
    end

    Entra->>Graph: Licence state: Active
    Graph-->>Portal: User blade updated
    Portal-->>Admin: Assignment confirmed

    Note over Admin,Defender: Provisioning typically completes<br/>within minutes, but mailbox creation<br/>can take up to 24 hours in rare cases.
```

### Notes
**Key insight**: Licences are **not instantaneously atomic**—some services provision faster than others. A user might be able to sign into Teams before their Exchange mailbox is fully created. Always use the **Microsoft 365 admin center licensing page** or Graph API to verify which service plans are in a `Success` state versus `PendingInput`.

---

## Licence Lifecycle: Assignment to Retirement

This state diagram shows the full lifecycle of a licence from procurement through reassignment or removal.

```mermaid
stateDiagram-v2
    [*] --> Procured: Purchase subscription
    Procured --> Assigned: Admin assigns to user
    Procured --> Unassigned: Available pool

    Assigned --> Active: Services provisioning complete
    Active --> Suspended: Billing issue / Subscription lapses
    Active --> Reassigned: User leaves / Role change
    Active --> Revoked: Admin removes license
    Active --> Updated: Plan change (E3 → E5)

    Suspended --> Active: Billing restored within grace
    Suspended --> Disabled: Beyond 30-day grace
    Disabled --> Deleted: Retention period expires

    Reassigned --> Unassigned: Returns to pool
    Reassigned --> Assigned: New user receives it

    Revoked --> Unassigned: Returns to pool
    Updated --> Transitioning: Services recalculate
    Transitioning --> Active: New plan active

    Unassigned --> Assigned: Admin allocates
    Deleted --> [*]: Data subject to retention policy

    Active --> [*]: Subscription terminated
```

### Notes
**Key insight**: When a licence is **removed**, most services enter a **30-day grace period** before data is soft-deleted. For Exchange, the mailbox becomes inactive and can be recovered. Always use **licence groups** (Entra ID group-based licensing) rather than direct assignment—it ensures automatic reclamation when users leave groups.

---

## Licence Management Workflow

Shows the main components, decisions, and operational flow for licence management workflow in Microsoft 365 licensing work.

```mermaid
flowchart TD
    Start[Licence Requirement] --> Type{License Type?}

    Type -->|Microsoft 365 Business| BusinessLicenses
    Type -->|Microsoft 365 E3/E5| EnterpriseLicenses
    Type -->|Frontline Worker| F3Licenses
    Type -->|Add-ons| AddOnLicenses

    BusinessLicenses --> BusinessBasic[Business Basic]
    BusinessLicenses --> BusinessStandard[Business Standard]
    BusinessLicenses --> BusinessPremium[Business Premium]

    EnterpriseLicenses --> E3[Microsoft 365 E3]
    EnterpriseLicenses --> E5[Microsoft 365 E5]
    EnterpriseLicenses --> F3[Microsoft 365 F3]

    AddOnLicenses --> Project[Project Plan]
    AddOnLicenses --> Visio[Visio Plan]
    AddOnLicenses --> Defender[Defender Add-on]
    AddOnLicenses --> Compliance[Compliance Add-on]
    AddOnLicenses --> Storage[Additional Storage]
    AddOnLicenses --> Phone[Teams Phone]

    BusinessBasic --> Assign{Assignment Method}
    BusinessStandard --> Assign
    BusinessPremium --> Assign
    E3 --> Assign
    E5 --> Assign
    F3 --> Assign
    Project --> Assign
    Visio --> Assign
    Defender --> Assign
    Compliance --> Assign
    Storage --> Assign
    Phone --> Assign

    Assign -->|Individual| IndividualAssign[Assign to User]
    Assign -->|Group| GroupAssign[Assign via Group]

    IndividualAssign --> SelectUser[Select User]
    GroupAssign --> SelectGroup[Select Group]

    SelectUser --> VerifyLicense[Verify Licence Available]
    SelectGroup --> VerifyLicense

    VerifyLicense -->|Available| AssignLicense[Assign Licence]
    VerifyLicense -->|Not Available| Purchase[Purchase More]

    AssignLicense --> Confirm[Confirm Assignment]
    Purchase --> AssignLicense

    Confirm --> Notify[Notify User]
    Notify --> Complete[Assignment Complete]

    style Start fill:#3498db,color:#fff
    style Assign fill:#27ae60,color:#fff
    style Complete fill:#27ae60,color:#fff
    style Purchase fill:#f39c12,color:#fff
```

---

## Licence Selection Decision Tree

This decision tree helps navigate which base licence to start with, and which add-ons are needed based on organisational requirements.

```mermaid
flowchart TD
    A["Organisation needs Microsoft licensing"] --> B{"How many users?"}

    B -->|> 300| C["Enterprise SKUs only"]
    B -->|≤ 300| D["Enterprise or Business"]

    C --> E{"Security posture<br/>requirement?"}
    D --> F{"Advanced security<br/>needed?"}

    E -->|Basic / Legacy| G["Microsoft 365 E3"]
    E -->|Advanced / Zero Trust| H["Microsoft 365 E5"]
    E -->|Somewhere between| I["Microsoft 365 E3 +<br/>E5 Security add-on"]

    F -->|No| J["Microsoft 365 Business Standard<br/>(if no device mgmt)"]
    F -->|Yes| K{"Need Intune<br/>+ Defender?"}

    K -->|No| L["Microsoft 365 Business Standard<br/>+ 3rd party MDM"]
    K -->|Yes| M["Microsoft 365 Business Premium"]

    G --> N{"Need any of these?"}
    H --> O["Add-ons available:<br/>Copilot / Teams Premium / Viva"]
    I --> N
    M --> P["Add-ons available:<br/>Copilot / Teams Premium"]

    N -->|PIM / Risk-based CA| Q["Add Entra ID P2"]
    N -->|Endpoint DLP / Auto-label| R["Add E5 Compliance<br/>or MIP upgrade"]
    N -->|Advanced hunting / XDR| S["Add E5 Security"]
    N -->|eDiscovery Premium| T["Add E5 Compliance"]
    N -->|None of above| U["E3 is sufficient"]

    style H fill:#d4edda
    style M fill:#d4edda
    style U fill:#d4edda
```

### Notes
**Key insight**: The most common mistake is buying **E3 + multiple individual add-ons** and accidentally spending more than E5 would cost. Always price the full E5 bundle before committing to E3 + E5 Security + E5 Compliance + E5 Information Protection as separate add-ons.

---

## Licence Upgrade and Migration Pathways

Organizations rarely start with their final licence mix. This flowchart shows common upgrade paths and the implications of each.

```mermaid
flowchart TD
    A["Current Licence State"] --> B{"What is your<br/>starting point?"}

    B -->|Office 365 E3| C["Add EMS E3<br/>= Microsoft 365 E3 equivalent"]
    B -->|Office 365 E1| D["Upgrade to E3<br/>or add EMS E3"]
    B -->|Microsoft 365 E3| E["Most common upgrade path"]
    B -->|Microsoft 365 Business Standard| F["Add Intune + Defender<br/>or upgrade to Business Premium"]

    C --> G{"Need advanced security?"}
    D --> G
    E --> G
    F --> G

    G -->|Yes| H["Option 1: E3 + E5 Security add-on"]
    G -->|Yes| I["Option 2: Full E5 upgrade<br/>• Often cheaper<br/>• Simpler management"]
    G -->|No| J["Stay on current plan<br/>• Add targeted add-ons if needed"]

    H --> K{"Need compliance too?"}
    I --> L["Add Copilot / Teams Premium<br/>as needed"]
    J --> M["Consider Copilot readiness<br/>• Requires E3/E5 base"]

    K -->|Yes| N["E3 + E5 Security + E5 Compliance<br/>• Verify total cost vs. E5"]
    K -->|No| O["E3 + E5 Security only"]

    N --> P{"Is E5 cheaper?"}
    P -->|Yes| Q["Migrate to E5<br/>decommission add-ons"]
    P -->|No| R["Keep add-on model"]

    L --> S["Review annually<br/>for consolidation"]
    O --> S
    Q --> S
    R --> S
    M --> S

    style I fill:#d4edda
    style Q fill:#d4edda
```

### Notes
**Key insight**: When upgrading from **E3 to E5**, the migration is typically seamless—service plans are re-evaluated and expanded automatically. However, moving from **Business Premium to Enterprise E3/E5** requires careful planning because Business Premium has a 300-seat cap and different service plan SKUs that may not map 1:1.

---

## Microsoft 365 Add-on Attachment Model

Many advanced capabilities are not base-licence features—they are licensed as add-ons that stack on top of existing subscriptions. This diagram shows how add-ons attach to base licences.

```mermaid
flowchart TB
    subgraph BaseLicense["Base Licence Required"]
        B1["Microsoft 365 E3"]
        B2["Microsoft 365 E5"]
        B3["Microsoft 365 Business Premium"]
        B4["Office 365 E3 / E5"]
    end

    subgraph SecurityAddOns["Security Add-Ons"]
        SA1["E5 Security<br/>• Defender for Endpoint P2<br/>• Defender for Identity<br/>• Defender for Cloud Apps"]
        SA2["Defender for Office 365 P2<br/>(if on E1/E3)"]
        SA3["Entra ID P2<br/>• Identity Protection<br/>• PIM / Access Reviews"]
    end

    subgraph ComplianceAddOns["Compliance Add-Ons"]
        CA1["E5 Compliance<br/>• Insider Risk Mgmt<br/>• Communication Compliance<br/>• Advanced Audit"]
        CA2["E5 eDiscovery & Audit<br/>• Premium eDiscovery<br/>• Audit Premium (10-yr)"]
        CA3["Information Protection & Governance<br/>• Auto-labelling<br/>• Endpoint DLP"]
    end

    subgraph ProductivityAddOns["Productivity & AI Add-Ons"]
        PA1["Microsoft 365 Copilot<br/>• Per-user subscription<br/>• Requires eligible base"]
        PA2["Teams Premium<br/>• Advanced meetings<br/>• AI-generated recaps"]
        PA3["Viva Suite / Individual modules<br/>• Insights / Topics / Goals"]
        PA4["Power BI Pro / Premium Per User"]
    end

    subgraph Specialty["Speciality Licences"]
        SP1["Visio Plan 2"]
        SP2["Project Online Plan 3/5"]
        SP3["Windows 365<br/>• Cloud PC per-user"]
        SP4["Frontline Worker<br/>• F3 / F1 tailored plans"]
    end

    B1 -->|Can attach| SecurityAddOns
    B1 -->|Can attach| ComplianceAddOns
    B1 -->|Can attach| ProductivityAddOns
    B2 -->|Often redundant| SecurityAddOns
    B2 -->|Often redundant| ComplianceAddOns
    B2 -->|Can attach| ProductivityAddOns
    B3 -->|Can attach| SecurityAddOns
    B3 -->|Can attach| ProductivityAddOns

    BaseLicense -->|Standalone purchase| Specialty
```

### Notes
**Key insight**: **Microsoft 365 Copilot** requires an eligible base licence (E3, E5, Business Premium, etc.) and is sold per-user. It cannot be assigned to users on Office 365 E1 or standalone Exchange Online licences. Teams Premium similarly requires an eligible base with Teams included.

---

## Microsoft 365 Add-on Licensing Stack

Many advanced Microsoft 365 capabilities attach to a base suite licence. This diagram helps admins map add-ons to workload outcomes before assignment.

```mermaid
flowchart TB
    ALS_Base["Base suite licence<br/>Microsoft 365 or Office 365"] --> ALS_Addons["Add-on capability layer"]
    ALS_Addons --> ALS_Copilot["Microsoft 365 Copilot"]
    ALS_Addons --> ALS_Intune["Intune Suite<br/>Plan 2 or standalone add-ons"]
    ALS_Addons --> ALS_Teams["Teams Premium<br/>and Teams Phone options"]
    ALS_Addons --> ALS_Purview["Purview premium<br/>risk compliance and audit features"]
    ALS_Addons --> ALS_SharePoint["SharePoint Advanced Management"]
    ALS_Copilot --> ALS_Check["Check prerequisites<br/>workload entitlement and user scope"]
    ALS_Intune --> ALS_Check
    ALS_Teams --> ALS_Check
    ALS_Purview --> ALS_Check
    ALS_SharePoint --> ALS_Check
    ALS_Check --> ALS_Assign["Assign licences<br/>directly or by group"]
    ALS_Assign --> ALS_Validate["Validate service plan provisioning<br/>usage and cost"]
```

### Notes

- Add-on availability varies by plan, cloud and product terms. Validate against the current service description before purchasing or assigning.

---

## Microsoft 365 Copilot Licensing Readiness

Copilot is not a standalone product—it requires a qualified base licence and has its own infrastructure dependencies. This diagram shows the readiness checklist.

```mermaid
flowchart TD
    A["Deploy Microsoft 365 Copilot"] --> B{"Base license eligible?"}

    B -->|Yes| C["Copilot license<br/>can be assigned"]
    B -->|No| D["Upgrade to E3 / E5 /<br/>Business Premium first"]

    C --> E{"Prerequisites met?"}
    D --> E

    E -->|Entra ID P1/P2| F["✓ Identity ready"]
    E -->|OneDrive enabled| G["✓ Semantic Index requires<br/>OneDrive per user"]
    E -->|Teams + Exchange| H["✓ Chat + Email integration<br/>requires both services"]
    E -->|Graph Connectors| I["Optional: Extend<br/>semantic index to<br/>external data sources"]

    F & G & H --> J{"Tenant configuration"}

    J -->|Microsoft Search active| K["✓ Semantic index builds<br/>automatically"]
    J -->|Sensitivity labels applied| L["✓ Copilot respects<br/>MIP boundaries"]
    J -->|DLP policies active| M["✓ Copilot blocked from<br/>sensitive content"]

    K & L & M --> N["Copilot functional<br/>for licensed users"]

    N --> O["Per-user billing<br/>• Annual commitment<br/>• No month-to-month"]

    style C fill:#d4edda
    style N fill:#d4edda
```

### Notes
**Key insight**: Copilot's **Semantic Index** builds on the Microsoft Graph and requires **OneDrive** to be enabled for every licensed user. Without OneDrive, Copilot cannot ground responses in the user's personal document context. Copilot also **inherits sensitivity labels**—if a user cannot access a document directly due to MIP, Copilot cannot summarise it either.

---

## Microsoft 365 E3, E5 and Business Premium Feature Matrix

This comparison diagram maps the major feature categories across the three most common bundles.

```mermaid
graph LR
    subgraph Categories["Feature Category"]
        direction TB
        F1["Identity & Access"]
        F2["Threat Protection"]
        F3["Device Management"]
        F4["Data Protection"]
        F5["Compliance"]
        F6["Productivity"]
        F7["Voice / Meetings"]
    end

    subgraph E3["Microsoft 365 E3"]
        direction TB
        E3_1["Entra ID P1<br/>Basic CA + MFA"]
        E3_2["Defender for Office 365 P1<br/>Safe Attachments/Links"]
        E3_3["Intune<br/>Device + App Mgmt"]
        E3_4["Azure RMS<br/>Basic encryption"]
        E3_5["eDiscovery (Standard)<br/>Core retention"]
        E3_6["Office E3<br/>Desktop + Web"]
        E3_7["Teams core<br/>No PSTN / Cloud PBX"]
    end

    subgraph E5["Microsoft 365 E5"]
        direction TB
        E5_1["Entra ID P2<br/>Risk + PIM + Gov"]
        E5_2["Defender XDR<br/>Endpoint P2 + Identity + Cloud Apps"]
        E5_3["Intune<br/>+ Endpoint Analytics"]
        E5_4["MIP + DLP<br/>Auto-labelling + Endpoint DLP"]
        E5_5["Purview Full Suite<br/>eDiscovery Premium / Audit Premium"]
        E5_6["Office E5<br/>+ Power BI Pro + MyAnalytics"]
        E5_7["Teams + Teams Phone<br/>Audio Conferencing"]
    end

    subgraph BP["Business Premium"]
        direction TB
        BP_1["Entra ID P1<br/>Basic CA"]
        BP_2["Defender for Business<br/>Endpoint AV + EDR (light)"]
        BP_3["Intune<br/>Full device + MAM"]
        BP_4["MIP<br/>Sensitivity labels"]
        BP_5["Retention + DLP<br/>(Standard scope)"]
        BP_6["Office apps<br/>Desktop + Web"]
        BP_7["Teams core<br/>No PSTN"]
    end

    Categories -.-> E3
    Categories -.-> E5
    Categories -.-> BP

    style E5 fill:#d4edda
    style BP fill:#fff3cd
```

### Notes
**Key insight**: **Business Premium** is technically an SMB licence but contains the same Entra ID P1, Intune, and Defender capabilities as E3. The limitation is **max 300 users** and no Exchange Online archiving. For organisations under 300 seats, Business Premium is almost always the better value than E3.

---

## Microsoft 365 Licence Hierarchy

Microsoft licensing is structured as a pyramid: foundational bundles at the base, with specialised add-ons and advanced suites at the top. This diagram shows the relationship between tiers.

```mermaid
flowchart TB
    subgraph Foundation["Foundation Layer"]
        direction TB
        O365["Office 365<br/>(Productivity only)"]
        EntraP1["Entra ID P1<br/>(SSO + CA + MFA)"]
        IntuneBase["Microsoft Intune<br/>(Device management)"]
    end

    subgraph Core["Core Bundles (Most Common)"]
        direction TB
        M365E3["Microsoft 365 E3<br/>• Office 365 E3<br/>• EMS E3<br/>  - Entra ID P1<br/>  - Intune<br/>  - AD RMS → MIP"]
        M365E5["Microsoft 365 E5<br/>• Office 365 E5<br/>• EMS E5<br/>  - Entra ID P2<br/>  - Intune<br/>  - Defender for Identity<br/>  - Defender for Endpoint P2<br/>• Teams Phone<br/>• Audio Conferencing"]
        M365BP["Microsoft 365 Business Premium<br/>(SMB bundle)<br/>• Microsoft 365 Business<br/>• Entra ID P1<br/>• Intune<br/>• Defender for Business"]
        F3["Microsoft 365 F3 / F1<br/>(Frontline workers)<br/>• Web/mobile apps<br/>• Basic Teams<br/>• Intune<br/>• Entra ID P1"]
    end

    subgraph Advanced["Advanced / Specialised"]
        direction TB
        E5Sec["E5 Security<br/>(Entra ID P2 + Defender stack)"]
        E5Comp["E5 Compliance<br/>(Purview advanced)"]
        E5Info["E5 eDiscovery & Audit<br/>(Premium features)"]
        Suite["Intune Suite<br/>• Endpoint Privilege Management<br/>• Cloud PKI<br/>• Firmware updates<br/>• Endpoint Analytics<br/>• Advanced app management"]
    end

    subgraph AddOns["Standalone Add-Ons"]
        direction TB
        Visio["Visio Plan 2"]
        Proj["Project Plan 3/5"]
        PowerBI["Power BI Pro / Premium"]
        Copilot["Microsoft 365 Copilot<br/>• Per-user add-on<br/>• Semantic Index<br/>• Copilot Studio"]
        TeamsPrem["Teams Premium<br/>• Advanced meetings<br/>• Webinars<br/>• AI recaps"]
        Viva["Viva Suite<br/>• Insights / Topics / Goals / Engage"]
    end

    Foundation --> Core
    Core --> Advanced
    Core --> AddOns
    Advanced --> AddOns
```

### Notes
**Key insight**: **Microsoft 365 E3** is the historical enterprise standard, but **E5** is increasingly becoming the baseline for security-conscious organisations because the incremental cost is often lower than purchasing E5 Security + E5 Compliance as add-ons to E3. SMBs often over-purchase by buying E3 instead of **Business Premium**.

---

## Microsoft Purview Licensing Stack

Microsoft Purview capabilities span multiple licence tiers. This layered diagram shows which features belong to which licensing level.

```mermaid
flowchart LR
    subgraph Tier1["E3 / Business Premium<br/>Included Base"]
        direction TB
        T1_1["Sensitivity Labels<br/>• Manual application"]
        T1_2["DLP (basic)<br/>• Exchange / SharePoint"]
        T1_3["Retention Policies<br/>• Core labels"]
        T1_4["eDiscovery (Standard)<br/>• Hold + Export"]
        T1_5["Message Encryption<br/>• OME"]
    end

    subgraph Tier2["E5 Security<br/>or E5 Compliance Add-Ons"]
        direction TB
        T2_1["Defender for Office 365 P2<br/>• Safe Docs / Campaign views"]
        T2_2["Defender for Endpoint P2<br/>• Advanced Hunting / EDR"]
        T2_3["Defender for Cloud Apps<br/>• Shadow IT / Session control"]
        T2_4["Defender for Identity<br/>• AD attack detection"]
        T2_5["Insider Risk Management<br/>• Correlation policies"]
    end

    subgraph Tier3["E5 Compliance<br/>or Full E5 Bundle"]
        direction TB
        T3_1["Advanced Audit<br/>• 10-year retention"]
        T3_2["eDiscovery (Premium)<br/>• Conversation reconstruction<br/>• Review sets / Analytics"]
        T3_3["Communication Compliance<br/>• Supervision policies"]
        T3_4["Auto-labelling<br/>• Endpoint DLP<br/>• Trainable classifiers"]
        T3_5["Customer Lockbox<br/>• Data center access control"]
    end

    subgraph Tier4["Standalone / Premium"]
        direction TB
        T4_1["Microsoft Purview<br/>Data Governance<br/>• Data Catalog / Map"]
        T4_2["Compliance Manager<br/>• Premium templates"]
        T4_3["Information Protection<br/>• Exact Data Match<br/>• Document fingerprinting"]
    end

    Tier1 -->|Upgrade| Tier2
    Tier2 -->|Upgrade| Tier3
    Tier3 -->|Add| Tier4
```

### Notes
**Key insight**: **eDiscovery (Premium)** and **Advanced Audit** are often the last features organisations adopt, but they are the most legally critical. Advanced Audit's 10-year log retention is a **legal hold enabler**, while eDiscovery Premium's conversation reconstruction is essential for Teams chat investigations. If you have E5, you own these—they are frequently underutilized.
