import { UserProfile, WasteListing, PickupRequest, CarbonLedgerEntry } from '../types';

// Clean initial state: zero synthetic clutter.
// Real profiles, listings, and pickup requests will be created directly by the user!
export const INITIAL_PROFILES: UserProfile[] = [];
export const INITIAL_LISTINGS: WasteListing[] = [];
export const INITIAL_REQUESTS: PickupRequest[] = [];
export const INITIAL_LEDGER: CarbonLedgerEntry[] = [];
