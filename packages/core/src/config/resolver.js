import { sharedConfigResolver } from './shared'
import { ConfigResolverMap } from '../imports'

export function resolveWith(config = {}, resolvers) {
  const result = {}

  for (const [key, resolver] of Object.entries(resolvers))
    switch (typeof resolver) {
      case 'function':
        result[key] = resolver.call(result, config[key], key, config)
        break
      case 'object':
        result[key] = resolveWith(config[key], resolver)
        break
      case 'boolean':
        if (resolver) result[key] = config[key]
        break
    }

  return result
}

export function parse(config, gestureKey) {
  const { target, eventOptions, window, enabled, ...rest } = config
  const _config = {
    shared: resolveWith({ target, eventOptions, window, enabled }, sharedConfigResolver)
  }

  if (gestureKey) {
    _config[gestureKey] = resolveWith(rest, ConfigResolverMap.get(gestureKey))
  } else {
    for (const key in rest) {
      const resolver = ConfigResolverMap.get(key)
      this._config[key] = resolveWith(rest[key], resolver)
    }
  }
  return _config
}