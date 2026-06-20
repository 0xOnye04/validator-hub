import { type Account, SigningStargateClient } from '@cosmjs/stargate';
import {
  type Coin,
  type EncodeObject,
  type OfflineDirectSigner,
  makeAuthInfoBytes,
  makeSignDoc,
} from '@cosmjs/proto-signing';
import { fromBase64 } from '@cosmjs/encoding';
import { Any } from 'cosmjs-types/google/protobuf/any';
import { BaseAccount } from 'cosmjs-types/cosmos/auth/v1beta1/auth';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { PubKey } from '@kiichain/kiijs-proto/dist/cosmos/evm/crypto/v1/ethsecp256k1/keys';
import { KII_DENOM, KII_GAS_PRICE_AMOUNT } from './kiichain';

export const ETHSECP256K1_PUBKEY_TYPE_URL = '/cosmos.evm.crypto.v1.ethsecp256k1.PubKey';

export function ethsecpAccountParser(accountAny: Any): Account {
  if (
    accountAny.typeUrl === '/cosmos.auth.v1beta1.BaseAccount' ||
    accountAny.typeUrl === '/ethermint.types.v1.EthAccount'
  ) {
    const account = BaseAccount.decode(accountAny.value);

    if (account.pubKey?.typeUrl === ETHSECP256K1_PUBKEY_TYPE_URL) {
      account.pubKey.value = PubKey.decode(account.pubKey.value).key;
    }

    return account as unknown as Account;
  }

  throw new Error(`Unknown account type: ${accountAny.typeUrl}`);
}

export function isOfflineDirectSigner(signer: unknown): signer is OfflineDirectSigner {
  return typeof (signer as OfflineDirectSigner | undefined)?.signDirect === 'function';
}

export async function signWithEthsecpSigner(
  client: SigningStargateClient,
  signer: OfflineDirectSigner,
  chainId: string,
  signerAddress: string,
  messages: EncodeObject[],
  memo = '',
  gasPricePerUnit = KII_GAS_PRICE_AMOUNT,
  gasAdjustment = 1.5
): Promise<Uint8Array> {
  const accountData = await client.getAccount(signerAddress);

  if (!accountData) {
    throw new Error(`Account with address ${signerAddress} does not exist on chain ${chainId}`);
  }

  const accountFromSigner = (await signer.getAccounts()).find((account) => account.address === signerAddress);

  if (!accountFromSigner) {
    throw new Error('Failed to retrieve account from signer');
  }

  if (!accountFromSigner.pubkey || accountFromSigner.pubkey.length === 0) {
    throw new Error('Public key not available from signer');
  }

  const ethSecpPubkey = Any.fromPartial({
    typeUrl: PubKey.typeUrl,
    value: PubKey.encode({
      key: accountFromSigner.pubkey,
    }).finish(),
  });

  const txBodyBytes = client.registry.encode({
    typeUrl: '/cosmos.tx.v1beta1.TxBody',
    value: {
      messages,
      memo,
    },
  });
  const simulatedGas = await client.simulate(signerAddress, messages, memo);
  const gasLimit = Math.ceil(simulatedGas * gasAdjustment);
  const fee: Coin = {
    denom: KII_DENOM,
    amount: Math.ceil(gasLimit * gasPricePerUnit).toString(),
  };
  const authInfoBytes = makeAuthInfoBytes(
    [{ pubkey: ethSecpPubkey, sequence: accountData.sequence }],
    [fee],
    gasLimit,
    undefined,
    signerAddress
  );
  const signDoc = makeSignDoc(txBodyBytes, authInfoBytes, chainId, accountData.accountNumber);
  const { signature, signed } = await signer.signDirect(signerAddress, signDoc);

  return TxRaw.encode({
    bodyBytes: signed.bodyBytes,
    authInfoBytes: signed.authInfoBytes,
    signatures: [fromBase64(signature.signature)],
  }).finish();
}
