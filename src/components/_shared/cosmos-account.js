import { existsWallet } from '../../methods/injection';
import { getCosmosKey } from '../../methods/cosmos';
import { formatError } from '../../utils/json';

export const handleCosmosGetAccount = async ({ chainId, setter, setResponse }) => {
  if (!existsWallet()) {
    return;
  }
  try {
    const res = await getCosmosKey(chainId.trim());
    if (res?.status === 'success' && res.data?.bech32Address) {
      setter(res.data.bech32Address);
    } else {
      setResponse(JSON.stringify(res, null, 2));
    }
  } catch (error) {
    setResponse(formatError(error));
  }
};
