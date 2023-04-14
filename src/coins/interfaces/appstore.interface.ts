export interface AppStoreResponse {
  receipt?: {
    adam_id: number;
    app_item_id: number;
    download_id: number;
    in_app: {
      product_id: string;
      transaction_id: string;
      original_transaction_id: string;
      in_app_ownership_type: 'PURCHASED';
    }[];
  };
  environment: 'Production' | 'Sandbox';
  status: number;
}
