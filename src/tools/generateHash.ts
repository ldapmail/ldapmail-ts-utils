import {createHash} from 'crypto';

export default function (input: string, algorithm: 'sha1' | 'sha512' = 'sha1'): string {
    const hash = createHash(algorithm);
    hash.update(input);
    return hash.digest('hex');
}
