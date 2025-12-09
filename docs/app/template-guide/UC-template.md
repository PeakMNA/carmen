# Use Cases: {Sub-Module Name}

## Module Information
- **Module**: {Module Name}
- **Sub-Module**: {Sub-Module Name}
- **Route**: {Application Route Path}
- **Version**: 1.0.0
- **Last Updated**: {YYYY-MM-DD}
- **Owner**: {Team/Person Name}
- **Status**: Draft | Review | Approved | Deprecated

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | {YYYY-MM-DD} | {Author} | Initial version |

---

## Overview

{Brief description of the use cases covered in this document and their context within the system.}

**Related Documents**:
- [Business Requirements](./BR-template.md)
- [Technical Specification](./TS-template.md)
- [Data Definition](./DD-template.md)
- [Flow Diagrams](./FD-template.md)
- [Validations](./VAL-template.md)

---

## Actors

### Primary Actors
{Actors who directly interact with the system to achieve goals}

| Actor | Description | Role |
|-------|-------------|------|
| {Actor Name} | {Description of who they are} | {Their role in the system} |
| {Actor Name 2} | {Description} | {Role} |

### Secondary Actors
{Actors who support primary actors but don't directly initiate use cases}

| Actor | Description | Role |
|-------|-------------|------|
| {Actor Name} | {Description} | {Role} |

### System Actors
{External systems, internal modules, or automated services that interact with this sub-module as actors}

**Examples**: Budget Management System, Email Service, Payment Gateway, Notification Service, External APIs

| System | Description | Integration Type |
|--------|-------------|------------------|
| {System Name} | {What it does and how it integrates} | API / Event / Batch / Module |
| {System Name 2} | {Description} | {Type} |

---

## Use Case Diagram

{Create a visual diagram showing actors and their associated use cases. Use ASCII art to show:
- Top section: Primary actors (users) connected to the system
- Middle section: Secondary actors or external interactions
- Bottom section: System actors, integration points, and automated processes}

```
                            ┌─────────────────────────────────┐
                            │     {Sub-Module} System         │
                            └────────────┬────────────────────┘
                                         │
          ┌──────────────────────────────┼──────────────────────────────┐
          │                              │                              │
          │                              │                              │
    ┌─────▼──────┐                 ┌────▼─────┐                  ┌─────▼──────┐
    │  Primary   │                 │ Primary  │                  │ Secondary  │
    │  Actor 1   │                 │ Actor 2  │                  │   Actor    │
    └─────┬──────┘                 └────┬─────┘                  └─────┬──────┘
          │                              │                              │
     [UC-001]                       [UC-004]                       [UC-006]
     [UC-002]                       [UC-005]                      (view only)
     [UC-003]
          │
          │                         ┌────▼─────┐
          │                         │ External │
          │                         │  Actor   │
          └─────────────────────────┤          │
                   [UC-003]         └──────────┘
              (interaction)


    ┌──────────────┐              ┌──────────────┐              ┌──────────────┐
    │   System     │              │  External    │              │  Internal    │
    │ (Automated)  │              │   System     │              │   Module     │
    │              │              │  Integration │              │  Integration │
    └──────┬───────┘              └──────┬───────┘              └──────┬───────┘
           │                             │                             │
      [UC-101]                      [UC-201]                       [UC-202]
      [UC-102]                   (integration)                   (integration)
      [UC-103]
      [UC-301]
    (scheduled)
```

**Legend**:
- **Primary Actors** (top): User roles who directly interact with the system to achieve goals
- **Secondary Actors** (middle): Supporting roles, external actors, or dependent systems
- **System Actors** (bottom): Automated processes, integrations, and scheduled jobs

**Instructions**:
1. Place primary user actors at the top with their use cases
2. Show external interactions in the middle (vendors, customers, external systems)
3. Place system actors at the bottom (automated processes, integrations, background jobs)
4. Use arrows to show relationships
5. Add notes in parentheses for special interactions (e.g., "view only", "scheduled", "integration")

---

## Use Case Summary

{This table provides a quick reference of all use cases, organized by category. Complete this table before writing detailed use cases to ensure proper coverage and organization.}

| ID | Use Case Name | Actor(s) | Priority | Complexity | Category |
|----|---------------|----------|----------|------------|----------|
| **User Use Cases** | | | | | |
| UC-{CODE}-001 | {Use case name} | {Actor} | High/Medium/Low | Simple/Medium/Complex | User |
| UC-{CODE}-002 | {Use case name} | {Actor} | High/Medium/Low | Simple/Medium/Complex | User |
| UC-{CODE}-003 | {Use case name} | {Actor} | High/Medium/Low | Simple/Medium/Complex | User |
| **System Use Cases** | | | | | |
| UC-{CODE}-101 | {Automated process name} | System | High/Medium/Low | Simple/Medium/Complex | System |
| UC-{CODE}-102 | {Automated process name} | System | High/Medium/Low | Simple/Medium/Complex | System |
| **Integration Use Cases** | | | | | |
| UC-{CODE}-201 | {Integration name} | {External System} | High/Medium/Low | Simple/Medium/Complex | Integration |
| UC-{CODE}-202 | {Integration name} | {External System} | High/Medium/Low | Simple/Medium/Complex | Integration |
| **Background Job Use Cases** | | | | | |
| UC-{CODE}-301 | {Scheduled job name} | System (Scheduled Job) | High/Medium/Low | Simple/Medium/Complex | Background |

**Complexity Definitions**:
- **Simple**: Single-step process with minimal logic, 1-3 scenarios, straightforward validation
- **Medium**: Multi-step process with business rules, 4-8 scenarios, moderate validation and integration
- **Complex**: Multi-step process with complex validation, multiple integrations, 9+ scenarios, extensive error handling

**Priority Definitions**:
- **High**: Core functionality required for system operation, high business value, critical user workflows
- **Medium**: Supporting functionality that enhances user experience, important but not blocking
- **Low**: Nice-to-have features, edge case handling, or future enhancements

**Category Definitions**:
- **User**: Interactive workflows initiated by human users
- **System**: Automated processes triggered by system events or conditions
- **Integration**: Interactions with external systems or internal modules
- **Background**: Scheduled jobs or periodic automated tasks

---

## User Use Cases

### UC-{CODE}-001: {Use Case Name}

**Description**: {Brief description of what this use case accomplishes}

**Actor(s)**: {Primary actor(s)}

**Priority**: Critical | High | Medium | Low

**Frequency**: {How often this occurs: Daily, Weekly, Monthly, Ad-hoc}

**Preconditions**:
- {Condition that must be true before use case can start}
- {Another precondition}
- {Another precondition}

**Postconditions**:
- **Success**: {What is true after successful completion}
- **Failure**: {What is true if use case fails}

**Main Flow** (Happy Path):
1. {Actor} {action description}
2. System {validates/processes/displays} {what}
3. {Actor} {provides/selects/confirms} {what}
4. System {saves/calculates/generates} {what}
5. System displays {success message/result}
6. Use case ends

**Alternative Flows**:

**Alt-1A: {Alternative scenario name}** (At step 2)
- 2a. System detects {condition}
- 2b. System displays {error/warning message}
- 2c. {Actor} {corrective action}
- Resume at step 2 or end use case

**Alt-1B: {Another alternative}** (At step 4)
- 4a. {Condition occurs}
- 4b. System {alternative action}
- Continue to step 5

**Exception Flows**:

**Exc-1A: {Exception scenario}** (At any step)
- System detects {error condition}
- System displays {error message}
- System logs error for support
- Use case ends

**Exc-1B: {Validation failure}** (At step 2)
- System validation fails
- System displays validation errors
- Resume at step 1

**Business Rules**:
- **BR-{CODE}-001**: {Business rule that applies}
- **BR-{CODE}-005**: {Another applicable rule}

**Includes**:
- [UC-{CODE}-010: {Included use case}](#uc-code-010-included-use-case)

**Extends**:
- [UC-{CODE}-020: {Extended use case}](#uc-code-020-extended-use-case)

**Related Requirements**:
- FR-{CODE}-001: {Functional requirement}
- NFR-{CODE}-005: {Non-functional requirement}

**UI Mockups**: {Link to mockups if available}

**Notes**:
- {Additional notes or clarifications}
- {Edge cases to consider}

---

### UC-{CODE}-002: {Another Use Case Name}

**Description**: {Brief description}

**Actor(s)**: {Primary actor(s)}

**Priority**: Critical | High | Medium | Low

**Frequency**: {Frequency}

**Preconditions**:
- {Precondition}

**Postconditions**:
- **Success**: {Postcondition}
- **Failure**: {Failure condition}

**Main Flow**:
1. {Step 1}
2. {Step 2}
3. {Step 3}

**Alternative Flows**:
{Alternative scenarios}

**Exception Flows**:
{Exception handling}

**Business Rules**: {Applicable rules}

**Related Requirements**: {Related FR/NFR}

---

## System Use Cases

{System-to-system interactions and automated processes}

### UC-{CODE}-101: {System Use Case Name}

**Description**: {What automated process or integration this represents}

**Trigger**: {What initiates this use case}
- Event: {Event name}
- Schedule: {Cron expression or frequency}
- API Call: {Calling system}

**Actor(s)**:
- **Primary**: {System or service that initiates}
- **Secondary**: {Systems involved in the process}

**Priority**: Critical | High | Medium | Low

**Frequency**: {How often: Real-time, Hourly, Daily, etc.}

**Preconditions**:
- {System state or data required}
- {Service availability required}
- {Authentication/authorization in place}

**Postconditions**:
- **Success**: {Data state after completion}
- **Failure**: {Rollback or compensation actions}

**Main Flow**:
1. System receives {trigger/event}
2. System validates {data/permissions}
3. System retrieves {required data} from {source}
4. System processes/transforms data according to {business rules}
5. System updates {target system/database}
6. System sends {notification/confirmation}
7. System logs {transaction details}
8. Process completes

**Alternative Flows**:

**Alt-101A: Partial Success** (At step 5)
- 5a. Some records succeed, others fail
- 5b. System commits successful records
- 5c. System queues failed records for retry
- 5d. System logs partial completion
- Continue to step 6

**Alt-101B: Retry on Temporary Failure** (At step 5)
- 5a. Temporary failure detected (network, timeout)
- 5b. System waits {backoff period}
- 5c. System retries {max retry count} times
- 5d. If successful, resume at step 6
- 5e. If all retries fail, proceed to exception flow

**Exception Flows**:

**Exc-101A: Data Validation Failure** (At step 2)
- Data fails validation rules
- System logs validation errors
- System sends alert to {monitoring system}
- System queues for manual review
- Process ends

**Exc-101B: System Unavailable** (At step 3 or 5)
- Target system unavailable
- System logs error with context
- System queues for retry
- System sends alert if critical
- Process ends

**Exc-101C: Business Rule Violation** (At step 4)
- Data violates business rules
- System rejects transaction
- System logs rejection reason
- System notifies {stakeholder}
- Process ends

**Data Contract**:

**Input Data Requirements**:
- **field1**: Text field - {Description of field1 purpose and constraints}
- **field2**: Numeric field - {Description of field2 purpose and valid range}
- **field3**: Date field - {Description of field3 purpose and format requirements}
- {Additional fields as needed}

**Validation Rules**:
- field1 must be {validation requirements}
- field2 must be {validation requirements}
- field3 must be {validation requirements}

**Output Data Structure**:
- **status**: Processing result indicator
  - Values: 'success' (all processed), 'partial' (some failed), 'failure' (all failed)
  - Required: Yes
- **processedCount**: Number of successfully processed items
  - Type: Integer
  - Required: Yes
- **failedCount**: Number of failed items
  - Type: Integer
  - Required: Yes
- **errors**: List of error details (only present when failures occur)
  - Contains: Error code, message, affected item identifier
  - Required: Only when failures occur
- **transactionId**: Unique identifier for this processing transaction
  - Format: UUID or system-generated ID
  - Required: Yes

**Business Rules**:
- **BR-{CODE}-050**: {Rule that governs this process}
- **BR-{CODE}-051**: {Another rule}

**SLA**:
- **Processing Time**: {Max time for completion}
- **Availability**: {Required uptime percentage}
- **Recovery Time**: {Max time to recover from failure}

**Monitoring**:
- Success rate metric
- Processing time metric
- Error count and types
- Queue depth (if applicable)

**Rollback Procedure**:
{Steps to rollback if process fails or produces incorrect results}

**Related Requirements**:
- TR-{CODE}-010: {Technical requirement}
- NFR-{CODE}-015: {Performance/reliability requirement}

---

### UC-{CODE}-102: {Scheduled System Process}

**Description**: {Automated scheduled task description}

**Trigger**:
- **Schedule**: {Cron: 0 2 * * * (Daily at 2 AM)}
- **Manual Trigger**: {Can be triggered manually by {actor}}

**Actor(s)**:
- **Primary**: System Scheduler
- **Secondary**: {Other systems involved}

**Priority**: Critical | High | Medium | Low

**Frequency**: {Schedule frequency}

**Preconditions**:
- {System conditions}

**Postconditions**:
- **Success**: {Outcome}
- **Failure**: {Failure handling}

**Main Flow**:
1. Scheduler triggers process at {scheduled time}
2. System acquires {lock/semaphore} to prevent concurrent execution
3. System retrieves {data to process}
4. For each {item}:
   - 4a. System processes {item}
   - 4b. System updates {status}
5. System releases {lock/semaphore}
6. System generates {summary report}
7. System sends {notification} to {stakeholders}
8. Process completes

**Alternative Flows**:
{Alternatives}

**Exception Flows**:
{Exceptions}

**Concurrency Control**:
- {How to prevent duplicate execution}
- {Lock mechanism used}

**Failure Recovery**:
- {What happens if process crashes mid-execution}
- {How to resume or restart}

**Idempotency**:
- {Is the process idempotent?}
- {How is idempotency ensured?}

---

### UC-{CODE}-103: {Event-Driven System Process}

**Description**: {Process triggered by domain events}

**Trigger**:
- **Event**: {EventName}
- **Source**: {System or module that publishes event}
- **Channel**: {Message queue, webhook, etc.}

**Actor(s)**:
- **Primary**: Event Publisher System
- **Secondary**: {This system as event consumer}

**Priority**: Critical | High | Medium | Low

**Frequency**: Real-time (event-driven)

**Preconditions**:
- Event subscription active
- {Other conditions}

**Postconditions**:
- **Success**: Event processed, actions completed
- **Failure**: Event marked for retry or dead letter queue

**Main Flow**:
1. System receives event {EventName} from {source}
2. System validates event schema and signature
3. System checks for duplicate (idempotency check)
4. System processes event:
   - 4a. Extracts relevant data
   - 4b. Applies business logic
   - 4c. Updates affected entities
5. System acknowledges event
6. System publishes resultant events (if any)
7. Process completes

**Alternative Flows**:

**Alt-103A: Duplicate Event** (At step 3)
- 3a. Event already processed (duplicate detected)
- 3b. System logs duplicate detection
- 3c. System acknowledges event without processing
- Process ends

**Exception Flows**:

**Exc-103A: Invalid Event** (At step 2)
- Event fails validation
- System logs validation error
- System sends to dead letter queue
- System alerts monitoring
- Process ends

**Exc-103B: Processing Failure** (At step 4)
- Processing fails due to {reason}
- System does NOT acknowledge event
- Event returns to queue for retry
- Retry with exponential backoff
- After max retries, move to dead letter queue

**Event Schema**:

**Standard Event Fields**:
- **eventId**: Unique identifier for this event occurrence
  - Format: UUID
  - Required: Yes
  - Purpose: Idempotency and event tracking
- **eventType**: Type of event being published
  - Value: '{EventType}'
  - Required: Yes
  - Purpose: Event routing and filtering
- **timestamp**: When the event occurred
  - Format: ISO 8601 date-time (UTC)
  - Required: Yes
  - Purpose: Event ordering and auditing
- **version**: Schema version for this event type
  - Format: Semantic version (e.g., "1.0.0")
  - Required: Yes
  - Purpose: Schema evolution and compatibility
- **source**: System or service that published the event
  - Format: System identifier string
  - Required: Yes
  - Purpose: Event tracing and debugging

**Event-Specific Data**:
{Define the business data specific to this event type}
- **field1**: {Description, type, required/optional}
- **field2**: {Description, type, required/optional}

**Optional Metadata Fields**:
- **correlationId**: Links related events across system boundaries
  - Format: UUID
  - Required: No
  - Purpose: Distributed tracing
- **causationId**: ID of the event/command that caused this event
  - Format: UUID
  - Required: No
  - Purpose: Event causality tracking
- **userId**: User who triggered the action that caused this event
  - Format: UUID
  - Required: No
  - Purpose: User activity auditing

**Idempotency Strategy**:
- {How duplicate events are detected and handled}
- {Idempotency key used}

**Retry Policy**:
- Max retries: {number}
- Backoff: {exponential/linear}
- Retry intervals: {1s, 5s, 30s, 5m, 30m}

**Dead Letter Queue**:
- Events moved to DLQ after {max retries}
- DLQ monitoring and alerting
- Manual intervention process

---

## Integration Use Cases

{Use cases that involve integration with external systems}

### UC-{CODE}-201: {External System Integration}

**Description**: {What this integration accomplishes}

**Actor(s)**:
- **Primary**: {This system}
- **External System**: {External system name and purpose}

**Trigger**: {What initiates the integration}

**Integration Type**:
- [ ] REST API
- [ ] SOAP API
- [ ] Message Queue
- [ ] File Transfer
- [ ] Database Link
- [ ] Webhook

**Direction**:
- [ ] Outbound (We call external system)
- [ ] Inbound (External system calls us)
- [ ] Bidirectional

**Priority**: Critical | High | Medium | Low

**Frequency**: {Real-time / Batch / Scheduled}

**Preconditions**:
- Integration credentials configured
- {External system available}
- {Network connectivity established}

**Postconditions**:
- **Success**: Data synchronized successfully
- **Failure**: Error logged and alerting triggered

**Main Flow** (Outbound Example):
1. System prepares data according to {external system contract}
2. System authenticates with {external system}
3. System sends request to {endpoint}
4. External system processes request
5. External system responds with {result}
6. System validates response
7. System updates local data based on response
8. System logs transaction
9. Process completes

**Alternative Flows**:
{Alternatives}

**Exception Flows**:

**Exc-201A: Authentication Failure** (At step 2)
- Authentication fails
- System logs auth error
- System retries with token refresh
- If retry fails, alert administrator
- Process ends

**Exc-201B: External System Error** (At step 4-5)
- External system returns error
- System logs error details
- System determines if retriable
- If retriable, queue for retry
- If not retriable, alert and manual intervention
- Process ends

**API Contract**:

**Request**:
```json
{
  "endpoint": "POST /api/v1/resource",
  "headers": {
    "Authorization": "Bearer {token}",
    "Content-Type": "application/json"
  },
  "body": {
    "field1": "value",
    "field2": 123
  }
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "id": "external-id",
    "result": "processed"
  }
}
```

**Error Handling**:
- 4xx errors: {How to handle client errors}
- 5xx errors: {How to handle server errors}
- Timeout: {Timeout value and handling}
- Network errors: {Retry strategy}

**Data Mapping**:

| Internal Field | External Field | Transformation |
|----------------|----------------|----------------|
| {field1} | {externalField1} | {mapping rule} |
| {field2} | {externalField2} | {mapping rule} |

**Monitoring**:
- Success rate
- Response time
- Error types and frequency
- Data volume

**Fallback Strategy**:
{What to do if integration is unavailable for extended period}

---

## Background Job Use Cases

{Asynchronous processes and background jobs}

### UC-{CODE}-301: {Background Job Name}

**Description**: {What this job does}

**Trigger**:
- User action: {Specific action}
- Queue: {Queue name}
- Delay: {Processing delay if any}

**Priority**: Critical | High | Medium | Low

**Concurrency**: {How many can run simultaneously}

**Timeout**: {Max execution time}

**Retry Policy**:
- Max attempts: {number}
- Backoff: {strategy}

**Main Flow**:
1. Job receives {parameters}
2. Job validates {input}
3. Job acquires {resources}
4. Job processes {task}:
   - 4a. {Substep}
   - 4b. {Substep}
   - 4c. {Substep}
5. Job releases {resources}
6. Job reports {completion status}
7. Job ends

**Exception Flows**:

**Exc-301A: Timeout** (At any step)
- Job exceeds timeout
- Job gracefully terminates
- Partial work rolled back
- Job marked for retry
- Job ends

**Exc-301B: Resource Unavailable** (At step 3)
- Required resource unavailable
- Job waits {timeout} for resource
- If resource still unavailable, job fails
- Job queued for retry
- Job ends

**Progress Tracking**:
{How job progress is tracked and reported to user}

**Cancellation**:
{Can job be cancelled? How?}

---

## Traceability Matrices

{Comprehensive traceability linking use cases to requirements, validations, tests, and implementation artifacts.}

### Use Case to Requirements Traceability Diagram

{Create a Mermaid diagram showing relationships between use cases and functional requirements.}

```mermaid
flowchart LR
    subgraph UC[Use Cases]
        UC001([UC-{CODE}-001])
        UC002([UC-{CODE}-002])
        UC003([UC-{CODE}-003])
        UC101([UC-{CODE}-101])
        UC201([UC-{CODE}-201])
    end

    subgraph FR[Functional Requirements]
        FR001[FR-{CODE}-001]
        FR002[FR-{CODE}-002]
        FR003[FR-{CODE}-003]
        FR004[FR-{CODE}-004]
    end

    UC001 --> FR001
    UC002 --> FR002
    UC003 --> FR003
    UC101 --> FR003
    UC101 --> FR004
    UC201 --> FR004

    style UC fill:#e8f5e9
    style FR fill:#e3f2fd
```

### Master Traceability Matrix

{Complete cross-reference table linking all artifacts.}

| Use Case ID | Use Case Name | Functional Req | Business Rules | Validation Rules | Test Cases | UI Components | Status |
|-------------|---------------|----------------|----------------|------------------|------------|---------------|--------|
| UC-{CODE}-001 | {Use Case Name} | FR-{CODE}-001 | BR-{CODE}-001, BR-{CODE}-002 | VR-{CODE}-001, VR-{CODE}-002 | TC-{CODE}-001-01 to TC-{CODE}-001-NN | {ComponentName} | To Implement / In Progress / Implemented |
| UC-{CODE}-002 | {Use Case Name} | FR-{CODE}-002 | BR-{CODE}-003 | VR-{CODE}-003 | TC-{CODE}-002-01 to TC-{CODE}-002-NN | {ComponentName} | {Status} |
| UC-{CODE}-003 | {Use Case Name} | FR-{CODE}-003 | BR-{CODE}-004, BR-{CODE}-005 | - | TC-{CODE}-003-01 to TC-{CODE}-003-NN | {ComponentName} | {Status} |
| UC-{CODE}-101 | {System UC Name} | Integration | BR-{CODE}-010 | - | TC-{CODE}-101-01 to TC-{CODE}-101-NN | {ServiceName} | {Status} |
| UC-{CODE}-201 | {Integration UC} | Integration | - | - | TC-{CODE}-201-01 to TC-{CODE}-201-NN | {IntegrationService} | {Status} |

### Business Rules Traceability

{Map business rules to use cases, validation rules, and enforcement points.}

| Business Rule | Description | Use Cases | Validation Rule | Enforcement |
|---------------|-------------|-----------|-----------------|-------------|
| BR-{CODE}-001 | {Brief description of the rule} | UC-{CODE}-001, UC-{CODE}-002 | VR-{CODE}-001 | Server-side |
| BR-{CODE}-002 | {Brief description} | UC-{CODE}-001 | VR-{CODE}-002 | Client + Server |
| BR-{CODE}-003 | {Brief description} | UC-{CODE}-002, UC-{CODE}-003 | VR-{CODE}-003 | Client + Server |
| BR-{CODE}-004 | {Brief description} | UC-{CODE}-003 | - | Server-side |
| BR-{CODE}-005 | {Brief description} | UC-{CODE}-003 | VR-{CODE}-004 | Client + Server |
| BR-{CODE}-010 | {Brief description} | UC-{CODE}-101 | - | Server-side |

**Enforcement Legend**:
- **Client-side**: Validated in browser before submission (immediate feedback)
- **Server-side**: Validated on server (authoritative check)
- **Client + Server**: Validated in both places (UX + security)

### Validation Rules Traceability

{Map validation rules to fields, use cases, and error messages.}

| Validation Rule | Field | Use Cases | Business Rule | Error Message | Enforcement |
|-----------------|-------|-----------|---------------|---------------|-------------|
| VR-{CODE}-001 | {fieldName} | UC-{CODE}-001, UC-{CODE}-002 | BR-{CODE}-001 | {Error message text} | Client + Server |
| VR-{CODE}-002 | {fieldName} | UC-{CODE}-001 | BR-{CODE}-002 | {Error message text} | Client + Server |
| VR-{CODE}-003 | {fieldName} | UC-{CODE}-002 | BR-{CODE}-003 | {Error message text} | Client + Server |
| VR-{CODE}-004 | {fieldName} | UC-{CODE}-003 | BR-{CODE}-005 | {Error message text} | Server |
| VR-{CODE}-005 | {fieldName} | UC-{CODE}-001, UC-{CODE}-002, UC-{CODE}-003 | BR-{CODE}-002 | System-generated | Server |

### Document Cross-Reference Matrix

{Link all related documentation files.}

| Document | Type | Related Use Cases | Purpose |
|----------|------|-------------------|---------|
| BR-{submodule}.md | Business Requirements | All | Business rules, functional requirements, user stories |
| DD-{submodule}.md | Data Definition | All | Database schema, entity definitions |
| TS-{submodule}.md | Technical Spec | All | Architecture, component design |
| FD-{submodule}.md | Flow Diagrams | All | Visual workflows, state diagrams |
| VAL-{submodule}.md | Validation Rules | UC-{CODE}-001, UC-{CODE}-002, etc. | Field validations, error messages |
| BE-{submodule}.md | Backend Requirements | All | Server actions, API contracts |
| UC-{submodule}.md | Use Cases | - | Actor interactions, scenarios (this document) |

### Test Case Coverage Matrix

{Track test coverage by use case and test type.}

| Use Case | Unit Tests | Integration Tests | E2E Tests | Total Tests |
|----------|------------|-------------------|-----------|-------------|
| UC-{CODE}-001 | {n} | {n} | {n} | {total} |
| UC-{CODE}-002 | {n} | {n} | {n} | {total} |
| UC-{CODE}-003 | {n} | {n} | {n} | {total} |
| UC-{CODE}-101 | {n} | {n} | {n} | {total} |
| UC-{CODE}-201 | {n} | {n} | {n} | {total} |
| **Total** | **{sum}** | **{sum}** | **{sum}** | **{grand total}** |

**Test Type Definitions**:
- **Unit Tests**: Isolated component/function tests
- **Integration Tests**: Tests involving multiple components or services
- **E2E Tests**: Full user workflow tests in browser

### Implementation Status Summary

{High-level tracking of implementation progress.}

| Category | Total | Implemented | In Progress | Planned | Deferred |
|----------|-------|-------------|-------------|---------|----------|
| Use Cases | {n} | {n} | {n} | {n} | {n} |
| Functional Requirements | {n} | {n} | {n} | {n} | {n} |
| Business Rules | {n} | {n} | {n} | {n} | {n} |
| Validation Rules | {n} | {n} | {n} | {n} | {n} |
| Test Cases | {n} | {n} | {n} | {n} | {n} |

**Status Definitions**:
- **Implemented**: Feature complete and tested
- **In Progress**: Currently being developed
- **Planned**: Scheduled for current release
- **Deferred**: Moved to future phase or release

---

## Appendix

### Glossary
- **Actor**: {Definition}
- **Use Case**: {Definition}
- **Precondition**: {Definition}
- **Postcondition**: {Definition}

### Common Patterns

**Pattern: Form Submission**
1. User fills form
2. User clicks submit
3. System validates (client-side)
4. System submits to server
5. Server validates
6. Server processes
7. Server responds
8. System displays result

**Pattern: List with Pagination**
1. User navigates to list
2. System loads page 1
3. System displays items
4. User clicks next page
5. System loads page 2
6. System displays items

**Pattern: Search and Filter**
1. User enters search criteria
2. System applies filters
3. System queries data
4. System displays results
5. User refines search
6. System updates results

---

**Document End**

> 📝 **Note to Authors**:
> - Each use case should be atomic and focused
> - Use consistent terminology with BR documents
> - Include both happy path and error scenarios
> - Link to related requirements
> - Update traceability matrix
> - Review with stakeholders before finalizing
