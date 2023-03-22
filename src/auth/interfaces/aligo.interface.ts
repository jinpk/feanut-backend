export interface AligoResponse {
  result_code: number;
  message: string;
  msg_id: number;
  success_cnt: number;
  error_cnt: number;
  msg_type: 'SMS';
}
