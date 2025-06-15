
export const getTierColor = (tier: 'free' | 'pro' | 'elite') => {
  switch (tier) {
    case 'pro': return 'from-mint-green to-mint-green';
    case 'elite': return 'from-deep-blue to-mint-green';
    default: return 'from-gray-400 to-gray-500';
  }
};

export const getTierLabel = (tier: 'free' | 'pro' | 'elite') => {
  switch (tier) {
    case 'pro': return 'Dopamind Pro';
    case 'elite': return 'Dopamind Elite';
    default: return 'Free';
  }
};
