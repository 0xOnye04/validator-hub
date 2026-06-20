import { SigningStargateClient, StargateClient, type DeliverTxResponse } from '@cosmjs/stargate';
import type { EncodeObject, OfflineDirectSigner } from '@cosmjs/proto-signing';
import { MsgDelegate, MsgUndelegate, MsgBeginRedelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { MsgWithdrawDelegatorReward } from 'cosmjs-types/cosmos/distribution/v1beta1/tx';
import { ukiiToKii, kiiToUkiiAmountString, KII_DENOM, KII_CHAIN_ID } from './kiichain';
import { signWithEthsecpSigner } from './keplr';

const KII_LCD_ENDPOINT = 'https://lcd.uno.sentry.testnet.v3.kiivalidator.com';
const TX_CONFIRMATION_INTERVAL_MS = 2000;
const TX_CONFIRMATION_ATTEMPTS = 30;

export interface BroadcastDebugContext {
  walletAddress: string | null;
  signerAddress: string;
  chainId: string;
  signerPubkey?: Uint8Array | null;
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${KII_LCD_ENDPOINT}${path}`);

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `KiiChain request failed (${response.status} ${response.statusText})${responseText ? `: ${responseText}` : ''}`
    );
  }

  return response.json() as Promise<T>;
}

async function confirmTransaction(client: SigningStargateClient, txHash: string) {
  for (let attempt = 0; attempt < TX_CONFIRMATION_ATTEMPTS; attempt += 1) {
    const tx = await client.getTx(txHash);

    if (tx) {
      return tx;
    }

    await new Promise((resolve) => setTimeout(resolve, TX_CONFIRMATION_INTERVAL_MS));
  }

  throw new Error(`Transaction ${txHash} was broadcast but not confirmed in time.`);
}

function ensureSuccessfulTx(response: DeliverTxResponse, action: string) {
  if (response.code !== 0) {
    throw new Error(response.rawLog || `${action} failed`);
  }

  return response;
}

async function signAndBroadcastWithEthsecpSigner(
  client: SigningStargateClient,
  signer: OfflineDirectSigner,
  signerAddress: string,
  messages: EncodeObject[],
  action: string
) {
  const txRaw = await signWithEthsecpSigner(client, signer, KII_CHAIN_ID, signerAddress, messages);
  const response = await client.broadcastTx(txRaw);

  ensureSuccessfulTx(response, action);
  await confirmTransaction(client, response.transactionHash);

  return response;
}

function logBroadcastContext(action: string, context: BroadcastDebugContext, extra?: Record<string, unknown>) {
  console.debug(`[KiiChain Tx] ${action} preflight`, {
    action,
    chainId: context.chainId,
    walletAddress: context.walletAddress,
    signerAddress: context.signerAddress,
    signerMatchesWallet: context.walletAddress === context.signerAddress,
    signerPubkey: context.signerPubkey ? formatPubkey(context.signerPubkey) : null,
    ...extra,
  });
}

function ensureSignerAddressMatchesWallet(context: BroadcastDebugContext) {
  if (context.walletAddress && context.walletAddress !== context.signerAddress) {
    throw new Error(
      `Signer mismatch: wallet state address ${context.walletAddress} does not match Keplr signer address ${context.signerAddress}`
    );
  }
}

function formatPubkey(pubkey: Uint8Array) {
  return Array.from(pubkey)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export interface ValidatorInfo {
  operatorAddress: string;
  moniker: string;
  identity: string;
  website: string;
  securityContact: string;
  details: string;
  jailed: boolean;
  status: number;
  tokens: number;
  delegatorShares: number;
  commissionRate: number;
  maxCommissionRate: number;
  maxChangeRate: number;
  updateTime: Date;
  minSelfDelegation: number;
}

export interface Delegation {
  validatorAddress: string;
  shares: number;
  balance: number;
}

export interface UnbondingDelegation {
  validatorAddress: string;
  entries: {
    creationHeight: number;
    completionTime: Date;
    initialBalance: number;
    balance: number;
  }[];
}

export async function fetchValidators(): Promise<ValidatorInfo[]> {
  const data = await fetchJson<{ validators?: any[] }>('/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED');
  return (data.validators || []).map((v: any) => ({
    operatorAddress: v.operator_address,
    moniker: v.description?.moniker || 'Unknown',
    identity: v.description?.identity || '',
    website: v.description?.website || '',
    securityContact: v.description?.security_contact || '',
    details: v.description?.details || '',
    jailed: v.jailed,
    status: v.status,
    tokens: ukiiToKii(v.tokens),
    delegatorShares: parseFloat(v.delegator_shares),
    commissionRate: parseFloat(v.commission?.commission_rates?.rate || '0'),
    maxCommissionRate: parseFloat(v.commission?.commission_rates?.max_rate || '0'),
    maxChangeRate: parseFloat(v.commission?.commission_rates?.max_change_rate || '0'),
    updateTime: new Date(v.commission?.update_time || 0),
    minSelfDelegation: ukiiToKii(v.min_self_delegation || '0'),
  }));
}

export async function fetchDelegations(address: string): Promise<Delegation[]> {
  const data = await fetchJson<{ delegation_responses?: any[] }>(`/cosmos/staking/v1beta1/delegations/${address}`);
  return (data.delegation_responses || []).map((dr: any) => ({
    validatorAddress: dr.delegation.validator_address,
    shares: parseFloat(dr.delegation.shares),
    balance: ukiiToKii(dr.balance.amount),
  }));
}

export async function fetchUnbondingDelegations(address: string): Promise<UnbondingDelegation[]> {
  const data = await fetchJson<{ unbonding_responses?: any[] }>(`/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`);
  return (data.unbonding_responses || []).map((udr: any) => ({
    validatorAddress: udr.validator_address,
    entries: udr.entries.map((e: any) => ({
      creationHeight: parseInt(e.creation_height),
      completionTime: new Date(e.completion_time),
      initialBalance: ukiiToKii(e.initial_balance),
      balance: ukiiToKii(e.balance),
    })),
  }));
}

export async function fetchRewards(address: string): Promise<{ validatorAddress: string; amount: number }[]> {
  const data = await fetchJson<{ rewards?: any[] }>(`/cosmos/distribution/v1beta1/delegators/${address}/rewards`);
  return (data.rewards || []).map((r: any) => {
    const akiiReward = r.reward?.find((a: any) => a.denom === KII_DENOM)?.amount || '0';
    return {
      validatorAddress: r.validator_address,
      amount: ukiiToKii(akiiReward),
    };
  }).filter((r: any) => r.amount > 0);
}

export async function delegateTokens(
  client: SigningStargateClient,
  signer: OfflineDirectSigner,
  walletAddress: string | null,
  signerAddress: string,
  validatorAddress: string,
  amountKii: number,
  signerPubkey?: Uint8Array | null
): Promise<DeliverTxResponse> {
  const context: BroadcastDebugContext = { walletAddress, signerAddress, chainId: KII_CHAIN_ID, signerPubkey };
  ensureSignerAddressMatchesWallet(context);
  logBroadcastContext('delegate', context, { validatorAddress, amountKii });
  const amount = kiiToUkiiAmountString(amountKii);
  const msg = MsgDelegate.fromPartial({
    delegatorAddress: signerAddress,
    validatorAddress,
    amount: { denom: KII_DENOM, amount },
  });
  return signAndBroadcastWithEthsecpSigner(
    client,
    signer,
    signerAddress,
    [{ typeUrl: '/cosmos.staking.v1beta1.MsgDelegate', value: msg }],
    'Delegate'
  );
}

export async function undelegateTokens(
  client: SigningStargateClient,
  signer: OfflineDirectSigner,
  walletAddress: string | null,
  signerAddress: string,
  validatorAddress: string,
  amountKii: number,
  signerPubkey?: Uint8Array | null
): Promise<DeliverTxResponse> {
  const context: BroadcastDebugContext = { walletAddress, signerAddress, chainId: KII_CHAIN_ID, signerPubkey };
  ensureSignerAddressMatchesWallet(context);
  logBroadcastContext('undelegate', context, { validatorAddress, amountKii });
  const amount = kiiToUkiiAmountString(amountKii);
  const msg = MsgUndelegate.fromPartial({
    delegatorAddress: signerAddress,
    validatorAddress,
    amount: { denom: KII_DENOM, amount },
  });
  return signAndBroadcastWithEthsecpSigner(
    client,
    signer,
    signerAddress,
    [{ typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate', value: msg }],
    'Undelegate'
  );
}

export async function redelegateTokens(
  client: SigningStargateClient,
  signer: OfflineDirectSigner,
  walletAddress: string | null,
  signerAddress: string,
  srcValidatorAddress: string,
  dstValidatorAddress: string,
  amountKii: number,
  signerPubkey?: Uint8Array | null
): Promise<DeliverTxResponse> {
  const context: BroadcastDebugContext = { walletAddress, signerAddress, chainId: KII_CHAIN_ID, signerPubkey };
  ensureSignerAddressMatchesWallet(context);
  logBroadcastContext('redelegate', context, { srcValidatorAddress, dstValidatorAddress, amountKii });
  const amount = kiiToUkiiAmountString(amountKii);
  const msg = MsgBeginRedelegate.fromPartial({
    delegatorAddress: signerAddress,
    validatorSrcAddress: srcValidatorAddress,
    validatorDstAddress: dstValidatorAddress,
    amount: { denom: KII_DENOM, amount },
  });
  return signAndBroadcastWithEthsecpSigner(
    client,
    signer,
    signerAddress,
    [{ typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate', value: msg }],
    'Redelegate'
  );
}

export async function claimRewards(
  client: SigningStargateClient,
  signer: OfflineDirectSigner,
  walletAddress: string | null,
  signerAddress: string,
  validatorAddresses: string[],
  signerPubkey?: Uint8Array | null
): Promise<DeliverTxResponse> {
  const context: BroadcastDebugContext = { walletAddress, signerAddress, chainId: KII_CHAIN_ID, signerPubkey };
  ensureSignerAddressMatchesWallet(context);
  logBroadcastContext('claimRewards', context, { validatorAddresses });
  const msgs = validatorAddresses.map((va) => MsgWithdrawDelegatorReward.fromPartial({
    delegatorAddress: signerAddress,
    validatorAddress: va,
  }));
  return signAndBroadcastWithEthsecpSigner(
    client,
    signer,
    signerAddress,
    msgs.map((m) => ({ typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward', value: m })),
    'Claim rewards'
  );
}
