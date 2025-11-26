# Agent Framework Guide

## Overview

This directory contains a comprehensive **DevOps Agent Framework** that covers the complete software development lifecycle from Product Owner specification to production deployment and monitoring.

The framework consists of **20 specialized AI agents** organized into a multi-stage pipeline that ensures quality, security, performance, and maintainability throughout the development process.

---

## Agent Catalog

### 📋 Specification & Planning
| Agent | File | Purpose |
|-------|------|---------|
| **Product Owner** | `product-owner-agent.md` | Transform ideas into user stories, acceptance criteria, and priorities |

### 🏗️ Architecture & Design
| Agent | File | Purpose |
|-------|------|---------|
| **Architect** | `architect-agent.md` | Design technical approach, ensure maintainability and scalability |
| **UX Agent** | `ux-agent.md` | Design user flows, interaction patterns, and usability |
| **UI Designer** | `ui-designer-agent.md` | Create visual design, design systems, and modern aesthetics |

### 💻 Implementation
| Agent | File | Purpose |
|-------|------|---------|
| **Senior Developer** | `senior-dev-agent.md` | Implement features, fixes, and refactorings |
| **Code Review** | `code-review-agent.md` | Review code quality, best practices, and maintainability |

### 🧪 Testing
| Agent | File | Purpose |
|-------|------|---------|
| **Unit Test** | `unit-test-agent.md` | Design unit tests for isolated components |
| **Integration Test** | `integration-test-agent.md` | Test component interactions and data flow |
| **Test (E2E)** | `test-agent.md` | End-to-end and functional testing, acceptance validation |

### 🔒 Quality Gates
| Agent | File | Purpose |
|-------|------|---------|
| **Security** | `security-agent.md` | Identify security vulnerabilities and mitigations |
| **Performance** | `performance-agent.md` | Validate performance and identify optimizations |
| **Accessibility** | `accessibility-agent.md` | Ensure WCAG compliance and a11y best practices |

### 📚 Documentation
| Agent | File | Purpose |
|-------|------|---------|
| **Docs** | `docs-agent.md` | Update README, CHANGELOG, and documentation |

### 🚀 Release & Deployment
| Agent | File | Purpose |
|-------|------|---------|
| **Release Manager** | `release-manager-agent.md` | Manage versioning, release notes, and release planning |
| **Deployment** | `deployment-agent.md` | Create deployment plans and CI/CD configurations |
| **Monitoring** | `monitoring-agent.md` | Define monitoring, logging, and alerting strategies |

### 🎯 Orchestration
| Agent | File | Purpose |
|-------|------|---------|
| **Dev Pipeline** | `dev-pipeline-agent.md` | Orchestrate the full SDLC pipeline |
| **Meta Review** | `meta-review-agent.md` | Aggregate findings and create prioritized action plans |

---

## Pipeline Configurations

### Simple Pipeline
**File**: `agent-ci-pipeline.yaml`

A streamlined 6-stage pipeline suitable for smaller changes:
1. Specification
2. Architecture
3. Experience Design
4. Implementation
5. Quality Gates (parallel)
6. Documentation

### Full DevOps Pipeline
**File**: `full-devops-pipeline.yaml`

A comprehensive 14-stage pipeline covering the complete DevOps lifecycle:
1. Specification
2. Architecture
3. Experience Design
4. Implementation
5. Code Review
6. Unit Testing
7. Integration Testing
8. End-to-End Testing
9. Quality Gates (Security, Performance, Accessibility)
10. Documentation
11. Release Preparation
12. Deployment Planning
13. Monitoring Setup
14. Meta Review & Aggregation

---

## How to Use the Framework

### Option 1: Use the Dev Pipeline Agent

The easiest way to invoke the full pipeline is through the `dev-pipeline-agent`:

```
@dev-pipeline-agent

### Task
- Type: feature
- Description: Add image zoom functionality on double-tap

### Acceptance Criteria
- User can double-tap image to zoom in
- Pinch gestures work for zoom control
- Zoom state resets on image navigation
```

The Dev Pipeline Agent will automatically orchestrate all other agents in the correct order.

### Option 2: Use the Prompt Template

Use the `Prompt.txt` template for a structured approach:

1. Open `Prompt.txt`
2. Fill in your task details
3. Copy and paste into your AI assistant
4. The template will guide the pipeline execution

### Option 3: Invoke Individual Agents

For specific needs, you can invoke individual agents:

```
@architect-agent
Please review the current gallery architecture and suggest improvements for better modularity.
```

```
@security-agent
Review the image loading and audio playback code for potential security vulnerabilities.
```

---

## Pipeline Stages Explained

### 1️⃣ Specification
**Agents**: Product Owner

**Purpose**: Transform raw ideas into structured requirements with user stories, acceptance criteria, edge cases, and priorities.

**Output**: Feature specification ready for development

---

### 2️⃣ Architecture
**Agents**: Architect

**Purpose**: Design or validate the technical approach, ensure compatibility with existing architecture, and plan for scalability.

**Output**: Architecture design, refactoring recommendations

---

### 3️⃣ Experience Design
**Agents**: UX Agent, UI Designer

**Purpose**: Design user flows, interaction patterns, and visual aesthetics. Ensure mobile-first, responsive design.

**Output**: User flows, interaction patterns, design system updates

---

### 4️⃣ Implementation
**Agents**: Senior Developer

**Purpose**: Write clean, maintainable code following architecture and design guidelines.

**Output**: Code changes, implementation notes

---

### 5️⃣ Code Review
**Agents**: Code Review Agent

**Purpose**: Review code quality, adherence to best practices, and identify issues before testing.

**Output**: Code review report with prioritized findings

---

### 6️⃣ Testing (Unit → Integration → E2E)
**Agents**: Unit Test Agent, Integration Test Agent, Test Agent

**Purpose**: Comprehensive testing at all levels from isolated units to complete user workflows.

**Output**: Test plans, test results, coverage analysis

---

### 7️⃣ Quality Gates
**Agents**: Security, Performance, Accessibility (parallel)

**Purpose**: Validate non-functional requirements: security, performance, and accessibility.

**Output**: Security report, performance analysis, a11y compliance report

---

### 8️⃣ Documentation
**Agents**: Docs Agent

**Purpose**: Update all documentation to reflect changes.

**Output**: Updated README, CHANGELOG, API docs

---

### 9️⃣ Release Preparation
**Agents**: Release Manager

**Purpose**: Determine version number, generate release notes, validate release readiness.

**Output**: Version number, release notes, changelog

---

### 🔟 Deployment Planning
**Agents**: Deployment Agent

**Purpose**: Create deployment plan, generate CI/CD configs, define rollback strategy.

**Output**: Deployment plan, CI/CD configurations

---

### 1️⃣1️⃣ Monitoring Setup
**Agents**: Monitoring Agent

**Purpose**: Define monitoring, logging, alerting, and observability strategy.

**Output**: Monitoring plan, alerting rules, dashboard configs

---

### 1️⃣2️⃣ Meta Review
**Agents**: Meta Review Agent

**Purpose**: Aggregate all findings, deduplicate, prioritize, and create actionable plan.

**Output**: Consolidated report, prioritized action plan

---

## Customizing the Pipeline

### Skip Optional Stages

Some stages are optional and can be skipped:
- **Experience Design**: Skip if no UX/UI changes
- **Code Review**: Skip for documentation-only changes
- **Release/Deployment**: Skip for development-only work

### Parallel Execution

These stages can run in parallel for efficiency:
- **Quality Gates**: Security, Performance, Accessibility
- **Testing**: Unit, Integration (if independent)
- **Experience Design**: UX and UI

### Fail-Fast vs. Continue-on-Warning

**Fail-Fast** (default): Stop pipeline if critical issues found
**Continue-on-Warning**: Collect all findings, then decide

Configure in pipeline YAML:
```yaml
config:
  fail_fast: true
  continue_on_warning: true
```

---

## Best Practices

### 1. Start with Specification
Always begin with the Product Owner agent to clarify requirements before jumping into implementation.

### 2. Don't Skip Architecture
Even for small changes, validate with the Architect agent to avoid technical debt.

### 3. Test at All Levels
- **Unit tests**: Fast, isolated, high coverage
- **Integration tests**: Component interactions
- **E2E tests**: Complete user workflows

### 4. Run Quality Gates in Parallel
Security, Performance, and Accessibility can run simultaneously to save time.

### 5. Document as You Go
Update documentation during development, not as an afterthought.

### 6. Use Meta Review for Final Decision
Let the Meta Review agent aggregate all findings and create a prioritized action plan.

---

## Example Workflows

### Feature Development
```
1. Product Owner → Define feature
2. Architect → Design approach
3. UX/UI → Design experience
4. Senior Dev → Implement
5. Code Review → Review quality
6. Unit/Integration/E2E → Test
7. Security/Perf/A11y → Validate
8. Docs → Update documentation
9. Release Manager → Plan release
10. Meta Review → Final approval
```

### Bug Fix
```
1. Product Owner → Clarify bug and acceptance criteria
2. Senior Dev → Implement fix
3. Code Review → Review changes
4. Test Agent → Regression testing
5. Docs → Update changelog
6. Meta Review → Approve fix
```

### Refactoring
```
1. Architect → Design refactoring approach
2. Senior Dev → Implement refactoring
3. Code Review → Review changes
4. Unit/Integration → Validate no regressions
5. Performance → Validate improvements
6. Docs → Update architecture docs
7. Meta Review → Approve refactoring
```

### Documentation Update
```
1. Docs Agent → Update documentation
2. Meta Review → Validate completeness
```

---

## Troubleshooting

### Pipeline Takes Too Long
- Skip optional stages (UX/UI if no design changes)
- Run quality gates in parallel
- Use simple pipeline for small changes

### Too Many Findings
- Use Meta Review to prioritize
- Focus on blockers and high-priority items first
- Create follow-up tasks for lower-priority items

### Conflicting Recommendations
- Meta Review agent will deduplicate and reconcile
- Architect agent has final say on technical decisions
- Product Owner has final say on requirements

---

## Contributing New Agents

To add a new agent to the framework:

1. **Create agent file**: `agents/new-agent.md`
2. **Follow the template**:
   - Role
   - Responsibilities
   - Capabilities
   - Expected Input
   - Expected Output
   - Guidance & Persona
3. **Update pipeline**: Add to `full-devops-pipeline.yaml`
4. **Update orchestrators**: Add to `dev-pipeline-agent.md` and `meta-review-agent.md`
5. **Update this guide**: Add to agent catalog and workflows

---

## Support

For questions or issues with the agent framework:
1. Review this guide
2. Check individual agent files for detailed documentation
3. Review `Prompt.txt` for usage examples
4. Consult `full-devops-pipeline.yaml` for pipeline configuration

---

**Version**: 2.0  
**Last Updated**: 2025-11-26  
**Agents**: 20  
**Pipeline Stages**: 14
