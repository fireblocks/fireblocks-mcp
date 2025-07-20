import { Tool } from '../types';
import { getAssetsTool, getBlockchainAssetTool, getBlockchainsTool } from './blockchains';
import { getExchangeAccountsTool } from './exchanges';
import { getNetworkConnectionsTool } from './network';
import { getActivePolicyTool } from './policy';
import { createTransactionTool, getTransactionsTool } from './transactions';
import { getUsersTool } from './users';
import {
  getVaultAccountAssetTool,
  getVaultAccountByIdTool,
  getVaultAccountsTool,
  getVaultAssetsTool,
  getVaultBalanceByAssetTool,
} from './vaults';
import { getExternalWalletsTool, getInternalWalletsTool } from './wallets';
import { getWhitelistIpAddressTool } from './whitelist';

const tools: Tool[] = [
  getTransactionsTool,
  createTransactionTool,
  getVaultAccountsTool,
  getVaultAccountByIdTool,
  getVaultAccountAssetTool,
  getVaultAssetsTool,
  getVaultBalanceByAssetTool,
  getExchangeAccountsTool,
  getNetworkConnectionsTool,
  getActivePolicyTool,
  getBlockchainsTool,
  getBlockchainAssetTool,
  getAssetsTool,
  getWhitelistIpAddressTool,
  getExternalWalletsTool,
  getInternalWalletsTool,
  getUsersTool,
];

export { tools };
