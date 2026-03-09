export type LearningModule = {
  title: string;
  lessons: number;
  duration: string;
};

export type NetworkingPageData = {
  brand: string;
  nav: string[];
  cta: string;
  breadcrumb: string;
  category: string;
  title: string;
  description: string;
  stats: {
    lessons: string;
    certification: string;
    level: string;
  };
  modules: LearningModule[];
  footerDescription: string;
  footerTopics: string[];
  footerResources: string[];
  legal: {
    copyright: string;
    links: string[];
  };
};

export const networkingPageData: NetworkingPageData = {
  brand: 'ChainLearn',
  nav: ['Home', 'Blockchain', 'Networking & 5G', 'Cybersecurity', 'Research & Patents'],
  cta: 'START LEARNING',
  breadcrumb: 'Back to Home',
  category: 'NETWORKING & 5G',
  title: 'Build the Connected World',
  description:
    'Master enterprise networking, BGP, MPLS, SDN, and 5G architecture. Learn how data flows across global networks and next-gen mobile infrastructure.',
  stats: {
    lessons: '78 Lessons',
    certification: '5G Certified',
    level: 'Advanced',
  },
  modules: [
    { title: 'BGP Routing & AS Relationships', lessons: 14, duration: '4 weeks' },
    { title: 'MPLS & Traffic Engineering', lessons: 12, duration: '4 weeks' },
    { title: 'Software-Defined Networking', lessons: 16, duration: '5 weeks' },
    { title: '5G NR Architecture', lessons: 18, duration: '6 weeks' },
    { title: 'Network Slicing', lessons: 10, duration: '3 weeks' },
    { title: 'mmWave Propagation', lessons: 8, duration: '3 weeks' },
  ],
  footerDescription:
    'Advanced technical education for the next generation of engineers and security researchers.',
  footerTopics: ['Blockchain', 'Networking & 5G', 'Cybersecurity', 'Research'],
  footerResources: ['Documentation', 'Community', 'Blog', 'Support'],
  legal: {
    copyright: '© 2026 ChainLearn. All rights reserved.',
    links: ['Privacy', 'Terms', 'Cookies'],
  },
};
