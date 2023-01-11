export function bufferToNumber(buffer: Buffer) {
  let number = 0;
  for (let i = 0; i < buffer.length; i++) {
    number += buffer[i] * Math.pow(2, 8 * i);
  }
  return number;
}
