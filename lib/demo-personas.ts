export interface Persona {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary';
  occupation: string;
  location: string;
  image: string;
  bio: string;
  personality: {
    traits: string[];
    values: string[];
    communication_style: string;
  };
  background: {
    education: string;
    experience: string;
    interests: string[];
  };
  social: {
    network_size: string;
    influence_level: string;
    preferred_platforms: string[];
  };
}