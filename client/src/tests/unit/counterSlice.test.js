// tests/unit/counterSlice.test.js
import counterReducer, { initialState } from '../../redux/counterSlice';

describe('counterSlice reducer', () => {
  it('should return initial state', () => {
    expect(counterReducer(undefined, {})).toEqual(initialState);
  });

  it('should increment', () => {
    expect(counterReducer(initialState, { type: 'increment' })).toEqual({ count: 1 });
  });

  it('should decrement', () => {
    expect(counterReducer({ count: 1 }, { type: 'decrement' })).toEqual({ count: 0 });
  });
});
