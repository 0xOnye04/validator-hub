import { GasPrice } from '@cosmjs/stargate';
import type { ChainInfo } from '@keplr-wallet/types';

export const KII_CHAIN_ID = 'oro_1336-1';
export const KII_CHAIN_NAME = 'Kii Testnet Oro';
export const KII_RPC_URL = 'https://rpc.uno.sentry.testnet.v3.kiivalidator.com';
export const KII_REST_URL = 'https://lcd.uno.sentry.testnet.v3.kiivalidator.com';
export const KII_EVM_RPC_URL = 'https://json-rpc.uno.sentry.testnet.v3.kiivalidator.com';
export const KII_EVM_CHAIN_ID = 1336;
export const KII_DENOM = 'akii';
export const KII_GAS_PRICE_AMOUNT = 80000000000;
export const KII_GAS_PRICE = GasPrice.fromString(`${KII_GAS_PRICE_AMOUNT}${KII_DENOM}`);

export const KII_CHAIN_IMAGE_URL = 'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/oro_1336/kii_oro_coin.png';

export const KII_BECH32_PREFIX: ChainInfo['bech32Config'] = {
  bech32PrefixAccAddr: 'kii',
  bech32PrefixAccPub: 'kiipub',
  bech32PrefixValAddr: 'kiivaloper',
  bech32PrefixValPub: 'kiivaloperpub',
  bech32PrefixConsAddr: 'kiivalcons',
  bech32PrefixConsPub: 'kiivalconspub',
};

export const KII_EXPONENT = 18; // 1 KII = 10^18 akii

export function ukiiToKii(amount: number | string): number {
  const num = typeof amount === 'string' ? Number(amount) : amount;
  return num / Math.pow(10, KII_EXPONENT);
}

export function kiiToUkii(amount: number | string): number {
  const num = typeof amount === 'string' ? Number(amount) : amount;
  return num * Math.pow(10, KII_EXPONENT);
}

export function kiiToUkiiAmountString(amount: number | string): string {
  const [whole, fraction = ''] = amount.toString().trim().split('.');
  const normalizedFraction = fraction.padEnd(KII_EXPONENT, '0').slice(0, KII_EXPONENT);
  const wholePart = BigInt(whole || '0') * BigInt(`1${'0'.repeat(KII_EXPONENT)}`);
  const fractionPart = BigInt(normalizedFraction || '0');

  return (wholePart + fractionPart).toString();
}

export const KII_CHAIN_INFO: ChainInfo = {
  chainId: KII_CHAIN_ID,
  chainName: KII_CHAIN_NAME,
  rpc: KII_RPC_URL,
  rest: KII_REST_URL,
  evm: {
    chainId: KII_EVM_CHAIN_ID,
    rpc: KII_EVM_RPC_URL,
  },
  chainSymbolImageUrl: KII_CHAIN_IMAGE_URL,
  bip44: { coinType: 60 },
  bech32Config: KII_BECH32_PREFIX,
  currencies: [
    {
      coinDenom: 'Kii',
      coinMinimalDenom: KII_DENOM,
      coinDecimals: KII_EXPONENT,
      coinImageUrl: KII_CHAIN_IMAGE_URL,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: 'Kii',
      coinMinimalDenom: KII_DENOM,
      coinDecimals: KII_EXPONENT,
      coinImageUrl: KII_CHAIN_IMAGE_URL,
      gasPriceStep: { low: 80000000000, average: 80000000000, high: 80000000000 },
    },
  ],
  stakeCurrency: {
    coinDenom: 'Kii',
    coinMinimalDenom: KII_DENOM,
    coinDecimals: KII_EXPONENT,
    coinImageUrl: KII_CHAIN_IMAGE_URL,
  },
  features: ['eth-address-gen', 'eth-key-sign', 'eth-secp256k1-cosmos'],
  nodeProvider: {
    name: 'Kiichain Protocol',
    email: 'dev@kiichain.io',
    website: 'https://kiichain.io',
  },
  isTestnet: true,
};
