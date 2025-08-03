# Form Template Builder

A dynamic and intuitive application that allows users to create, manage, and utilize custom form templates. 

**Watch a short demo of the application:** [Demo Video Link](https://youtu.be/U8cjzOTZZjA)

## Key Features

* **Template Management:** Create, save, and manage up to 5 unique form templates.
* **Dynamic Form Builder:** A user-friendly interface to add sections and fields to a template.
* **Multiple Field Types:** Supports Labels (H1, H2, H3), Text, Number, Boolean (Toggle), and Enum (Dropdown) fields.
* **Drag-and-Drop:** Easily reorder fields within a section to customize the layout.
* **Real-time Preview:** Instantly preview the form's appearance as you build it.
* **Data Persistence:** All templates and form submissions are saved directly to the browser's Local Storage.
* **Schema-Driven Rendering:** Both the builder and the final forms are rendered dynamically based on the template's JSON schema.
* **Thoughtful Handling Of Edge Cases :** Robust edge case handling for empty sections, unsaved changes, and invalid field states.

## Tech Stack

* **Framework:** React (Vite)
* **Language:** TypeScript
* **Styling:** Tailwind CSS

## Component Architecture And Logic

The application's component architecture is a highly modular, scalable, and maintainable codebase. Components are categorized into distinct layers based on their specific role and responsibility.

### 1. Presentational UI Components (`src/components/ui/`)

This directory houses a suite of generic, stateless UI components (e.g., `Button`, `Input`, `Card`). Their sole responsibility is to render UI based on the props they receive and emit events via callbacks. They are completely decoupled from the application's business logic and state, which makes them highly reusable and easy to test in isolation.

### 2. Container Components (`src/components/`)

These are the stateful, application-specific components that encapsulate a distinct piece of functionality (e.g., `TemplateBuilder`, `FormFiller`). Their primary responsibilities are:

* **Connecting to State:** They use the `useAppContext` hook to subscribe to the application's central state and access business logic functions.
* **Composing UI:** They assemble multiple presentational components from the `ui/` directory to build a complete feature or view.
* **Managing Logic Flow:** They pass down data and event handlers (callbacks) as props to their children components, orchestrating the flow of information and user interactions for that feature.

### 3. Application Entry Point (`App.tsx`)

`App.tsx` serves as the top-level container for the application. Its role is to handle high-level concerns such as routing and composing the main container components (e.g., `TemplateList`, `TemplateBuilder`) to render the active application view.

This layered architecture ensures that business logic, state management, and presentation are kept separate, which is a best practice for building robust and scalable React applications.

## Validation & Edge Case Handling

The application ensures a robust editing experience through comprehensive validation and state management centralized within the `TemplateBuilder` component. The "Save" button's `disabled` attribute, for example, is directly bound to the `isTemplateValid` constant, which enforces that a template must have a name, at least one section, and one field, with a tooltip guiding the user on these requirements. Edge cases are handled proactively; the logic within the `onAddField` prop automatically creates a new section if a user adds a field to an empty template. Furthermore, to prevent data loss, every function that modifies the template sets an `isDirty` boolean state. The `handleBack` function then checks this flag, triggering a confirmation `AlertDialog` if true, which presents the user with explicit options to save or discard their work, ensuring an intuitive and error-proof workflow.

## Getting Started

Follow these instructions to get the project up and running on your local machine.



### Installation & Setup

1.  **Clone the repository:**
    

2.  **Navigate to the project directory:**
    
    cd [form-template]
    

3.  **Install the dependencies:**
    
    npm install
    

4.  **Run the development server:**
    npm run dev
    

5.  Open your browser and go to `http://localhost:8080/` 

## How to Use the Application

1.  **Create a Template:** On the main screen, click "New Template" to start building.
2.  **Add Sections and Fields:** Give your template a name, add sections, and then add fields (like Text, Number, etc.) to each section from the sidebar.
3.  **Customize and Reorder:** Edit the labels for each field and drag them to reorder them within their section.
4. **Preview :** You can preview the template you have created.
5.  **Save Your Template:** Click Save Template to persist your work to Local Storage.
6.  **Generate a Form:** From the main screen, select a saved template to generate an interactive form.
7.  **Submit Data:** Fill out the generated form and click Submit. The data will be saved to Local Storage.