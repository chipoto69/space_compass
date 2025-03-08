export interface FormData {
  name: string;
  birthday: string;
  birthtime?: string;
  birthplace: string;
  jobTitle: string;
}

export interface AstroData {
  sunSign: string;
  moonSign?: string;
  ascendant?: string;
  planets?: {
    [key: string]: {
      sign: string;
      house?: number;
    }
  };
}

export interface HumanDesignData {
  type: string;
  authority: string;
  profile?: string;
  definition?: string;
  gates?: number[];
  centers?: string[];
  channels?: string[];
}

export interface ResultData {
  userId?: number;
  name?: string;
  astroData: AstroData;
  hdData: HumanDesignData;
  resonance?: string;
  archetype?: string;
  chartUrl?: string;
  chatResponse: string;
}

export interface ChatMessage {
  text: string;
  isBot: boolean;
} 