import { Tool } from '../types';
import { getBlockchainAssetTool, getBlockchainsTool } from './blockchains';
import { getExchangeAccountsTool } from './exchanges';
import { getNetworkConnectionsTool } from './network';
import { getActivePolicyTool } from './policy';
import { createTransactionTool, getTransactionsTool } from './transactions';
import {
  getVaultAccountAssetTool,
  getVaultAccountByIdTool,
  getVaultAccountsTool,
  getVaultBalanceByAssetTool,
} from './vaults';
import { getWhitelistIpAddressTool } from './whitelist';

const tools: Tool[] = [
  getTransactionsTool,
  createTransactionTool,
  getVaultAccountsTool,
  getVaultAccountByIdTool,
  getVaultAccountAssetTool,
  getVaultBalanceByAssetTool,
  getExchangeAccountsTool,
  getNetworkConnectionsTool,
  getActivePolicyTool,
  getBlockchainsTool,
  getBlockchainAssetTool,
  getWhitelistIpAddressTool,
];

export { tools };
