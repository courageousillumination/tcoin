import { Stat } from "../../common/stat";

const Stats: React.FC<{ stats: Stat[] }> = ({ stats }) => {
  return (
    <table>
      <tbody>
        {stats.map(({ name, value }) => (
          <tr key={name}>
            <td>{name}</td>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
export { Stats };
