interface NodeSummaryProps {
  nodes: unknown[];
}

const NetworkSummary: React.FC<NodeSummaryProps> = ({ nodes }) => {
  return <div>{nodes.length} node(s)</div>;
};

export { NetworkSummary };
