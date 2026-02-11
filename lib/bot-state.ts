interface BotState {
    status: "idle" | "loading" | "completed" | "failed";
    prompt: string | null;
    response: string | null;
    error: string | null;
    lastUpdated: number;
}

// In-memory state (Note: resets on server restart)
let state: BotState = {
    status: "idle",
    prompt: null,
    response: null,
    error: null,
    lastUpdated: Date.now()
};

export const getBotState = () => state;
export const setBotState = (newState: Partial<BotState>) => {
    state = { ...state, ...newState, lastUpdated: Date.now() };
};
