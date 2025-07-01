import { Tool } from '../types';
import { getAssetsTool, getBlockchainAssetTool, getBlockchainsTool } from './blockchains';
import { getExchangeAccountsTool } from './exchanges';
import { getNetworkConnectionsTool } from './network';
import { getActivePolicyTool } from './policy';
import { createTransactionTool, getTransactionsTool } from './transactions';
import {
  getVaultAccountAssetTool,
  getVaultAccountByIdTool,
  getVaultAccountsTool,
  getVaultAssetsTool,
  getVaultBalanceByAssetTool,
} from './vaults';
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
];

export { tools };
