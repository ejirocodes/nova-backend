export const prefixes = {
  key: 'key',
  policy: 'pol',
  api: 'api',
  request: 'req',
  workspace: 'ws',
  keyAuth: 'ks',
  role: 'role',
  test: 'test',
  permission: 'perm',
  secret: 'sec',
  headerRewrite: 'hrw',
  gateway: 'gw',
  mk: 'mk',
  llmGateway: 'lgw',
  webhook: 'wh',
  event: 'evt',
  logger: 'log',
  reporter: 'rep',
  webhookDelivery: 'whd',
  act: 'act',
  identity: 'id',
  ratelimit: 'rl',
  error: 'err',
  user: 'usr',
} as const;

export type PrefixType = keyof typeof prefixes;
