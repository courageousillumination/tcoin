import { Block as TBlock } from "../../blockchain/block";

const Block: React.FC<{ block: TBlock }> = ({ block }) => {
  return (
    <div>
      <div>Block Header</div>
      <table>
        <tbody>
          <tr>
            <td>Previous Hash</td>
            <td>{block.previousHash} </td>
          </tr>
          <tr>
            <td>Nonce</td>
            <td>{block.previousHash} </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export { Block };
