# Troubleshooting

Troubleshooting diagrams for Microsoft 365 admins. This file contains 11 topics covering support escalation and targeted diagnostic flows for identity, Exchange, Intune, SharePoint, Teams, DLP and Copilot exposure issues.

## Contents

- [Troubleshooting and Support Chain](#troubleshooting-and-support-chain)
- [Troubleshooting Conditional Access Sign-in Failures](#troubleshooting-conditional-access-sign-in-failures)
- [Troubleshooting Copilot Content Exposure](#troubleshooting-copilot-content-exposure)
- [Troubleshooting DLP False Positives](#troubleshooting-dlp-false-positives)
- [Troubleshooting Teams Call Quality](#troubleshooting-teams-call-quality)
- [Troubleshooting: Microsoft Entra Connect Sync Errors](#troubleshooting-microsoft-entra-connect-sync-errors)
- [Troubleshooting: Exchange NDRs and Mail Routing](#troubleshooting-exchange-ndrs-and-mail-routing)
- [Troubleshooting: Intune Enrollment and ESP Failures](#troubleshooting-intune-enrollment-and-esp-failures)
- [Troubleshooting: MFA and Sign-In Loops](#troubleshooting-mfa-and-sign-in-loops)
- [Troubleshooting: SharePoint / OneDrive Sync Issues](#troubleshooting-sharepoint-onedrive-sync-issues)
- [Troubleshooting: Unexpected DLP Blocks](#troubleshooting-unexpected-dlp-blocks)

---

## Troubleshooting and Support Chain

This swimlane diagram shows how device issues flow from user to resolution, involving multiple Intune support tools.

```mermaid
sequenceDiagram
    actor User
    participant Helpdesk as IT Helpdesk
    participant Portal as Intune Troubleshooting Portal
    participant Device as Managed Device
    participant Actions as Remote Actions

    User->>Helpdesk: "Can't access email /<br/>missing VPN / app crash"

    Helpdesk->>Portal: Search user / device
    Portal-->>Helpdesk: Show device list + compliance + last sync

    alt Device Non-Compliant
        Helpdesk->>Portal: Review compliance failure
        Portal-->>Helpdesk: e.g., "BitLocker off"
        Helpdesk->>User: Self-service instruction
        User->>Device: Enable BitLocker
        Device->>Portal: Sync + report compliance
    else App Install Failed
        Helpdesk->>Portal: Review app install status
        Portal-->>Helpdesk: Error code + logs
        Helpdesk->>Actions: Retry installation
        Actions->>Device: Push app again
    else Last Sync Old
        Helpdesk->>Actions: Initiate remote sync
        Actions->>Device: WNS push notification
        Device->>Portal: Check-in + refresh inventory
    else Deep Investigation
        Helpdesk->>Portal: Collect device logs
        Portal-->>Helpdesk: Download diagnostic .zip
    end

    Portal-->>Helpdesk: Updated compliance / status
    Helpdesk-->>User: Issue resolved / escalation path
```

### Notes
**Key insight**: The **Troubleshooting + support blade** in Intune now shows per-app install status, per-policy error codes, and deep device logs. For Windows, you can remotely initiate **Collect diagnostics** which gathers Event Viewer logs, registry keys, and MDM diagnostic reports into a downloadable ZIP.

---

## Troubleshooting Conditional Access Sign-in Failures

Use this flow to isolate whether a Conditional Access failure is caused by user scope, app targeting, device state, risk, grant controls or session controls.

```mermaid
flowchart TB
    TCAS_User["User reports sign-in failure"] --> TCAS_Log["Open Entra sign-in logs"]
    TCAS_Log --> TCAS_CA["Conditional Access tab"]
    TCAS_CA --> TCAS_Result{"Policy result"}
    TCAS_Result -->|"Not applied"| TCAS_Scope["Check user group<br/>app platform and location scope"]
    TCAS_Result -->|"Failure"| TCAS_Grant["Check grant controls<br/>MFA compliant device or approved app"]
    TCAS_Result -->|"Report-only"| TCAS_Report["Validate impact before enablement"]
    TCAS_Grant --> TCAS_Device["Review device compliance<br/>join state and app protection"]
    TCAS_Scope --> TCAS_Test["Use What If tool<br/>and reproduce sign-in"]
    TCAS_Device --> TCAS_Test
    TCAS_Report --> TCAS_Test
    TCAS_Test --> TCAS_Fix["Adjust policy or remediate user state"]
```

---

## Troubleshooting Copilot Content Exposure

When Copilot surfaces unexpected content, start with the user access path before applying search restrictions or data protection controls.

```mermaid
flowchart TB
    TCCE_Report["Unexpected Copilot content exposure"] --> TCCE_Item["Identify source item<br/>site owner and user"]
    TCCE_Item --> TCCE_Access["Check why user has access<br/>direct link group team or recent access"]
    TCCE_Access --> TCCE_Permissions{"Access appropriate?"}
    TCCE_Permissions -->|"Yes"| TCCE_Explain["Explain permission-based grounding<br/>and document expected result"]
    TCCE_Permissions -->|"No"| TCCE_Contain["Temporarily contain<br/>RCD RSS or DLP for Copilot"]
    TCCE_Contain --> TCCE_Remediate["Fix permissions<br/>links inheritance labels and ownership"]
    TCCE_Remediate --> TCCE_Validate["Validate Copilot search<br/>audit and access result"]
    TCCE_Validate --> TCCE_Remove["Remove temporary controls<br/>after durable fix"]
    TCCE_Explain --> TCCE_Record["Record case outcome"]
    TCCE_Remove --> TCCE_Record
```

---

## Troubleshooting DLP False Positives

DLP false-positive triage should preserve evidence, identify the matched condition, validate classifier behaviour and tune rules without weakening protection.

```mermaid
flowchart TB
    TDFP_Report["User or alert reports DLP block"] --> TDFP_Alert["Open Purview alert<br/>and matched policy"]
    TDFP_Alert --> TDFP_Match["Review sensitive info type<br/>classifier label and context"]
    TDFP_Match --> TDFP_Validate{"True sensitive match?"}
    TDFP_Validate -->|"Yes"| TDFP_Educate["Educate user<br/>or approve documented override"]
    TDFP_Validate -->|"No"| TDFP_Tune["Tune confidence<br/>exception or trainable classifier"]
    TDFP_Tune --> TDFP_Test["Test in simulation<br/>or limited scope"]
    TDFP_Educate --> TDFP_Record["Record disposition<br/>and evidence"]
    TDFP_Test --> TDFP_Record
    TDFP_Record --> TDFP_Monitor["Monitor recurrence<br/>and alert volume"]
```

---

## Troubleshooting Teams Call Quality

Teams call quality troubleshooting requires narrowing the issue by user, network, device, client, meeting and PSTN path before applying fixes.

```mermaid
flowchart TB
    TTCQ_Ticket["Call quality ticket"] --> TTCQ_Call["Open Call Analytics<br/>or CQD data"]
    TTCQ_Call --> TTCQ_Scope{"Scope"}
    TTCQ_Scope -->|"Single user"| TTCQ_Device["Device headset<br/>driver and Teams client"]
    TTCQ_Scope -->|"Site subnet"| TTCQ_Network["Bandwidth latency<br/>jitter packet loss and QoS"]
    TTCQ_Scope -->|"Meeting"| TTCQ_Meeting["Meeting policy<br/>recording app and media path"]
    TTCQ_Scope -->|"PSTN"| TTCQ_PSTN["Direct Routing Operator Connect<br/>Calling Plan or SBC path"]
    TTCQ_Device --> TTCQ_Action["Apply fix"]
    TTCQ_Network --> TTCQ_Action
    TTCQ_Meeting --> TTCQ_Action
    TTCQ_PSTN --> TTCQ_Action
    TTCQ_Action --> TTCQ_Verify["Repeat test call<br/>and monitor trend"]
```

---

## Troubleshooting: Microsoft Entra Connect Sync Errors

Shows the investigation path and remediation decisions for Microsoft Entra Connect Sync errors in Microsoft 365 environments.

```mermaid
flowchart TD
    Alert[Sync failure alert] --> Portal[Check Microsoft Entra Connect Sync Service Manager and Event Viewer]
    Portal --> Identify{Identify Error Type}
    Identify -->|Duplicate ProxyAddress| Dup[Locate Conflicting AD Objects]
    Identify -->|ImmutableID Mismatch| Imm[Check SourceAnchor / ms-DS-ConsistencyGuid]
    Identify -->|Schema or attribute limit| Schema[Verify Attribute Length & Sync Rules]
    Dup & Imm & Schema --> Resolve[Fix AD attribute clear conflict or reset anchor]
    Resolve --> Force[Run Start-ADSyncSyncCycle -PolicyType Delta]
    Force --> Validate[Verify object in Entra ID and check sync status]
    Validate --> Monitor[Monitor next sync cycle and audit logs]
    style Alert fill:#f8d7da,stroke:#dc3545
    style Resolve fill:#fff3cd,stroke:#856404
    style Validate fill:#d4edda,stroke:#28a745
```

---

## Troubleshooting: Exchange NDRs and Mail Routing

Shows the investigation path and remediation decisions for troubleshooting: exchange ndrs and mail routing in Microsoft 365 environments.

```mermaid
flowchart TD
    NDR[User Receives NDR / Mail Stuck] --> Parse[Parse NDR Code & Failure Reason]
    Parse --> Trace[Run Exchange Message Trace]
    Trace --> Locate{Identify Break Point}
    Locate -->|Connector/TLS| Conn[Check Inbound/Outbound Connectors & Cert Expiry]
    Locate -->|DNS/MX Routing| DNS[Verify MX, SPF, DKIM & Autodiscover]
    Locate -->|Transport Rule| Rule[Review Mail Flow Rules & Quarantine Actions]
    Conn & DNS & Rule --> Fix[Renew Cert / Rebuild Connector / Adjust Rule Precedence]
    Fix --> Test[Send Test Mail Cross-Premises & Cloud]
    Test --> Monitor[Monitor Queue Depth & Mail Flow Dashboard]
    style NDR fill:#f8d7da,stroke:#dc3545
    style Fix fill:#fff3cd,stroke:#856404
    style Monitor fill:#d4edda,stroke:#28a745
```

---

## Troubleshooting: Intune Enrollment and ESP Failures

Shows how to isolate Microsoft Intune enrolment, Autopilot, and Enrollment Status Page failures across identity, licence, platform, network, restriction, and policy causes.

```mermaid
flowchart TB
    Issue[Enrollment Fails or Device Stuck at ESP] --> Collect[Collect Intune Diagnostics, Company Portal Logs, and ESP Error]
    Collect --> Category{Failure Category}

    Category -->|Identity / MFA| Identity[Check User Account, MFA, Conditional Access, and Entra Join]
    Category -->|Licence / Group| Licence[Check Intune Licence, SKU Assignment, and Group Membership]
    Category -->|Platform| Platform[Check OS Version, Ownership, and Supported Platform]
    Category -->|Network| Network[Check Proxy, Firewall, DNS, and Service Connectivity]
    Category -->|Restrictions| Restrictions[Check Enrolment Restrictions and Device Limits]
    Category -->|Policy / App| Policy[Check ESP Blocking Apps, Settings Conflicts, and Assignment Filters]
    Category -->|MDM Authority| Authority[Check MDM Authority and Co-management Workloads]

    Identity & Licence & Platform & Network & Restrictions & Policy & Authority --> Resolve{Resolution Action}

    Resolve --> FixIdentity[Fix Account, MFA, or Join State]
    Resolve --> SyncGroups[Force Group Sync or Correct Assignment]
    Resolve --> FixNetwork[Allow Required Endpoints]
    Resolve --> AdjustPolicy[Remove Conflicting Policy or Non-critical ESP Blocker]
    Resolve --> Reset[Autopilot Reset, Device Sync, or Re-enrol]

    FixIdentity & SyncGroups & FixNetwork & AdjustPolicy & Reset --> Retry[Retry Enrollment]
    Retry --> Verify{Enrollment Complete?}
    Verify -->|Yes| Baseline[Document Root Cause and Update Deployment Ring]
    Verify -->|No| Escalate[Escalate with Logs and Error Codes]

    style Issue fill:#f8d7da,stroke:#dc3545
    style Resolve fill:#fff3cd,stroke:#856404
    style Baseline fill:#d4edda,stroke:#28a745
    style Escalate fill:#e74c3c,color:#fff
```

### Notes
This replaces the separate generic enrolment troubleshooting and Intune ESP troubleshooting diagrams. Start with diagnostics and error codes, then separate identity, licensing, platform, network, restrictions, policy conflicts, and MDM authority issues before retrying enrolment.

---

## Troubleshooting: MFA and Sign-In Loops

Shows the investigation path and remediation decisions for troubleshooting: mfa and sign-in loops in Microsoft 365 environments.

```mermaid
flowchart TD
    Report[User Reports MFA/Sign-In Loop] --> Logs[Check Entra ID Sign-In Logs & Failure Reasons]
    Logs --> CA_Hit{Identify CA Policy Hit}
    CA_Hit -->|Policy Conflict| Conflict[Review Overlapping CA Policies & Precedence]
    CA_Hit -->|Device State Mismatch| Device[Check Intune Compliance & Hybrid Join State]
    CA_Hit -->|Token/Session Issue| Token[Review Session Controls & Token Lifetime]
    Conflict & Device & Token --> Isolate[Use CA What-If Tool & Clear Browser/Token Cache]
    Isolate --> Adjust[Modify Policy Scope / Exclude Break-Glass / Fix Compliance]
    Adjust --> Test[Validate with Test User & Incognito Session]
    Test --> Deploy[Apply Fix & Monitor Sign-In Analytics]
    style Report fill:#f8d7da,stroke:#dc3545
    style Isolate fill:#cce5ff,stroke:#004085
    style Deploy fill:#d4edda,stroke:#28a745
```

---

## Troubleshooting: SharePoint / OneDrive Sync Issues

Shows the investigation path and remediation decisions for troubleshooting: sharepoint / onedrive sync issues in Microsoft 365 environments.

```mermaid
flowchart TD
    Issue[Sync Stuck / Access Denied / Performance Degradation] --> SP_Check[Check SharePoint Site Permissions & Inheritance]
    SP_Check --> Limit{Check Thresholds & Limits}
    Limit -->|Unique Permissions > 50k| Perm[Reset Inheritance & Consolidate Groups]
    Limit -->|List/Library > 100k Items| Thresh[Archive Items & Index Columns]
    Limit -->|Sync Client Corruption| Client[Reset OneDrive Client & Clear Cache]
    Perm & Thresh & Client --> ODSP[Check ODSP Service Health & Throttling Metrics]
    ODSP --> Resolve[Apply Fix / Adjust Sync Scope / Request Throttle Relief]
    Resolve --> Validate[Run Sync Test & Verify File Access Latency]
    Validate --> Govern[Implement Permission Governance & Lifecycle Policy]
    style Issue fill:#f8d7da,stroke:#dc3545
    style ODSP fill:#fff3cd,stroke:#856404
    style Govern fill:#d4edda,stroke:#28a745
```

---

## Troubleshooting: Unexpected DLP Blocks

Shows the investigation path and remediation decisions for troubleshooting: unexpected dlp blocks in Microsoft 365 environments.

```mermaid
flowchart TD
    Block[User Reports Unexpected DLP Block] --> Explorer[Check Purview Activity Explorer & DLP Alerts]
    Explorer --> Conflict{Identify Policy Overlap}
    Conflict -->|Label vs DLP| Label[Review Sensitivity Label Encryption & DLP Scope]
    Conflict -->|Teams vs SharePoint| Svc[Check Service-Specific DLP Precedence]
    Conflict -->|Endpoint vs Cloud| EP[Verify Endpoint DLP Agent & Browser Extensions]
    Label & Svc & EP --> Analyze[Map Rule Confidence, SIT Matches & Exceptions]
    Analyze --> Tune[Adjust Precedence / Add Scoped Exclusions / Lower Confidence]
    Tune --> Simulate[Run in Test Mode & Validate with Activity Explorer]
    Simulate --> Enforce[Switch to Enforce & Monitor False Positive Rate]
    style Block fill:#f8d7da,stroke:#dc3545
    style Analyze fill:#cce5ff,stroke:#004085
    style Enforce fill:#d4edda,stroke:#28a745
```
