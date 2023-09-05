import { createGlobalState } from 'react-hooks-global-state';
import { Account } from 'web3-core';

interface GlobalState {
    account: String;
    participants: string[];
    activeView: string;
    testAccount: Account | undefined;
}

export const { setGlobalState, useGlobalState, getGlobalState } = createGlobalState<GlobalState>({
    account: "",
    participants: [],
    activeView: "",
    testAccount: undefined
})