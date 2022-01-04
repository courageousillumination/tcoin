import { useState } from "react";

interface TabsProps {
  tabs: {
    title: string;
    content: React.ReactNode;
  }[];
}

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].title);
  const active = tabs.find((x) => x.title === activeTab);

  return (
    <div>
      <div>
        {tabs.map((x) => (
          <button key={x.title} onClick={() => setActiveTab(x.title)}>
            {x.title}
          </button>
        ))}
      </div>
      {active ? active.content : null}
    </div>
  );
};

export { Tabs };
