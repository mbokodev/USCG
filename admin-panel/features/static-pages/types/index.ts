// Re-export from shared types
export type {
  ITermsPage,
  IUpdateTermsDto,
  IPrivacyPage,
  IUpdatePrivacyDto,
  IAboutPage,
  IAboutValue,
  IAboutValueInput,
  IAboutTeamMember,
  IUpdateAboutDto,
  TiptapContent,
  I18nContent,
} from "@uscg/shared/types";

// Import local TiptapEditor type for form values
import type { TiptapContent as EditorTiptapContent } from "@/components/ui/editor/TiptapEditor";

// Admin panel specific form types
// Form values now use single-language input (content duplicated on CREATE)
export interface TermsFormValues {
  content: EditorTiptapContent | string;
}

export interface PrivacyFormValues {
  content: EditorTiptapContent | string;
}

// Form values now use single-language input (API auto-translates on CREATE)
export interface AboutFormValues {
  introduction: EditorTiptapContent | string;
  mission: EditorTiptapContent | string;
  vision: EditorTiptapContent | string;
  values: {
    icon: string;
    title: string; // Single language (sourceLang)
    description: string; // Single language (sourceLang)
  }[];
  team: {
    name: string;
    role: string;
    photoUrl?: string;
  }[];
}
