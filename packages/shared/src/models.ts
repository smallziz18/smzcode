export type ModelPricing = {
    inputUsdPerMillionTokens: number;
    outputUsdPerMillionTokens: number;
};

export type SupportedProvider = "anthropic" | "openai" | "open-source";

export type SupportedChatModelDefinition = {
    id: string;
    provider: SupportedProvider;
    pricing: ModelPricing;
};

export const SUPPORTED_CHAT_MODELS = [
    {
        id: "claude-sonnet-4-6",
        provider: "anthropic",
        pricing: {
            inputUsdPerMillionTokens: 3,
            outputUsdPerMillionTokens: 15,
        },
    },
    {
        id: "claude-haiku-4-5",
        provider: "anthropic",
        pricing: {
            inputUsdPerMillionTokens: 1,
            outputUsdPerMillionTokens: 5,
        },
    },
    {
        id: "claude-opus-4-6",
        provider: "anthropic",
        pricing: {
            inputUsdPerMillionTokens: 5,
            outputUsdPerMillionTokens: 25,
        },
    },
    {
        id: "gpt-5.4",
        provider: "openai",
        pricing: {
            inputUsdPerMillionTokens: 2.5,
            outputUsdPerMillionTokens: 15,
        },
    },
    {
        id: "gpt-5.4-mini",
        provider: "openai",
        pricing: {
            inputUsdPerMillionTokens: 0.75,
            outputUsdPerMillionTokens: 4.5,
        },
    },
    {
        id: "gpt-5.4-nano",
        provider: "openai",
        pricing: {
            inputUsdPerMillionTokens: 0.2,
            outputUsdPerMillionTokens: 1.25,
        },
    },
    // Ajout des modèles Open-Source par défaut (ex: via LM Studio ou Unsloth)
    {
        id: "lmstudio-community/Qwen3.5-9B-MLX-4bit",
        provider: "open-source",
        pricing: {
            inputUsdPerMillionTokens: 0, // Gratuit en local
            outputUsdPerMillionTokens: 0,
        },
    },
    {
        id: "lmstudio-community/gemma-4-E4B-it-MLX-4bit",
        provider: "open-source",
        pricing: {
            inputUsdPerMillionTokens: 0,
            outputUsdPerMillionTokens: 0,
        },
    },
] as const satisfies readonly SupportedChatModelDefinition[];

export type SupportedChatModel = (typeof SUPPORTED_CHAT_MODELS)[number];

// L'intersection (string & {}) permet de conserver l'autocomplétion des IDs de la liste
// ci-dessus dans l'éditeur de code, tout en acceptant n'importe quel autre string.
export type SupportedChatModelId = (typeof SUPPORTED_CHAT_MODELS)[number]["id"] | (string & {});

export const DEFAULT_CHAT_MODEL_ID: SupportedChatModelId = "lmstudio-community/Qwen3.5-9B-MLX-4bit";

/**
 * Recherche un modèle dans la liste statique.
 * Si non trouvé, et que l'ID correspond à un format open-source/local,
 * retourne une définition générique créée à la volée.
 */
export function findSupportedChatModel(modelId: string): SupportedChatModelDefinition | undefined {
    // 1. Recherche dans les modèles définis en dur
    const staticModel = SUPPORTED_CHAT_MODELS.find((model) => model.id === modelId);
    if (staticModel) {
        return staticModel;
    }

    // 2. Fallback dynamique pour l'open-source / local (ex: HuggingFace, LM Studio)
    const lowerId = modelId.toLowerCase();
    if (
        modelId.includes("/") ||
        lowerId.includes("gemma") ||
        lowerId.includes("qwen") ||
        lowerId.includes("llama") ||
        lowerId.includes("mistral")
    ) {
        return {
            id: modelId,
            provider: "open-source",
            pricing: {
                inputUsdPerMillionTokens: 0,
                outputUsdPerMillionTokens: 0,
            },
        };
    }

    return undefined;
}