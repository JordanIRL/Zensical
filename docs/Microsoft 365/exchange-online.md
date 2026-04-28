# Exchange Online

Exchange Online diagrams for Microsoft 365 admins. This file contains 22 topics covering mail flow, mail protection, authentication, hybrid Exchange, migration, compliance and operational troubleshooting.

## Contents

- [Calendar Sharing and Permissions](#calendar-sharing-and-permissions)
- [Email Address Policy Hierarchy](#email-address-policy-hierarchy)
- [Email Authentication: SPF, DKIM, DMARC and ARC](#email-authentication-spf-dkim-dmarc-and-arc)
- [Email Encryption (OME) Flow](#email-encryption-ome-flow)
- [Email Security Best Practices](#email-security-best-practices)
- [Exchange Admin Center Navigation](#exchange-admin-center-navigation)
- [Exchange Online Architecture Overview](#exchange-online-architecture-overview)
- [Exchange Online Compliance Features](#exchange-online-compliance-features)
- [Exchange Online Limits and Quotas](#exchange-online-limits-and-quotas)
- [Exchange Online Protection Settings](#exchange-online-protection-settings)
- [Exchange PowerShell Commands](#exchange-powershell-commands)
- [Hybrid Exchange Configuration](#hybrid-exchange-configuration)
- [Inbound Mail Flow with Security Layers](#inbound-mail-flow-with-security-layers)
- [Legacy Authentication Blocking](#legacy-authentication-blocking)
- [Mailbox Migration Workflow](#mailbox-migration-workflow)
- [Message Trace Analysis](#message-trace-analysis)
- [Microsoft 365 Groups vs Distribution Groups](#microsoft-365-groups-vs-distribution-groups)
- [Outbound Mail Flow](#outbound-mail-flow)
- [Public Folder Migration](#public-folder-migration)
- [Quarantine Management Flow](#quarantine-management-flow)
- [Shared Mailbox vs User Mailbox](#shared-mailbox-vs-user-mailbox)
- [Transport Rules Decision Tree](#transport-rules-decision-tree)

---

## Calendar Sharing and Permissions

Shows the main components, decisions, and operational flow for calendar sharing and permissions in Microsoft 365 exchange online work.

```mermaid
flowchart TD
    Owner[Calendar Owner] --> Share{Share Calendar}

    Share -->|Internal| InternalShare[Internal Sharing]
    Share -->|External| ExternalShare[External Sharing]
    Share -->|Publish| PublishShare[Publish Calendar]

    InternalShare --> Permission{Permission Level}
    Permission -->|Owner| OwnerAccess[Full Control + Delegate]
    Permission -->|Editor| EditorAccess[Create/Edit/Delete Items]
    Permission -->|Contributor| ContributorAccess[Create Items Only]
    Permission -->|Reviewer| ReviewerAccess[Read Only]
    Permission -->|Availability| AvailabilityAccess[Free/Busy Only]

    ExternalShare --> Method{Sharing Method}
    Method -->|Invitation| InviteShare[Share via Invitation]
    Method -->|Link| LinkShare[Share via Link]
    Method -->|Federated| FedShare[Federated Sharing]

    PublishShare --> URL[Generate ICS URL]
    URL --> Anonymous[Anonymous Access]

    OwnerAccess --> Recipient[Internal Recipient]
    EditorAccess --> Recipient
    ContributorAccess --> Recipient
    ReviewerAccess --> Recipient
    AvailabilityAccess --> Recipient

    InviteShare --> ExternalUser[External User]
    LinkShare --> ExternalUser
    FedShare --> PartnerOrg[Partner Organisation]

    Recipient --> View[View Calendar]
    ExternalUser --> View
    PartnerOrg --> View
    Anonymous --> View

    style Owner fill:#3498db,color:#fff
    style InternalShare fill:#27ae60,color:#fff
    style ExternalShare fill:#f39c12,color:#fff
    style PublishShare fill:#95a5a6,color:#fff
```

---

## Email Address Policy Hierarchy

Shows the main components, decisions, and operational flow for email address policy hierarchy in Microsoft 365 exchange online work.

```mermaid
flowchart TB
    subgraph PolicyOrder["Policy Processing Order"]
        P1[Policy 1 - Highest Priority]
        P2[Policy 2]
        P3[Policy 3]
        P4[Policy 4 - Default Policy]
    end

    subgraph RecipientTypes["Recipient Type Filters"]
        AllRecipients[All Recipients]
        MailboxUsers[Mailbox Users Only]
        Contacts[Contacts Only]
        Groups[Groups Only]
        Custom[Custom Filter]
    end

    subgraph AddressFormats["Address Formats"]
        AliasDomain["alias@domain.com"]
        FirstLast["first.last@domain.com"]
        FirstInitialLast["firstlast@domain.com"]
        CustomFormat["Custom Format"]
    end

    P1 --> Apply1[Apply to Matching Recipients]
    P2 --> Apply2[Apply to Remaining]
    P3 --> Apply3[Apply to Remaining]
    P4 --> Apply4[Apply Default]

    Apply1 --> AddressFormats
    Apply2 --> AddressFormats
    Apply3 --> AddressFormats
    Apply4 --> AddressFormats

    AddressFormats --> Primary[Set Primary Address]
    AddressFormats --> Secondary[Add Secondary Addresses]

    Primary --> Update[Update Recipient]
    Secondary --> Update

    style PolicyOrder fill:#3498db,color:#fff
    style RecipientTypes fill:#27ae60,color:#fff
    style AddressFormats fill:#f39c12,color:#fff
```

---

## Email Authentication: SPF, DKIM, DMARC and ARC

Email authentication combines DNS records, signing and authentication results so Exchange Online Protection can evaluate sender legitimacy.

```mermaid
flowchart TB
    EA_Sender["Sending domain"] --> EA_SPF["SPF record<br/>authorised sending hosts"]
    EA_Sender --> EA_DKIM["DKIM signing<br/>domain-aligned signature"]
    EA_Sender --> EA_DMARC["DMARC policy<br/>alignment and reporting"]
    EA_Message["Inbound message"] --> EA_EOP["Exchange Online Protection"]
    EA_SPF --> EA_EOP
    EA_DKIM --> EA_EOP
    EA_DMARC --> EA_EOP
    EA_Forward["Forwarding or intermediary"] --> EA_ARC["ARC preserves authentication chain"]
    EA_ARC --> EA_EOP
    EA_EOP --> EA_Result{"Composite authentication result"}
    EA_Result -->|"Pass"| EA_Deliver["Deliver or continue filtering"]
    EA_Result -->|"Fail or suspicious"| EA_Action["Spam phishing<br/>quarantine or reject action"]
    EA_Action --> EA_Report["Message trace<br/>headers and reports"]
    EA_Deliver --> EA_Report
```

---

## Email Encryption (OME) Flow

Shows the main components, decisions, and operational flow for email encryption (ome) flow in Microsoft 365 exchange online work.

```mermaid
flowchart TD
    Sender[User Sends Email] --> Trigger{Encryption Trigger}

    Trigger -->|Manual| ManualEncrypt[Select Encryption Option]
    Trigger -->|Transport Rule| AutoEncrypt[Transport Rule Applied]
    Trigger -->|DLP| DLPEncrypt[DLP Policy Applied]
    Trigger -->|Sensitivity| SensitivityEncrypt[Sensitivity Label Applied]

    ManualEncrypt --> EncryptService[Office 365 Message Encryption service]
    AutoEncrypt --> EncryptService
    DLPEncrypt --> EncryptService
    SensitivityEncrypt --> EncryptService

    EncryptService --> Wrap[Wrap Message]
    Wrap --> Rights[Apply Rights]

    Rights --> NoForward[Do Not Forward]
    Rights --> ReadOnly[Read Only]
    Rights --> DoNotCopy[Do Not Copy]
    Rights --> Expire[Expiration Date]

    NoForward --> Send
    ReadOnly --> Send
    DoNotCopy --> Send
    Expire --> Send

    Send --> Recipient{Recipient Type}

    Recipient -->|Microsoft 365 user| M365Decrypt[Automatic Decryption]
    Recipient -->|Other Microsoft 365 tenant| OtherM365[Microsoft Entra ID Auth]
    Recipient -->|External| External[One-Time Passcode]
    Recipient -->|Gmail/Outlook| Consumer[Consumer Email]

    M365Decrypt --> Read[Read Message]
    OtherM365 --> Read
    External --> OTP[Generate OTP]
    OTP --> Read
    Consumer --> Portal[Encryption Portal]
    Portal --> Read

    style Sender fill:#3498db,color:#fff
    style EncryptService fill:#f39c12,color:#fff
    style Read fill:#27ae60,color:#fff
```

---

## Email Security Best Practices

Shows the main components, decisions, and operational flow for email security best practices in Microsoft 365 exchange online work.

```mermaid
flowchart TB
    subgraph DNS["DNS Records"]
        SPF[SPF Record]
        DKIM[DKIM Configuration]
        DMARC[DMARC Policy]
        BIMI[BIMI Record]
    end

    subgraph Authentication["Authentication"]
        MFA[MFA for Admins]
        ModernAuth[Modern Auth Only]
        LegacyBlock[Block Legacy Auth]
    end

    subgraph Protection["Protection Layers"]
        EOP[Exchange Online Protection]
        ATP[Defender for Office 365]
        SafeAttachments[Safe Attachments]
        SafeLinks[Safe Links]
    end

    subgraph Policies["Security Policies"]
        TransportRules[Transport Rules]
        DLPPolicies[DLP Policies]
        RetentionPolicies[Retention Policies]
        QuarantinePolicies[Quarantine Policies]
    end

    DNS --> SPF
    DNS --> DKIM
    DNS --> DMARC
    DNS --> BIMI

    Authentication --> MFA
    Authentication --> ModernAuth
    Authentication --> LegacyBlock

    Protection --> EOP
    Protection --> ATP
    Protection --> SafeAttachments
    Protection --> SafeLinks

    Policies --> TransportRules
    Policies --> DLPPolicies
    Policies --> RetentionPolicies
    Policies --> QuarantinePolicies

    SPF --> PreventSpoof[Prevent Spoofing]
    DKIM --> VerifySender[Verify Sender]
    DMARC --> PolicyEnforcement[Policy Enforcement]

    MFA --> ProtectAdmin[Protect Admin Accounts]
    ModernAuth --> SecureAuth[Secure Authentication]
    LegacyBlock --> ReduceAttack[Reduce Attack Surface]

    style DNS fill:#3498db,color:#fff
    style Authentication fill:#e74c3c,color:#fff
    style Protection fill:#27ae60,color:#fff
    style Policies fill:#f39c12,color:#fff
```

---

## Exchange Admin Center Navigation

Shows the main components, decisions, and operational flow for exchange admin center navigation in Microsoft 365 exchange online work.

```mermaid
mindmap
  root((Exchange Admin))
    Recipients
      Mailboxes
        User Mailboxes
        Shared Mailboxes
        Resource Mailboxes
        Equipment Mailboxes
        Room Mailboxes
      Contacts
        Mail Contacts
        Mail Users
      Groups
        Distribution Groups
        Microsoft 365 Groups
        Dynamic Groups
      Resources
        Rooms
        Equipment
    Protection
      Filter
        Connection Filter
        Spam Filter
        Malware Filter
        Anti-Phishing
      Policies
        Preset Security Policies
        Standard Policies
        Strict Policies
      Quarantine
        Quarantine Messages
        Quarantine Policies
    Mail Flow
      Rules
        Transport Rules
        Inbox Rules
      Connectors
        Send Connectors
        Receive Connectors
        Inbound Connectors
        Outbound Connectors
      Accepted Domains
      Email Address Policies
      Address Books
        Address Book Policies
        Offline Address Books
        Address Lists
    Compliance & eDiscovery
      Data Loss Prevention
        DLP Policies
        Sensitive Info Types
      Retention
        Retention Tags
        Retention Policies
        Retention Holds
      eDiscovery
        Content Search
        eDiscovery Cases
        Export Results
      Audit
        Mailbox Audit
        Admin Audit
        Unified Audit Log
    Organization
      Sharing
        Sharing Policies
        Federated Sharing
        Organisation Relationships
      Migration
        Migration Batches
        Migration Endpoints
      Mobile
        Mobile Device Mailbox Policies
        ActiveSync Devices
      Client Access
        Outlook Web App Policies
        ActiveSync Policies
        POP/IMAP Settings
```

---

## Exchange Online Architecture Overview

Shows the main components, decisions, and operational flow for exchange online architecture overview in Microsoft 365 exchange online work.

```mermaid
flowchart TB
    subgraph M365["Microsoft 365 Cloud"]
        direction TB

        subgraph Exchange["Exchange Online"]
            Mailboxes[User Mailboxes]
            SharedMailboxes[Shared Mailboxes]
            ResourceMailboxes[Resource Mailboxes]
            DistributionLists[Distribution Lists]
            M365Groups[M365 Groups]
        end

        subgraph Protection["Email Protection"]
            EOP[Exchange Online Protection]
            ATP[Defender for Office 365]
            Quarantine[Quarantine Service]
            SpamFilter[Anti-Spam Filtering]
        end

        subgraph Compliance["Compliance & Governance"]
            DLP[Data Loss Prevention]
            Retention[Retention Policies]
            LitigationHold[Litigation Hold]
            eDiscovery[eDiscovery]
            Audit[Audit Logging]
        end

        subgraph Features["Collaboration Features"]
            Calendar[Calendar Sharing]
            Contacts[Contact Sharing]
            PublicFolders[Public Folders]
            InPlaceArchive[In-Place Archive]
        end
    end

    subgraph Clients["Client Applications"]
        Outlook[Outlook Desktop]
        OWA[Outlook on the Web]
        Mobile[Outlook Mobile]
        MAPI[MAPI/HTTP Clients]
        IMAP[IMAP Clients]
        POP[POP Clients]
    end

    subgraph Integration["External Integration"]
        SMTP[SMTP Relay]
        Connectors[Send/Receive Connectors]
        Hybrid[Hybrid Configuration]
        Journaling[Journaling]
    end

    Clients --> Exchange
    Protection --> Exchange
    Compliance --> Exchange
    Features --> Exchange
    Exchange --> Integration

    style Exchange fill:#0078d4,color:#fff
    style Protection fill:#e74c3c,color:#fff
    style Compliance fill:#27ae60,color:#fff
    style Features fill:#f39c12,color:#fff
```

---

## Exchange Online Compliance Features

Exchange Online compliance controls should be planned as policy and evidence flows, not as isolated feature checkboxes.

```mermaid
flowchart TB
    EOC_Data["Exchange Online messages<br/>mailboxes and audit records"] --> EOC_Policies["Microsoft Purview policies"]
    EOC_Policies --> EOC_Retention["Retention labels<br/>and retention policies"]
    EOC_Policies --> EOC_DLP["Data Loss Prevention"]
    EOC_Policies --> EOC_eDiscovery["eDiscovery search<br/>hold and export"]
    EOC_Policies --> EOC_Audit["Audit search<br/>and investigation evidence"]
    EOC_DLP --> EOC_Alerts["Alerts and policy tips"]
    EOC_Retention --> EOC_Lifecycle["Keep delete or dispose"]
    EOC_eDiscovery --> EOC_Case["Legal or regulatory case"]
    EOC_Audit --> EOC_Case
    EOC_Alerts --> EOC_Tune["Tune conditions<br/>exceptions and overrides"]
    EOC_Tune --> EOC_Policies
```

### Notes

- Configure mailbox and message controls in Microsoft Purview where possible so evidence, review and retention are consistent across workloads.

---

## Exchange Online Limits and Quotas

Shows the main components, decisions, and operational flow for exchange online limits and quotas in Microsoft 365 exchange online work.

```mermaid
flowchart LR
    subgraph Mailbox["Mailbox Limits"]
        Size100[100 GB - E3 License]
        Size50[50 GB - Standalone]
        Archive[Unlimited Archive]
        RecipientLimit[500 recipients/msg]
    end

    subgraph Sending["Sending Limits"]
        DailyLimit[10,000 recipients/day]
        RateLimit[30 messages/minute]
        RecipientPerMsg[500 recipients/message]
        DistributionLimit[1,500 recipients]
    end

    subgraph Receiving["Receiving Limits"]
        MessageSize[35 MB Default]
        AttachmentSize[Attachment Limits]
        InboxRules[64 KB rule limit]
    end

    subgraph Recovery["Recovery Limits"]
        DeletedRetention[14-30 days]
        RecoverableItems[30 days]
        LitigationHold[Indefinite]
    end

    Mailbox --> Size100
    Mailbox --> Size50
    Mailbox --> Archive
    Mailbox --> RecipientLimit

    Sending --> DailyLimit
    Sending --> RateLimit
    Sending --> RecipientPerMsg
    Sending --> DistributionLimit

    Receiving --> MessageSize
    Receiving --> AttachmentSize
    Receiving --> InboxRules

    Recovery --> DeletedRetention
    Recovery --> RecoverableItems
    Recovery --> LitigationHold

    style Mailbox fill:#3498db,color:#fff
    style Sending fill:#e74c3c,color:#fff
    style Receiving fill:#27ae60,color:#fff
    style Recovery fill:#f39c12,color:#fff
```

---

## Exchange Online Protection Settings

Shows the main components, decisions, and operational flow for exchange online protection settings in Microsoft 365 exchange online work.

```mermaid
mindmap
  root((EOP Settings))
    Connection Filter
        IP Allow List
        IP Block List
        Safe Lists
        Country Filtering
    Spam Filter
        Preset Policies
            Default
            Standard
            Strict
        Custom Policies
            Spam Action
            High Confidence Spam
            Bulk Email
            Phishing
        Allow/Block Lists
            Safe Senders
            Blocked Senders
            Safe Domains
            Blocked Domains
    Malware Filter
        Default Action
        Zero-hour Auto Purge
        File Type Filtering
        Extension Blocking
    Anti-Phishing
        User Impersonation
            Protected Users
            Detection Threshold - User Impersonation
        Domain Impersonation
            Protected Domains
            Detection Threshold - Domain Impersonation
        Mailbox Intelligence
            User Behavior Analysis
            Unusual Sending Patterns
        Spoof Intelligence
            Intra-org Spoof
            External Spoof
    Quarantine
        End-User Spam Notifications
        Quarantine Policies
            Full Access
            Summary
            Headers Only
        Release Requests
            Admin Release
            End-User Release
```

---

## Exchange PowerShell Commands

Shows the main components, decisions, and operational flow for exchange powershell commands in Microsoft 365 exchange online work.

```mermaid
flowchart LR
    subgraph Connection["Module Connection"]
        ImportModule[Import-Module ExchangeOnlineManagement]
        ConnectEXO[Connect-ExchangeOnline]
        DisconnectEXO[Disconnect-ExchangeOnline]
    end

    subgraph Mailbox["Mailbox Management"]
        GetMailbox[Get-Mailbox]
        NewMailbox[New-Mailbox]
        SetMailbox[Set-Mailbox]
        MoveMailbox[New-MoveRequest]
        RemoveMailbox[Remove-Mailbox]
    end

    subgraph Permissions["Permission Management"]
        GetPerm[Get-MailboxPermission]
        AddPerm[Add-MailboxPermission]
        RemovePerm[Remove-MailboxPermission]
        GetFolderPerm[Get-MailboxFolderPermission]
    end

    subgraph Transport["Transport Management"]
        GetTransportRule[Get-TransportRule]
        NewTransportRule[New-TransportRule]
        GetConnector[Get-SendConnector]
        GetQueue[Get-Queue]
    end

    subgraph Reports["Reporting & Tracing"]
        GetMessageTrace[Get-MessageTrace]
        GetMailboxStats[Get-MailboxStatistics]
        GetQuarantine[Get-QuarantineMessage]
        GetDlpReport[Get-DlpComplianceReport]
    end

    Connection --> Mailbox
    Mailbox --> Permissions
    Permissions --> Transport
    Transport --> Reports

    style Connection fill:#3498db,color:#fff
    style Mailbox fill:#27ae60,color:#fff
    style Permissions fill:#f39c12,color:#fff
    style Transport fill:#9b59b6,color:#fff
    style Reports fill:#e67e22,color:#fff
```

---

## Hybrid Exchange Configuration

Shows the main components, decisions, and operational flow for hybrid exchange configuration in Microsoft 365 exchange online work.

```mermaid
flowchart TB
    subgraph OnPrem["On-Premises Exchange"]
        Exchange2016[Exchange Server 2016/2019]
        OnPremMailboxes[On-Prem Mailboxes]
        OnPremTransport[On-Prem Transport]
        EdgeTransport[Edge Transport Server]
    end

    subgraph Cloud["Exchange Online"]
        CloudMailboxes[Cloud Mailboxes]
        CloudTransport[Cloud Transport]
        CloudProtection[EOP / Defender for Office 365]
    end

    subgraph Connect["Hybrid Connectivity"]
        HCW[Hybrid Configuration Wizard]
        SendConnector[Send Connector]
        ReceiveConnector[Receive Connector]
        InboundConnector[Inbound Connector]
        OutboundConnector[Outbound Connector]
    end

    subgraph Features["Hybrid Features"]
        FreeBusy[Free/Busy Sharing]
        MailTips[MailTips]
        OOF[Out of Office]
        RemoteMove[Remote Move Requests]
        CentralizedTransport[Centralized Transport]
    end

    OnPremMailboxes <-->|Internal| OnPremTransport
    CloudMailboxes <-->|Internal| CloudTransport

    OnPremTransport <-->|Send Connector| SendConnector
    SendConnector --> CloudTransport

    CloudTransport <-->|Outbound Connector| OutboundConnector
    OutboundConnector --> OnPremTransport

    CloudTransport -->|Inbound Connector| InboundConnector
    InboundConnector --> OnPremTransport

    OnPremTransport -->|Edge| EdgeTransport
    EdgeTransport --> Internet[Internet Mail]

    CloudProtection --> Internet

    HCW --> Connect
    Connect --> Features

    style OnPrem fill:#2c3e50,color:#fff
    style Cloud fill:#0078d4,color:#fff
    style Connect fill:#f39c12,color:#fff
    style Features fill:#27ae60,color:#fff
```

---

## Inbound Mail Flow with Security Layers

Inbound mail flow combines Exchange Online Protection, optional Defender for Office 365 capabilities, transport rules and DLP before delivery.

```mermaid
flowchart LR
    Internet["Internet sender"] --> MX["MX record"]
    MX --> EOPIngress["Exchange Online Protection"]

    subgraph EOPLayers["EOP security layers"]
        RBL["Connection filtering"]
        SPF["SPF validation"]
        DKIM["DKIM validation"]
        DMARC["DMARC validation"]
        SpamFilter["Content filtering"]
        MalwareFilter["Malware scanning"]
    end

    EOPIngress --> RBL
    RBL --> SPF
    SPF --> DKIM
    DKIM --> DMARC
    DMARC --> SpamFilter
    SpamFilter --> MalwareFilter
    MalwareFilter --> ATPDecision{"Defender for Office 365 enabled?"}

    subgraph DefenderFeatures["Defender for Office 365"]
        SafeLinks["Safe Links"]
        SafeAttachments["Safe Attachments"]
        AntiPhish["Anti-phishing"]
        Impersonation["Impersonation protection"]
    end

    ATPDecision -->|"Yes"| SafeLinks
    SafeLinks --> SafeAttachments
    SafeAttachments --> AntiPhish
    AntiPhish --> Impersonation
    Impersonation --> Transport["Transport rules"]
    ATPDecision -->|"No"| Transport

    Transport --> DLP{"DLP check"}
    DLP -->|"Violation"| Action{"Policy action"}
    DLP -->|"Clean"| Delivery["Deliver to mailbox"]
    Action -->|"Block"| Reject["Reject message"]
    Action -->|"Quarantine"| Quarantined["Quarantine message"]
    Action -->|"Encrypt"| OME["Apply message encryption"]
    Action -->|"Modify"| Modify["Modify headers or recipients"]
```

---

## Legacy Authentication Blocking

Blocking legacy authentication reduces credential replay risk by requiring modern authentication and Conditional Access compatible clients.

```mermaid
flowchart TB
    LAB_Request["Client sign-in request"] --> LAB_Protocol{"Protocol and client"}
    LAB_Protocol -->|"Modern auth"| LAB_Modern["OAuth token flow"]
    LAB_Protocol -->|"Basic or legacy auth"| LAB_Legacy["Legacy protocol detected"]
    LAB_Modern --> LAB_CA["Conditional Access<br/>MFA device and risk controls"]
    LAB_Legacy --> LAB_Block["Block with auth policy<br/>CA or protocol setting"]
    LAB_Block --> LAB_Exception{"Temporary exception needed?"}
    LAB_Exception -->|"Yes"| LAB_Scope["Scoped exception<br/>owner expiry and monitoring"]
    LAB_Exception -->|"No"| LAB_Remediate["Upgrade client<br/>or disable protocol"]
    LAB_CA --> LAB_Access["Access decision"]
    LAB_Scope --> LAB_Remediate
    LAB_Remediate --> LAB_Report["Sign-in log and report review"]
    LAB_Access --> LAB_Report
```

---

## Mailbox Migration Workflow

Shows the main components, decisions, and operational flow for mailbox migration workflow in Microsoft 365 exchange online work.

```mermaid
flowchart TD
    Start[Migration Request] --> Prep{Preparation}

    Prep -->|Hybrid| HybridMove[Remote Move Request]
    Prep -->|Cutover| CutoverMove[Cutover Migration]
    Prep -->|Staged| StagedMove[Staged Migration]
    Prep -->|PST| PSTImport[PST Import]

    HybridMove --> Sync[Sync Mailbox Contents]
    CutoverMove --> Sync
    StagedMove --> Sync
    PSTImport --> Upload[Upload PST to Azure]

    Sync --> Initial[Initial Sync Complete]
    Upload --> Import[Import to Mailbox]

    Initial --> Delta[Delta Sync]
    Delta --> Cutover{Cutover Ready?}

    Cutover -->|Yes| FinalSync[Final Synchronization]
    Cutover -->|No| ContinueDelta[Continue Delta Sync]

    ContinueDelta --> Cutover

    FinalSync --> Switch[Switch Mail Flow]
    Switch --> MX[Update MX Record]
    MX --> Autodiscover[Update Autodiscover]
    Autodiscover --> Convert[Convert to Cloud Mailbox]

    Convert --> License[Assign License]
    License --> Complete[Migration Complete]

    Complete --> Verify[Verify Mailbox]
    Verify --> Decommission{Decommission On-Prem?}
    Decommission -->|Yes| Remove[Remove On-Prem Mailbox]
    Decommission -->|No| Keep[Keep for Management]

    style Start fill:#3498db,color:#fff
    style Complete fill:#27ae60,color:#fff
    style Remove fill:#e74c3c,color:#fff
```

---

## Message Trace Analysis

Use message trace to move from a delivery symptom to the transport event, filtering result and remediation path.

```mermaid
flowchart TB
    Start["Message trace request"] --> Search["Search by sender recipient<br/>time range and status"]
    Search --> Results{"Trace results found?"}
    Results -->|"No"| ExpandSearch["Expand search parameters"]
    ExpandSearch --> Search
    Results -->|"Yes"| Details["Open message details"]
    Details --> EventTimeline["Show event timeline"]

    subgraph MessageEvents["Message events"]
        Submit["Submitted"]
        Process["Processed by transport"]
        Filter["Filtered by rules"]
        Scan["Scanned by protection"]
        Route["Routed to destination"]
        Deliver["Delivered"]
        Fail["Failed"]
        Defer["Deferred"]
    end

    EventTimeline --> Submit
    Submit --> Process
    Process --> Filter
    Filter --> Scan
    Scan --> Route
    Route --> Analyze{"Analyse event outcome"}
    Analyze -->|"Delivered"| Success["Delivery successful"]
    Analyze -->|"Failed"| Investigate["Investigate failure"]
    Analyze -->|"Deferred"| Wait["Wait for retry or inspect queue"]
    Analyze -->|"Quarantined"| Review["Review quarantine"]
    Investigate --> CommonIssues{"Common issue"}
    CommonIssues -->|"Spam"| SpamIssue["Spam filter issue"]
    CommonIssues -->|"Relay"| RelayIssue["Relay issue"]
    CommonIssues -->|"Recipient"| RecipientIssue["Recipient issue"]
    CommonIssues -->|"Size"| SizeIssue["Message size issue"]
    SpamIssue --> Remediate["Remediate issue"]
    RelayIssue --> Remediate
    RecipientIssue --> Remediate
    SizeIssue --> Remediate
```

---

## Microsoft 365 Groups vs Distribution Groups

Shows the main components, decisions, and operational flow for office 365 groups vs distribution groups in Microsoft 365 exchange online work.

```mermaid
classDiagram
    class DistributionGroup {
        +Email Distribution
        +No Shared Storage
        +No Teams Integration
        +No SharePoint Site
        +Simple Management
        +Nested Group Support
        +Dynamic Membership
        +Send As Permissions
    }

    class Office365Group {
        +Email Distribution
        +Shared Mailbox
        +SharePoint Document Library
        +Teams Integration
        +Planner Board
        +OneNote Notebook
        +Calendar Sharing
        +Conversation History
    }

    class SecurityGroup {
        +Permission Assignment
        +Email Capable
        +No Collaboration Tools
        +Microsoft Entra ID Roles
        +Resource Access
    }

    DistributionGroup --|> EmailOnly : Traditional Use
    Office365Group --|> Collaboration : Modern Workspace
    SecurityGroup --|> Access : Security Focus

    note for DistributionGroup "Best for: Simple email distribution, Announcement emails, Traditional DL scenarios"

    note for Office365Group "Best for: Team collaboration, Project workspaces, Modern teamwork"

    style DistributionGroup fill:#3498db,color:#fff
    style Office365Group fill:#27ae60,color:#fff
    style SecurityGroup fill:#e74c3c,color:#fff
```

---

## Outbound Mail Flow

Shows the main components, decisions, and operational flow for outbound mail flow in Microsoft 365 exchange online work.

```mermaid
flowchart TB
    User[Internal User] --> Submit[Submit Message]
    Submit --> Hub[Transport Hub]

    Hub --> Rules{Transport Rules}
    Rules -->|Apply| Modify[Apply Modifications]
    Rules -->|None| DLP{DLP Check}

    Modify --> DLP

    DLP -->|Sensitive Data| Encrypt[Apply Encryption]
    DLP -->|Policy Violation| Block[Block Message]
    DLP -->|Clean| Route{Routing Decision}

    Encrypt --> Route

    Route -->|Internal| InternalMailbox[Internal Mailbox]
    Route -->|External| OutboundGateway[Outbound Gateway]
    Route -->|Partner| PartnerConnector[Partner Connector]

    OutboundGateway --> SmartHost{Smart Host Configured?}
    SmartHost -->|Yes| SmartHostRoute[Route via Smart Host]
    SmartHost -->|No| DirectSend[Direct Send to Internet]

    PartnerConnector --> TLS{Require TLS?}
    TLS -->|Yes| TLSSecure[Secure TLS Connection]
    TLS -->|No| StandardConn[Standard Connection]

    SmartHostRoute --> Internet[Internet Recipient]
    DirectSend --> Internet
    TLSSecure --> Partner[Partner Organisation]
    StandardConn --> Partner

    Block --> Quarantine[Quarantine]
    Quarantine --> AdminReview[Admin Review]
    AdminReview --> Release[Release Message]
    AdminReview --> Delete[Delete Message]

    style User fill:#3498db,color:#fff
    style InternalMailbox fill:#27ae60,color:#fff
    style Block fill:#e74c3c,color:#fff
    style Internet fill:#95a5a6,color:#fff
```

---

## Public Folder Migration

Shows the main components, decisions, and operational flow for public folder migration in Microsoft 365 exchange online work.

```mermaid
flowchart TB
    subgraph OnPremPF["On-Premises Public Folders"]
        PF2013[Exchange 2013 PF]
        PF2016[Exchange 2016 PF]
        PF2019[Exchange 2019 PF]
    end

    subgraph Migration["Migration Process"]
        Assess[Assess Public Folders]
        Prepare[Prepare for Migration]
        CreateBatch[Create Migration Batch]
        Sync[Initial Synchronization]
        Complete[Complete Migration]
    end

    subgraph CloudPF["Exchange Online Public Folders"]
        CloudHierarchy[Cloud Hierarchy]
        CloudContent[Cloud Content]
        CloudMail[Mail-Enabled PF]
    end

    OnPremPF --> Assess
    Assess -->|Compatible| Prepare
    Assess -->|Not Compatible| Remediate[Remediate Issues]

    Remediate --> Prepare

    Prepare -->|Modern PF| CreateBatch
    Prepare -->|Legacy| Upgrade[Upgrade to Modern]

    Upgrade --> CreateBatch

    CreateBatch --> Sync
    Sync -->|Delta Sync| Lock[Lock On-Prem PF]
    Lock --> Complete

    Complete --> Verify[Verify Migration]
    Verify --> CloudPF

    CloudPF --> CloudHierarchy
    CloudPF --> CloudContent
    CloudPF --> CloudMail

    style OnPremPF fill:#2c3e50,color:#fff
    style Migration fill:#f39c12,color:#fff
    style CloudPF fill:#0078d4,color:#fff
```

---

## Quarantine Management Flow

Shows the main components, decisions, and operational flow for quarantine management flow in Microsoft 365 exchange online work.

```mermaid
flowchart TB
    Message[Suspicious Message] --> Quarantine[Quarantine]

    Quarantine --> Type{Quarantine Type}

    Type -->|Spam| SpamQ[Spam Quarantine]
    Type -->|Malware| MalwareQ[Malware Quarantine]
    Type -->|Phish| PhishQ[Phishing Quarantine]
    Type -->|DLP| DLPQ[DLP Quarantine]
    Type -->|Transport| TransportQ[Transport Rule Quarantine]

    SpamQ --> EndUser{End-User Enabled?}
    MalwareQ --> Admin[Admin Only]
    PhishQ --> Admin
    DLPQ --> Admin
    TransportQ --> Admin

    EndUser -->|Yes| UserReview[User Can Review]
    EndUser -->|No| Admin

    UserReview --> UserAction{User Action}
    UserAction -->|Release| SelfRelease[Release to Inbox]
    UserAction -->|Block| BlockSender[Block Future Messages]
    UserAction -->|Delete| UserDelete[Delete Message]

    Admin --> AdminAction{Admin Action}
    AdminAction -->|Release| AdminRelease[Release with Options]
    AdminAction -->|Delete| AdminDelete[Delete Permanently]
    AdminAction -->|Preview| Preview[Preview Message]

    AdminRelease --> Options{Release Options}
    Options -->|Allow| AllowFuture[Allow from Sender]
    Options -->|Block| BlockFuture[Block from Sender]
    Options -->|None| ReleaseOnly[Release Only]

    style Quarantine fill:#f39c12,color:#fff
    style Admin fill:#e74c3c,color:#fff
    style SelfRelease fill:#27ae60,color:#fff
    style AdminRelease fill:#3498db,color:#fff
```

---

## Shared Mailbox vs User Mailbox

Shows the main components, decisions, and operational flow for shared mailbox vs user mailbox in Microsoft 365 exchange online work.

```mermaid
classDiagram
    class UserMailbox {
        +Licence Required
        +Direct Sign-In
        +Primary Email Access
        +Calendar Ownership
        +Sent Items Tracking
        +In-Place Archive
        +Litigation Hold
        +Size: 100 GB (E3)
        +Size: 1.5 TB (E5)
    }

    class SharedMailbox {
        +No Licence Required*
        +No Direct Sign-In
        +Delegate Access
        +Shared Calendar
        +Send As/On Behalf
        +In-Place Archive*
        +Litigation Hold*
        +Size: 50 GB
        +Size: 50 GB (with licence)
    }

    class ResourceMailbox {
        +Room Mailbox
        +Equipment Mailbox
        +Auto-Accept/Decline
        +Scheduling Period
        +Conflict Management
        +No Licence Required
    }

    UserMailbox -- SharedMailbox : Can Convert
    SharedMailbox -- UserMailbox : Can Convert
    UserMailbox -- ResourceMailbox : Can Convert

    note for SharedMailbox "* Requires Exchange Online Plan 2 or Exchange Online Archiving licence for advanced features"

    style UserMailbox fill:#3498db,color:#fff
    style SharedMailbox fill:#27ae60,color:#fff
    style ResourceMailbox fill:#9b59b6,color:#fff
```

---

## Transport Rules Decision Tree

Transport rules evaluate message conditions, apply exceptions and then enforce actions before final delivery.

```mermaid
flowchart TD
    Message["Email message"] --> ConditionsDecision{"Evaluate transport rule conditions"}

    subgraph ConditionTypes["Condition types"]
        Sender["Sender is"]
        Recipient["Recipient is"]
        Subject["Subject contains"]
        Attachment["Has attachment"]
        Size["Message size"]
        Headers["Headers match"]
        Classification["Classification applied"]
    end

    ConditionsDecision --> Sender
    ConditionsDecision --> Recipient
    ConditionsDecision --> Subject
    ConditionsDecision --> Attachment
    ConditionsDecision --> Size
    ConditionsDecision --> Headers
    ConditionsDecision --> Classification
    Classification --> MatchDecision{"Any rule match?"}
    MatchDecision -->|"No"| Deliver["Normal delivery"]
    MatchDecision -->|"Yes"| ActionsDecision{"Apply configured actions"}

    subgraph ActionTypes["Available actions"]
        Redirect["Redirect message"]
        Reject["Reject with NDR"]
        Quarantine["Send to quarantine"]
        AddDisclaimer["Add disclaimer"]
        SetHeader["Set header"]
        Forward["Forward to"]
        Block["Block sender"]
        Encrypt["Apply message encryption"]
        Moderate["Require approval"]
    end

    ActionsDecision --> Redirect
    ActionsDecision --> Reject
    ActionsDecision --> Quarantine
    ActionsDecision --> AddDisclaimer
    ActionsDecision --> SetHeader
    ActionsDecision --> Forward
    ActionsDecision --> Block
    ActionsDecision --> Encrypt
    ActionsDecision --> Moderate
    Redirect --> Deliver2["Deliver to new recipient"]
    Reject --> NDR["Send NDR"]
    Quarantine --> Q["Quarantine mailbox"]
    AddDisclaimer --> Append["Append text"]
    SetHeader --> Deliver
    Forward --> Deliver2
    Block --> Reject
    Encrypt --> OME["Encrypt message"]
    Moderate --> Moderator["Moderator approval"]
    Append --> Deliver
    OME --> Deliver
    Moderator --> Deliver
```
