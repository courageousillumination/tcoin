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
          <a
            href="#"
            key={x.title}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab(x.title);
            }}
            style={{
              margin: 16,
              fontWeight: active === x ? "bold" : undefined,
            }}
          >
            {x.title}
          </a>
        ))}
      </div>
      <div
        style={{ border: "1px solid gray", marginTop: 24, marginBottom: 24 }}
      />
      {active ? active.content : null}
    </div>
  );
};

export { Tabs };
