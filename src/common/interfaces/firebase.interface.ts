export interface DynamicLinkQuery {
  action: string;
  payload: string;
}

export interface PushParams {
  tokens: string[];
  title: string;
  message: string;
  payload?: object;
}
