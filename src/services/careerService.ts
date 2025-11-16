// services/careerService.ts

export interface CareerMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface CareerResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'course' | 'template';
  description: string;
  duration?: string;
  url: string;
}

// Réponses du chatbot pour l'aviation
const careerResponses: { [key: string]: string } = {
  'greeting': "Hello! I'm your Aviation Career Assistant. I can help you with:\n• Career path guidance\n• Interview preparation\n• CV optimization\n• Airline requirements\n• Training recommendations\n\nWhat would you like to know about your aviation career?",
  
  'cv tips': "Here are essential CV tips for aviation roles:\n\n📄 **CV Structure:**\n• Clear contact information\n• Professional summary\n• Work experience (most recent first)\n• Education & certifications\n• Skills & languages\n• References available upon request\n\n🎯 **Key Sections to Highlight:**\n• Customer service experience\n• Safety training\n• Language proficiencies\n• Emergency response skills\n• Teamwork examples\n\n💡 **Pro Tip:** Use action verbs like 'managed', 'coordinated', 'assisted', 'ensured'",
  
  'interview preparation': "**Aviation Interview Preparation Guide:**\n\n🎤 **Common Questions:**\n• \"Why do you want to be a flight attendant?\"\n• \"How do you handle difficult passengers?\"\n• \"What do you know about our airline?\"\n• \"Describe your customer service experience\"\n\n👔 **What to Wear:**\n• Business professional attire\n• Conservative colors (navy, black, gray)\n• Minimal jewelry and makeup\n• Well-groomed appearance\n\n📝 **Preparation Tips:**\n• Research the airline's values and routes\n• Practice the STAR method for behavioral questions\n• Prepare 3-5 questions to ask the interviewer",
  
  'airline requirements': "**Typical Airline Requirements:**\n\n📋 **Basic Requirements:**\n• High school diploma or equivalent\n• Minimum age: 18-21 years\n• Height: 5'2\" - 6'2\" (reach requirements)\n• Fluent in English + additional languages preferred\n• Valid passport\n\n🎓 **Preferred Qualifications:**\n• Customer service experience\n• CPR/First Aid certification\n• College degree (not always required)\n• Additional language fluency\n• Hospitality background\n\n💪 **Physical Requirements:**\n• Ability to lift 50+ pounds\n• Comfortable working at high altitudes\n• Ability to stand for long periods",
  
  'training programs': "**Aviation Training Programs:**\n\n✈️ **Essential Certifications:**\n• FAA/ EASA Safety Training\n• CPR & First Aid Certification\n• Emergency Evacuation Training\n• Water Survival Training\n• Self-Defense Training\n\n🏫 **Recommended Courses:**\n• Customer Service Excellence\n• Conflict Resolution\n• Cultural Awareness\n• Wine & Service Training\n• Language Courses\n\n💰 **Cost & Duration:**\n• Training typically 4-8 weeks\n• Costs: $3,000 - $8,000\n• Many airlines provide training after hiring",
  
  'career progression': "**Flight Attendant Career Path:**\n\n1. **Entry Level:** Flight Attendant (0-2 years)\n2. **Senior FA:** Lead cabin positions (2-5 years)\n3. **Purser:** Cabin manager role (5+ years)\n4. **Chief Purser:** Multiple cabin management\n5. **Inflight Supervisor:** Ground-based management\n6. **Training Instructor:** New hire training\n7. **Recruiter:** Hiring and selection\n\n⏱️ **Typical Timeline:**\n• Senior FA: 2-3 years\n• Purser: 5+ years\n• Management: 8+ years",
  
  'default': "I'd be happy to help with that! Could you provide more details about what specific aspect of aviation careers you're interested in? For example:\n• CV and application tips\n• Interview preparation\n• Airline requirements\n• Training programs\n• Career progression\n• Specific airline information\n\nWhat would you like to know more about?"
};

// Simuler une réponse AI
export const getCareerAdvice = async (userMessage: string): Promise<string> => {
  // Simuler un délai de traitement
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  const message = userMessage.toLowerCase();
  
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return careerResponses['greeting'];
  } else if (message.includes('cv') || message.includes('resume') || message.includes('application')) {
    return careerResponses['cv tips'];
  } else if (message.includes('interview') || message.includes('prepare')) {
    return careerResponses['interview preparation'];
  } else if (message.includes('requirement') || message.includes('qualif') || message.includes('need')) {
    return careerResponses['airline requirements'];
  } else if (message.includes('train') || message.includes('course') || message.includes('certif')) {
    return careerResponses['training programs'];
  } else if (message.includes('career') || message.includes('progress') || message.includes('promotion')) {
    return careerResponses['career progression'];
  } else {
    return careerResponses['default'];
  }
};

// Ressources de carrière
export const getCareerResources = (): CareerResource[] => [
  {
    id: '1',
    title: 'Aviation CV Template',
    type: 'template',
    description: 'Professional CV template optimized for airline applications',
    duration: '5 min',
    url: '#'
  },
  {
    id: '2',
    title: 'Flight Attendant Interview Guide',
    type: 'article',
    description: 'Complete guide to common interview questions and best answers',
    duration: '15 min',
    url: '#'
  },
  {
    id: '3',
    title: 'Airline Safety Procedures',
    type: 'video',
    description: 'Essential safety training and emergency procedures',
    duration: '30 min',
    url: '#'
  },
  {
    id: '4',
    title: 'Customer Service Excellence',
    type: 'course',
    description: 'Advanced customer service training for aviation professionals',
    duration: '2 hours',
    url: '#'
  }
];