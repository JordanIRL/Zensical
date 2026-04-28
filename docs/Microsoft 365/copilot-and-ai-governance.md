# Copilot and AI Governance

Copilot and AI governance diagrams for Microsoft 365 admins. This file contains 6 topics covering data protection, readiness, oversharing remediation, audit, eDiscovery, agent governance and interaction controls.

## Contents

- [Copilot Agent and Connector Governance](#copilot-agent-and-connector-governance)
- [Copilot Audit and eDiscovery](#copilot-audit-and-ediscovery)
- [Copilot Interaction Data Controls](#copilot-interaction-data-controls)
- [Copilot Oversharing Remediation](#copilot-oversharing-remediation)
- [Microsoft 365 Copilot Data Protection Architecture](#microsoft-365-copilot-data-protection-architecture)
- [Secure Copilot Readiness](#secure-copilot-readiness)

---

## Copilot Agent and Connector Governance

Govern Copilot agents and connectors by controlling creation, consent, data source scope, ownership, monitoring and retirement.

```mermaid
flowchart TB
    COPAG_Request["Agent or connector request"] --> COPAG_Intake["Intake review<br/>business owner and purpose"]
    COPAG_Intake --> COPAG_Source["Data source inventory<br/>permissions and sensitivity"]
    COPAG_Source --> COPAG_Identity["App registration<br/>managed identity or connector identity"]
    COPAG_Identity --> COPAG_Consent{"Admin consent<br/>and least privilege approved?"}
    COPAG_Consent -->|"No"| COPAG_Rework["Reduce scopes<br/>or reject request"]
    COPAG_Consent -->|"Yes"| COPAG_Publish["Publish to approved users<br/>with lifecycle owner"]
    COPAG_Publish --> COPAG_Monitor["Monitor audit logs<br/>usage and data access"]
    COPAG_Monitor --> COPAG_Review["Periodic access<br/>ownership and connector review"]
    COPAG_Review --> COPAG_Retire{"Still needed?"}
    COPAG_Retire -->|"Yes"| COPAG_Monitor
    COPAG_Retire -->|"No"| COPAG_Remove["Disable connector<br/>remove consent and archive evidence"]
```

---

## Copilot Audit and eDiscovery

Copilot prompts, responses and referenced content can become compliance evidence. This flow shows the audit and eDiscovery handling path.

```mermaid
flowchart TB
    COPAE_Activity["Copilot activity<br/>prompts responses and references"] --> COPAE_Audit["Microsoft Purview Audit"]
    COPAE_Audit --> COPAE_Search["Audit search<br/>or Graph audit search API"]
    COPAE_Activity --> COPAE_Interaction["Copilot interaction data"]
    COPAE_Interaction --> COPAE_Retention{"Retention or legal hold?"}
    COPAE_Retention -->|"Yes"| COPAE_Preserve["Preserve according to policy"]
    COPAE_Retention -->|"No"| COPAE_Default["Default lifecycle applies"]
    COPAE_Preserve --> COPAE_eDiscovery["eDiscovery case<br/>search review export"]
    COPAE_Search --> COPAE_eDiscovery
    COPAE_eDiscovery --> COPAE_Report["Investigation report<br/>and regulator response"]
    COPAE_Default --> COPAE_Monitor["Ongoing monitoring"]
```

---

## Copilot Interaction Data Controls

Use this model to decide how Copilot interaction data is monitored, retained, investigated and remediated in Microsoft Purview.

```mermaid
flowchart TB
    COPID_Interaction["Copilot interaction data"] --> COPID_Classify{"Control objective"}
    COPID_Classify -->|"Security monitoring"| COPID_Audit["Audit records<br/>activity explorer and alerts"]
    COPID_Classify -->|"Legal or regulatory"| COPID_Retention["Retention policy<br/>hold and eDiscovery"]
    COPID_Classify -->|"Data loss risk"| COPID_DLP["DLP for prompts<br/>responses and grounding"]
    COPID_Classify -->|"Insider risk"| COPID_IRM["Insider Risk Management<br/>policy indicators"]
    COPID_Audit --> COPID_Case["Investigation case"]
    COPID_Retention --> COPID_Case
    COPID_DLP --> COPID_Case
    COPID_IRM --> COPID_Case
    COPID_Case --> COPID_Action["Remediate access<br/>labels policy or user risk"]
    COPID_Action --> COPID_Evidence["Record evidence<br/>and update governance"]
```

---

## Copilot Oversharing Remediation

This diagram maps a practical oversharing response from discovery through temporary controls, site-owner remediation and validation.

```mermaid
flowchart TB
    COPOR_Detect["Detect risk<br/>DSPM SAM reports and audit"] --> COPOR_Triage{"Risk type"}
    COPOR_Triage -->|"Broad audience"| COPOR_Broad["Everyone except external users<br/>anonymous or organisation links"]
    COPOR_Triage -->|"Sensitive data"| COPOR_Sensitive["Sensitive files<br/>missing labels or exposed sites"]
    COPOR_Triage -->|"No owner"| COPOR_Owner["Ownerless inactive<br/>or unmanaged site"]
    COPOR_Broad --> COPOR_Temporary["Apply temporary controls<br/>RCD RSS or DLP for Copilot"]
    COPOR_Sensitive --> COPOR_Temporary
    COPOR_Owner --> COPOR_Temporary
    COPOR_Temporary --> COPOR_Review["Initiate site access review"]
    COPOR_Review --> COPOR_Fix["Remove excess access<br/>repair inheritance and links"]
    COPOR_Fix --> COPOR_Label["Apply site and file labels<br/>plus lifecycle policy"]
    COPOR_Label --> COPOR_Validate["Validate search Copilot<br/>audit and access results"]
    COPOR_Validate --> COPOR_Remove["Remove temporary controls<br/>when durable controls are working"]
```

### Notes

- Restricted SharePoint Search is a temporary measure and is not a security boundary.

---

## Microsoft 365 Copilot Data Protection Architecture

This diagram shows how Microsoft 365 Copilot grounds responses while honouring Microsoft 365 permissions, sensitivity labels, encryption and Purview compliance controls.

```mermaid
flowchart TB
    COPDP_User["User prompt"] --> COPDP_Copilot["Microsoft 365 Copilot<br/>or Copilot Chat"]
    COPDP_Copilot --> COPDP_Graph["Microsoft Graph<br/>and tenant data access"]
    COPDP_Graph --> COPDP_Permissions{"User has access?"}
    COPDP_Permissions -->|"No"| COPDP_Block["Content is not returned"]
    COPDP_Permissions -->|"Yes"| COPDP_Label{"Sensitivity label<br/>or encryption?"}
    COPDP_Label -->|"Requires rights"| COPDP_Rights["Check view and extract rights"]
    COPDP_Label -->|"No additional restriction"| COPDP_Ground["Ground response with allowed data"]
    COPDP_Rights -->|"Allowed"| COPDP_Ground
    COPDP_Rights -->|"Blocked"| COPDP_Block
    COPDP_Ground --> COPDP_Response["Generated response"]
    COPDP_Response --> COPDP_Audit["Purview audit<br/>eDiscovery and retention"]
    COPDP_Block --> COPDP_Audit
```

### Notes

- Copilot does not grant new access to content. It can only use content the user is already authorised to access.

---

## Secure Copilot Readiness

Use this readiness flow to prepare identity, data, access and compliance controls before enabling Microsoft 365 Copilot broadly.

```mermaid
flowchart TB
    COPRD_Start["Copilot readiness programme"] --> COPRD_Licence["Confirm licences<br/>roles and admin ownership"]
    COPRD_Licence --> COPRD_Identity["Baseline identity controls<br/>MFA CA and device trust"]
    COPRD_Identity --> COPRD_Data["Assess SharePoint OneDrive<br/>Exchange and Teams data"]
    COPRD_Data --> COPRD_Overshare["Find overshared<br/>ownerless or inactive content"]
    COPRD_Overshare --> COPRD_Labels["Apply sensitivity labels<br/>retention and DLP"]
    COPRD_Labels --> COPRD_SAM["Use SharePoint Advanced Management<br/>for access and lifecycle controls"]
    COPRD_SAM --> COPRD_Audit["Enable audit eDiscovery<br/>and monitoring procedures"]
    COPRD_Audit --> COPRD_Pilot["Pilot with measured users"]
    COPRD_Pilot --> COPRD_Expand["Expand with governance cadence"]
```

### Notes

- Treat readiness as a continuous governance loop. Copilot quality and exposure risk change when permissions and content change.
