import React from 'react';
import { Character } from '@shared/schema';

interface CharacterCardProps {
  character: Character;
  isSelected: boolean;
  onSelect: (character: Character) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  isSelected,
  onSelect
}) => {
  const getBorderClass = () => {
    if (isSelected) {
      switch (character.rarity) {
        case 'Common':
          return 'border-primary-light border-4';
        case 'Rare':
          return 'border-accent-light border-4';
        case 'Legendary':
          return 'border-secondary-light border-4';
        default:
          return 'border-primary-light border-4';
      }
    }
    return '';
  };

  const getRarityBadgeClass = () => {
    switch (character.rarity) {
      case 'Common':
        return 'bg-neutral-dark/70';
      case 'Rare':
        return 'bg-neutral-dark/70';
      case 'Legendary':
        return 'bg-accent/90';
      default:
        return 'bg-neutral-dark/70';
    }
  };

  return (
    <div 
      className={`game-card relative rounded-xl overflow-hidden cursor-pointer transition-all ${getBorderClass()}`}
      onClick={() => onSelect(character)}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-dark/80 z-10"></div>
      
      {/* Use a colorful background instead of an actual image */}
      <div 
        className="w-full aspect-square bg-gradient-to-br from-neutral-dark to-primary-dark flex justify-center items-center"
        style={{ 
          backgroundImage: `radial-gradient(circle, ${character.rarity === 'Legendary' ? '#4CC9F0' : character.rarity === 'Rare' ? '#5D3FD3' : '#4E5165'} 0%, rgba(42, 45, 62, 0.5) 70%)` 
        }}
      >
        <div className="text-white text-5xl font-bold opacity-20">
          {character.name.charAt(0)}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
        <div className="font-heading font-bold text-white">{character.name}</div>
        <div className="flex items-center text-xs">
          <div className="flex items-center mr-2">
            <i className="ri-sword-line text-secondary mr-1"></i>
            <span>{character.attack}</span>
          </div>
          <div className="flex items-center mr-2">
            <i className="ri-shield-line text-primary mr-1"></i>
            <span>{character.defense}</span>
          </div>
          <div className="flex items-center">
            <i className="ri-flashlight-line text-accent mr-1"></i>
            <span>{character.speed}</span>
          </div>
        </div>
      </div>
      <div className={`absolute top-2 right-2 ${getRarityBadgeClass()} rounded-full px-2 py-0.5 text-xs`}>
        {character.rarity}
      </div>
    </div>
  );
};

export default CharacterCard;
