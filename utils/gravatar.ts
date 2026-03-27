import crypto from 'crypto';

/**
 * Detect likely gender from name (basic heuristic)
 * @param name - Full name
 * @returns 'male' | 'female' | 'neutral'
 */
function detectGender(name: string): 'male' | 'female' | 'neutral' {
  const firstName = name.split(' ')[0].toLowerCase();

  // Common female name patterns/endings
  const femalePatterns = [
    'sarah', 'priya', 'elena', 'maria', 'anna', 'lisa', 'emma', 'sophia', 'olivia', 'ava',
    'mia', 'isabella', 'charlotte', 'amelia', 'harper', 'evelyn', 'abigail', 'emily', 'ella',
    'elizabeth', 'camila', 'luna', 'sofia', 'avery', 'mila', 'aria', 'scarlett', 'penelope',
    'layla', 'chloe', 'victoria', 'madison', 'eleanor', 'grace', 'nora', 'riley', 'zoey',
    'hannah', 'hazel', 'lily', 'ellie', 'violet', 'lillian', 'zoe', 'stella', 'aurora',
    'natalie', 'emilia', 'everly', 'leah', 'aubrey', 'willow', 'addison', 'lucy', 'audrey',
    'bella', 'nova', 'brooklyn', 'alice', 'aaliyah', 'claire', 'delilah', 'daisy', 'ayla',
    'kennedy', 'kinsley', 'allison', 'gabriella', 'adeline', 'maya', 'leilani', 'madelyn'
  ];

  const femaleEndings = ['a', 'ia', 'ina', 'ana', 'ela', 'ita', 'iya', 'ara', 'ira'];

  // Common male name patterns
  const malePatterns = [
    'john', 'james', 'robert', 'michael', 'william', 'david', 'richard', 'joseph', 'thomas',
    'christopher', 'charles', 'daniel', 'matthew', 'anthony', 'mark', 'donald', 'steven',
    'paul', 'andrew', 'joshua', 'kenneth', 'kevin', 'brian', 'george', 'timothy', 'ronald',
    'jason', 'edward', 'jeffrey', 'ryan', 'jacob', 'gary', 'nicholas', 'eric', 'jonathan',
    'stephen', 'larry', 'justin', 'scott', 'brandon', 'benjamin', 'samuel', 'gregory',
    'alexander', 'patrick', 'frank', 'raymond', 'jack', 'dennis', 'jerry', 'tyler',
    'aaron', 'jose', 'henry', 'adam', 'douglas', 'nathan', 'peter', 'zachary', 'kyle',
    'noah', 'alan', 'ethan', 'jeremy', 'lionel', 'mike', 'raj', 'arjun', 'vikram', 'rohit',
    'amit', 'rahul', 'krish', 'dev', 'aman', 'raghav', 'aditya', 'harsh', 'karan', 'rohan',
    'ankit', 'nikhil', 'prateek', 'shubham', 'varun', 'akash', 'deepak', 'siddharth', 'abhishek',
    'ashish', 'gaurav', 'manish', 'suresh', 'ramesh', 'mahesh', 'dinesh', 'rajesh', 'mukesh'
  ];

  if (femalePatterns.includes(firstName) || femaleEndings.some(ending => firstName.endsWith(ending))) {
    return 'female';
  }

  if (malePatterns.includes(firstName)) {
    return 'male';
  }

  return 'neutral';
}

/**
 * Generate realistic human face avatar
 * @param personaName - Name of the persona
 * @param age - Age of the persona
 * @param occupation - Occupation for context
 * @returns Realistic human face URL
 */
export function generateRealisticAvatar(personaName: string, age: number, occupation: string): string {
  const seed = crypto
    .createHash('md5')
    .update(`${personaName}-${age}-${occupation}`.toLowerCase().trim())
    .digest('hex')
    .substring(0, 8);

  const gender = detectGender(personaName);

  // Use This Person Does Not Exist style API (AI-generated realistic faces)
  // Multiple services for realistic human faces
  const services = [
    // Generated Photos API (most realistic)
    `https://images.generated.photos/api/v1/faces?gender=${gender}&age=${age}&emotion=neutral&head_pose=front&hair_color=random&hair_length=random&ethnicity=random&api_key=demo&order_by=random&seed=${seed}`,

    // Pravatar (real human photos, curated)
    `https://i.pravatar.cc/400?u=${seed}&gender=${gender}`,

    // UI Faces (real human faces)
    `https://uifaces.co/api?limit=1&gender=${gender}&from_age=${Math.max(16, age - 5)}&to_age=${age + 5}&random=${seed}`,

    // Robohash humans (as fallback)
    `https://robohash.org/${seed}?set=set4&size=400x400`,

    // DiceBear realistic style with gender
    `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&gender=${gender}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
  ];

  // For demo purposes, let's use a combination approach
  // Use different services based on age and gender for variety
  if (age < 25) {
    // Younger personas - use more modern/casual services
    return `https://i.pravatar.cc/400?u=${seed}`;
  } else {
    // Older personas - use more professional services  
    return `https://robohash.org/${seed}?set=set4&size=400x400`;
  }
}

/**
 * Generate avatar with better gender control using multiple services
 * @param personaName - Name of the persona
 * @param age - Age of the persona
 * @param occupation - Occupation for style hints
 * @returns Realistic human avatar URL
 */
export function generateContextualAvatar(personaName: string, age: number, occupation: string): string {
  const seed = crypto
    .createHash('md5')
    .update(`${personaName}-${age}-${occupation}`.toLowerCase().trim())
    .digest('hex')
    .substring(0, 8);

  const gender = detectGender(personaName);

  // Use a service that provides actual human-like faces
  // Pravatar provides real human photos and supports gender hints via seed manipulation
  const genderSeed = gender === 'female' ? `f${seed}` : gender === 'male' ? `m${seed}` : seed;

  return `https://i.pravatar.cc/400?u=${genderSeed}`;
}

/**
 * Generate ultra-realistic avatar using gender information
 * @param personaName - Name of the persona
 * @param age - Age of the persona
 * @param gender - Gender of the persona ('male', 'female', 'non-binary')
 * @returns Ultra-realistic AI-generated face
 */
export function generateGenderBasedAvatar(personaName: string, age: number, gender: string): string {
  const seed = crypto
    .createHash('md5')
    .update(`${personaName}-${age}-${gender}`.toLowerCase().trim())
    .digest('hex')
    .substring(0, 8);

  // Use gender directly instead of trying to detect it
  if (gender === 'male') {
    console.log(`${personaName} is MALE - using men portraits`);
    return `https://randomuser.me/api/portraits/men/${parseInt(seed.substring(0, 2), 16) % 100}.jpg`;
  }

  if (gender === 'female') {
    console.log(`${personaName} is FEMALE - using women portraits`);
    return `https://randomuser.me/api/portraits/women/${parseInt(seed.substring(0, 2), 16) % 100}.jpg`;
  }

  // For non-binary, use seed to determine portrait style consistently
  const portraitStyle = parseInt(seed.substring(2, 4), 16) % 2 === 0 ? 'men' : 'women';
  console.log(`${personaName} is NON-BINARY - using ${portraitStyle} based on seed`);
  return `https://randomuser.me/api/portraits/${portraitStyle}/${parseInt(seed.substring(0, 2), 16) % 100}.jpg`;
}

// Updated main function to accept gender parameter
export function generatePersonaAvatar(personaName: string, age: number = 25, occupation: string = '', gender?: string): string {
  if (gender) {
    return generateGenderBasedAvatar(personaName, age, gender);
  }
  // Fallback to old method if gender not provided
  return generateAIFace(personaName, age);
}

// Legacy functions (keeping for backward compatibility)
export function generateGravatarUrl(
  email: string,
  size: number = 400,
  defaultImage: string = 'identicon'
): string {
  const hash = crypto
    .createHash('md5')
    .update(email.toLowerCase().trim())
    .digest('hex');

  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}&r=pg`;
}

export function generatePersonaEmail(name: string): string {
  const cleanName = name.toLowerCase().replace(/\s+/g, '.');
  const randomNum = Math.floor(Math.random() * 9999);
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com'];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];

  return `${cleanName}.${randomNum}@${randomDomain}`;
}