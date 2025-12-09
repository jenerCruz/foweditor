import { useState } from "react";
import VisualWorkflowBuilder3 from "./pages/VisualWorkflowBuilder3";
import TriggerLibrary from "./pages/TriggerLibrary";
import TriggerActionPage from "./pages/TriggerActionPage";
import Inbox from "./pages/Inbox";
import Environments from "./pages/Environments";

type PageType = "workflow" | "triggers" | "triggerAction" | "inbox" | "environments";

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("workflow");

  if (currentPage === "triggers") {
    return (
      <TriggerLibrary
        onSelectTrigger={(trigger) => {
          console.log("Selected trigger:", trigger);
          setCurrentPage("workflow");
        }}
        onBack={() => setCurrentPage("workflow")}
      />
    );
  }

  if (currentPage === "triggerAction") {
    return (
      <TriggerActionPage
        onSelectTrigger={(trigger) => {
          console.log("Selected trigger:", trigger);
          setCurrentPage("workflow");
        }}
        onCreateCustomTrigger={() => {
          console.log("Create custom trigger");
          setCurrentPage("workflow");
        }}
      />
    );
  }

  if (currentPage === "inbox") {
    return <Inbox onBack={() => setCurrentPage("workflow")} />;
  }

  if (currentPage === "environments") {
    return <Environments onBack={() => setCurrentPage("workflow")} />;
  }

  return (
    <VisualWorkflowBuilder3
      onNavigateToTriggers={() => setCurrentPage("triggers")}
      onNavigateToInbox={() => setCurrentPage("inbox")}
      onNavigateToEnvironments={() => setCurrentPage("environments")}
      onNavigateToHome={() => setCurrentPage("workflow")}
    />
  );
}

export default App;