import { Mail, Phone, Globe, Building2, MapPin, Home, Users } from 'lucide-react';

interface IconLinkProps {
  type: 'email' | 'phone' | 'web' | 'idealista' | 'fuente';
  value: string;
  fuenteType?: string; // Para el tipo de fuente
}

const iconMap = {
  email: { icon: Mail, color: 'text-blue-400', title: 'Email' },
  phone: { icon: Phone, color: 'text-green-400', title: 'Teléfono' },
  web: { icon: Globe, color: 'text-cyan-400', title: 'Sitio web' },
  idealista: { icon: null, color: 'text-emerald-400', title: 'Perfil Idealista', isLogo: true },
};

const fuenteIcons: Record<string, { icon: any; color: string }> = {
  Idealista: { icon: Building2, color: 'text-purple-400' },
  'Google Maps': { icon: MapPin, color: 'text-red-400' },
  'Pisos.com': { icon: Home, color: 'text-orange-400' },
  Presencial: { icon: Users, color: 'text-teal-400' },
};

export function IconLink({ type, value, fuenteType }: IconLinkProps) {
  if (!value) return <span className="text-muted text-xs">-</span>;

  if (type === 'email') {
    const config = iconMap.email;
    const Icon = config.icon;
    return (
      <a
        href={`mailto:${value}`}
        className={`${config.color} hover:opacity-80 transition-opacity cursor-pointer`}
        title={`Email: ${value}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Icon size={16} />
      </a>
    );
  }

  if (type === 'phone') {
    const config = iconMap.phone;
    const Icon = config.icon;
    return (
      <a
        href={`tel:${value}`}
        className={`${config.color} hover:opacity-80 transition-opacity cursor-pointer`}
        title={`Teléfono: ${value}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Icon size={16} />
      </a>
    );
  }

  if (type === 'web') {
    const config = iconMap.web;
    const Icon = config.icon;
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className={`${config.color} hover:opacity-80 transition-opacity cursor-pointer`}
        title={`Sitio web: ${value}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Icon size={16} />
      </a>
    );
  }

  if (type === 'idealista') {
    if (!value) return <span className="text-muted text-xs">-</span>;
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center"
        title="Perfil Idealista"
        onClick={(e) => e.stopPropagation()}
      >
        <img src="/idealista-logo.png" alt="Idealista" width="16" height="16" className="object-contain" />
      </a>
    );
  }

  if (type === 'fuente' && fuenteType) {
    const config = fuenteIcons[fuenteType] || { icon: Users, color: 'text-gray-400' };
    const Icon = config.icon;
    return (
      <div
        className={`${config.color} flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs`}
        title={fuenteType}
      >
        <Icon size={12} />
        <span className="hidden sm:inline">{fuenteType}</span>
      </div>
    );
  }

  return <span className="text-muted text-xs">-</span>;
}
