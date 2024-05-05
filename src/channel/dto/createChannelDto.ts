export interface CreateChannelDto {
  nom: string;
  serverId: number;
}

export interface CreateChannelResponse {
  id: number;
  name: string;
  server_id: number;
  type: string;
}
