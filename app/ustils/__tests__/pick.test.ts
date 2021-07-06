import { pick } from '../pick'

describe('Pick test', () => {
  it('should return object with selected keys', () => {
    const testObj = {
      foo: 1,
      bar: 'z',
      baz: 'x',
    }

    const expectedObj = {
      foo: 1,
      bar: 'z',
    }

    expect(pick(testObj, ['foo', 'bar'])).toStrictEqual(expectedObj)
  })
})
