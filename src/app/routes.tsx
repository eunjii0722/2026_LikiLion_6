import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomeScreen } from "./components/HomeScreen";
import { InputScreen } from "./components/InputScreen";
import { AnalysisScreen } from "./components/AnalysisScreen";
import { WorkflowScreen } from "./components/WorkflowScreen";
import { TestResultScreen } from "./components/TestResultScreen";
import { DemoLayout } from "./components/demo/DemoLayout";
import { DemoStandbyScreen } from "./components/demo/DemoStandbyScreen";
import { DemoMessageScreen } from "./components/demo/DemoMessageScreen";
import { DemoExtractScreen } from "./components/demo/DemoExtractScreen";
import { DemoSaveScreen } from "./components/demo/DemoSaveScreen";
import { DemoCompleteScreen } from "./components/demo/DemoCompleteScreen";

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
    ],
  },
  {
    path: "/demo",
    Component: DemoLayout,
    children: [
      { index: true, Component: DemoStandbyScreen },
      { path: "message", Component: DemoMessageScreen },
      { path: "extract", Component: DemoExtractScreen },
      { path: "save", Component: DemoSaveScreen },
      { path: "complete", Component: DemoCompleteScreen },
    ],
  },
]);
