import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomeScreen } from "./components/HomeScreen";
import { InputScreen } from "./components/InputScreen";
import { AnalysisScreen } from "./components/AnalysisScreen";
import { WorkflowScreen } from "./components/WorkflowScreen";
import { TestResultScreen } from "./components/TestResultScreen";
import { AutomationDetailScreen } from "./components/AutomationDetailScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomeScreen },
      { path: "input", Component: InputScreen },
      { path: "analysis", Component: AnalysisScreen },
      { path: "workflow", Component: WorkflowScreen },
      { path: "result", Component: TestResultScreen },
      { path: "automations/:id", Component: AutomationDetailScreen },
    ],
  },
]);
