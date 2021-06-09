export type CommonObject = {
  [key: string]: unknown
}

export const pick = <S extends CommonObject, K extends string[]>(source: S, keys: K): S => {
  return keys.reduce((acc, key) => {
    Object.assign(acc, { [key]: source[key] })
    return acc
  }, {} as S)
}
