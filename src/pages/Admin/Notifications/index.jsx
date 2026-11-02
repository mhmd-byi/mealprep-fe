import { useState } from "react";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { AutomaticTab } from "./AutomaticTab";
import { ComposeTab } from "./ComposeTab";
import { HistoryTab } from "./HistoryTab";
import { TemplatesTab } from "./TemplatesTab";

const TABS = [
  { key: "send", label: "Send" },
  { key: "history", label: "History" },
  { key: "templates", label: "Templates" },
  { key: "auto", label: "Automatic reminders" },
];

export const Notifications = () => {
  const [tab, setTab] = useState("send");
  const [composeKey, setComposeKey] = useState(0);
  const [seedTemplate, setSeedTemplate] = useState(null);

  const applyTemplate = (template) => {
    setSeedTemplate(template);
    setComposeKey((key) => key + 1);
    setTab("send");
  };

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 w-full">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500">
              Send messages to customers' phones and app inbox, schedule them for later, and set up automatic reminders.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                  tab === item.key ? "bg-theme-color-1 text-white" : "bg-white text-gray-700 border border-gray-200 hover:border-theme-color-1"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "send" && <ComposeTab key={composeKey} initialTemplate={seedTemplate} onSent={() => setTab("history")} />}
          {tab === "history" && <HistoryTab />}
          {tab === "templates" && <TemplatesTab onUse={applyTemplate} />}
          {tab === "auto" && <AutomaticTab />}
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default Notifications;
