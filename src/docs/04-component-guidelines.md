# React component guidelines

| Category | Location | Responsibility |
|---|---|---|
| UI primitive | src/components/ui | Stateless, reusable presentation |
| Common | src/components/common | Shared application chrome and widgets |
| Form | src/components/forms | Reusable form fields and submission UI |
| Page | src/pages | Route-level data orchestration and composition |
| Layout | src/layouts | Navigation shell and Outlet |

UI primitives must not import Axios, services, or Zustand stores. Feature pages may select state from their domain store and invoke store actions. Keep business rules in services/stores where practical, give asynchronous controls loading and error states, and preserve accessible semantics.

