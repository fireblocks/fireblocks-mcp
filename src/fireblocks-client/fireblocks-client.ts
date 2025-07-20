import {
  Asset,
  CreateTransactionResponse,
  Fireblocks,
  ExchangeAccountsApiGetPagedExchangeAccountsRequest as GetExchangeAccountsRequest,
  GetPagedExchangeAccountsResponse as GetExchangeAccountsResponse,
  GetNetworkConnectionsResponse,
  TransactionsApiGetTransactionsRequest as GetTransactionsRequest,
  GetTransactionsResponse,
  VaultsApiGetVaultAccountAssetRequest as GetVaultAccountAssetRequest,
  VaultsApiGetPagedVaultAccountsRequest as GetVaultAccountsRequest,
  VaultAccountsPagedResponse as GetVaultAccountsResponse,
  VaultsApiGetVaultAssetsRequest as GetVaultAssetsRequest,
  GetVaultAssetsResponse,
  WhitelistIpAddressesApiGetWhitelistIpAddressesRequest as GetWhitelistIpAddressesRequest,
  GetWhitelistIpAddressesResponse,
  BlockchainsAssetsApiListAssetsRequest as ListAssetsRequest,
  ListAssetsResponse,
  ListBlockchainsResponse,
  PolicyAndValidationResponse,
  TransactionRequest,
  VaultAccount,
  VaultAsset,
  GetExternalWalletsResponse,
  GetInternalWalletsResponse,
  GetUsersResponse,
  UnmanagedWallet,
  UserResponse,
} from '@fireblocks/ts-sdk';
import { config } from '../config';

export class FireblocksClient {
  private readonly _fireblocks: Fireblocks;

  constructor() {
    this._fireblocks = new Fireblocks(config.fireblocks);
  }

  async testConnection() {
    try {
      await this.getVaultAccounts({
        limit: 1,
      });
    } catch (error: any) {
      const { data, statusCode } = error.response || {};

      throw new Error(`Failed to connect to Fireblocks API: ${statusCode} ${data?.message || ''}`);
    }
  }

  async getTransactions(req: GetTransactionsRequest): Promise<GetTransactionsResponse> {
    const transactions = await this._fireblocks.transactions.getTransactions(req);
    return transactions.data;
  }

  async createTransaction(req: TransactionRequest): Promise<CreateTransactionResponse> {
    const transaction = await this._fireblocks.transactions.createTransaction({
      transactionRequest: req,
    });
    return transaction.data;
  }

  async getVaultAccounts(req: GetVaultAccountsRequest): Promise<GetVaultAccountsResponse> {
    const vaultAccounts = await this._fireblocks.vaults.getPagedVaultAccounts(req);

    return vaultAccounts.data;
  }

  async getVaultAccountById(vaultAccountId: string): Promise<VaultAccount> {
    const vaultAccount = await this._fireblocks.vaults.getVaultAccount({ vaultAccountId });

    return vaultAccount.data;
  }

  async getVaultAccountAsset(req: GetVaultAccountAssetRequest): Promise<VaultAsset> {
    const accountBalances = await this._fireblocks.vaults.getVaultAccountAsset(req);

    return accountBalances.data;
  }

  async getVaultBalanceByAsset(assetId: string): Promise<VaultAsset> {
    const accountBalances = await this._fireblocks.vaults.getVaultBalanceByAsset({
      assetId,
    });

    return accountBalances.data;
  }

  async getVaultAssets(req: GetVaultAssetsRequest): Promise<GetVaultAssetsResponse> {
    const vaultAssets = await this._fireblocks.vaults.getVaultAssets(req);

    return vaultAssets.data;
  }

  async getAssets(req: ListAssetsRequest): Promise<ListAssetsResponse> {
    const assets = await this._fireblocks.blockchainsAssets.listAssets(req);

    return assets.data;
  }

  async getExchangeAccounts(req: GetExchangeAccountsRequest): Promise<GetExchangeAccountsResponse> {
    const exchangeAccounts = await this._fireblocks.exchangeAccounts.getPagedExchangeAccounts(req);

    return exchangeAccounts.data;
  }

  async getWhitelistIpAddresses(
    req: GetWhitelistIpAddressesRequest,
  ): Promise<GetWhitelistIpAddressesResponse> {
    const whitelistIpAddresses =
      await this._fireblocks.whitelistIpAddresses.getWhitelistIpAddresses(req);

    return whitelistIpAddresses.data;
  }

  async getNetworkConnections(): Promise<GetNetworkConnectionsResponse> {
    const networkConnections = await this._fireblocks.networkConnections.getNetworkConnections();

    return networkConnections.data;
  }

  async getActivePolicy(): Promise<PolicyAndValidationResponse> {
    const policies = await this._fireblocks.policyEditorBeta.getActivePolicy();

    return policies.data;
  }

  async getBlockchains(): Promise<ListBlockchainsResponse> {
    const blockchains = await this._fireblocks.blockchainsAssets.listBlockchains();

    return blockchains.data;
  }

  async getBlockchainAsset(id: string): Promise<Asset> {
    const asset = await this._fireblocks.blockchainsAssets.getAsset({ id });

    return asset.data;
  }

  async getExternalWallets(): Promise<GetExternalWalletsResponse> {
    const externalWallets = await this._fireblocks.externalWallets.getExternalWallets();

    return externalWallets.data;
  }

  async getInternalWallets(): Promise<GetInternalWalletsResponse> {
    const internalWallets = await this._fireblocks.internalWallets.getInternalWallets();

    return internalWallets.data;
  }

  async getUsers(): Promise<GetUsersResponse> {
    const users = await this._fireblocks.users.getUsers();

    return users.data;
  }
}
const fireblocksClient = new FireblocksClient();

export { fireblocksClient };
export type {
  Asset,
  CreateTransactionResponse,
  GetExchangeAccountsRequest,
  GetExchangeAccountsResponse,
  GetNetworkConnectionsResponse,
  GetTransactionsRequest,
  GetTransactionsResponse,
  GetVaultAccountAssetRequest,
  GetVaultAccountsRequest,
  GetVaultAccountsResponse,
  GetVaultAssetsRequest,
  GetVaultAssetsResponse,
  GetWhitelistIpAddressesRequest,
  GetWhitelistIpAddressesResponse,
  ListAssetsRequest,
  ListAssetsResponse,
  ListBlockchainsResponse,
  PolicyAndValidationResponse,
  TransactionRequest,
  VaultAccount,
  VaultAsset,
  GetExternalWalletsResponse,
  GetInternalWalletsResponse,
  GetUsersResponse,
  UnmanagedWallet,
  UserResponse,
};
