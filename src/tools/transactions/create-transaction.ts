import { z } from 'zod';
import { fireblocksClient, TransactionRequest } from '../../fireblocks-client';
import { Tool } from '../../types';

// Define the Zod schema for creating transactions based on the OpenAPI spec
const oneTimeAddressSchema = z.object({
  address: z.string().describe('The destination address'),
  tag: z.string().optional().describe('Optional tag for the address'),
});

const transferPeerPathSchema = z.object({
  type: z
    .enum([
      'VAULT_ACCOUNT',
      'EXCHANGE_ACCOUNT',
      'INTERNAL_WALLET',
      'EXTERNAL_WALLET',
      'CONTRACT',
      'NETWORK_CONNECTION',
      'FIAT_ACCOUNT',
      'COMPOUND',
      'GAS_STATION',
      'ONE_TIME_ADDRESS',
      'UNKNOWN',
      'END_USER_WALLET',
      'PROGRAM_CALL',
      'MULTI_DESTINATION',
    ])
    .describe('The type of peer path'),
  id: z.string().optional().describe('The ID of the peer'),
  name: z.string().optional().describe('The name of the peer'),
  walletId: z.string().optional().describe('The wallet ID'),
  oneTimeAddress: oneTimeAddressSchema.optional().describe('One-time address details'),
  subType: z.string().optional().describe('Sub-type of the peer'),
  isCollateral: z.boolean().optional().describe('Whether this is a collateral account'),
});

const schema = z
  .object({
    operation: z
      .enum([
        'TRANSFER',
        'BURN',
        'CONTRACT_CALL',
        'PROGRAM_CALL',
        'MINT',
        'RAW',
        'TYPED_MESSAGE',
        'APPROVE',
        'ENABLE_ASSET',
      ])
      .optional()
      .default('TRANSFER')
      .describe('The type of operation to perform'),

    note: z.string().optional().describe('Custom note to describe the transaction'),

    externalTxId: z
      .string()
      .optional()
      .describe('External transaction ID to avoid duplicate transactions'),

    assetId: z.string().describe('The ID of the asset to transfer (e.g., BTC, ETH)'),

    source: transferPeerPathSchema.describe('The source of the transaction'),

    destination: transferPeerPathSchema.optional().describe('The destination of the transaction'),

    amount: z.string().describe('The amount to transfer as a string for precision'),

    treatAsGrossAmount: z
      .boolean()
      .optional()
      .describe('Whether to deduct fee from the requested amount'),

    forceSweep: z
      .boolean()
      .optional()
      .describe('For Polkadot/Kusama/Westend only - empty the asset wallet'),

    feeLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().describe('Blockchain fee level'),

    fee: z.string().optional().describe('Custom fee amount'),

    priorityFee: z
      .string()
      .optional()
      .describe('Priority fee for EIP-1559 transactions (Ethereum)'),

    failOnLowFee: z.boolean().optional().describe('Fail if fee is too low'),

    maxFee: z.string().optional().describe('Maximum fee to pay'),

    maxTotalFee: z.string().optional().describe('Maximum total fee (BTC-based blockchains only)'),

    gasLimit: z.string().optional().describe('Gas limit for EVM transactions'),

    gasPrice: z.string().optional().describe('Gas price for non-EIP-1559 EVM transactions'),

    networkFee: z.string().optional().describe('Total network fee for EVM transactions'),

    replaceTxByHash: z.string().optional().describe('Hash of stuck transaction to replace'),

    customerRefId: z.string().optional().describe('Customer reference ID for AML providers'),
  })
  .strict();

type CreateTransactionArgs = z.infer<typeof schema>;

export const createTransactionTool: Tool<CreateTransactionArgs> = {
  name: 'create_transaction',
  description: 'Create a new Fireblocks transaction',
  schema,
  isWriteOperation: true,
  handler: async (args: CreateTransactionArgs) => {
    const transaction = await fireblocksClient.createTransaction(args as TransactionRequest);

    return transaction;
  },
};
