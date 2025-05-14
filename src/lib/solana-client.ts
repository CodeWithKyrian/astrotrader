import { Connection } from '@solana/web3.js';
import { getPublicEnv } from '@/config/environment';

const publicEnv = getPublicEnv();

export const connection = new Connection(publicEnv.SOLANA_RPC_URL, 'confirmed');
