import { isMicrosoftProvider } from "@/utils/email/provider-types";

interface EmailTerminology {
  label: {
    singular: string;
    plural: string;
    singularCapitalized: string;
    pluralCapitalized: string;
    action: string;
  };
}

/**
 * Get email terminology based on the provider
 * Gmail uses "标签" while Outlook uses "分类"
 */
export function getEmailTerminology(provider: string): EmailTerminology {
  const isOutlook = isMicrosoftProvider(provider);

  if (isOutlook) {
    return {
      label: {
        singular: "分类",
        plural: "分类",
        singularCapitalized: "分类",
        pluralCapitalized: "分类",
        action: "分类",
      },
    };
  }

  // Default to Gmail terminology
  return {
    label: {
      singular: "标签",
      plural: "标签",
      singularCapitalized: "标签",
      pluralCapitalized: "标签",
      action: "标签",
    },
  };
}
