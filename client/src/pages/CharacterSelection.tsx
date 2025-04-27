import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CharacterCard from '@/components/CharacterCard';
import { Character, Move } from '@shared/schema';

const CharacterSelection: React.FC = () => {
  const [, navigate] = useLocation();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
  const { data: charactersData, isLoading: charactersLoading } = useQuery({
    queryKey: ['/api/characters'],
  });
  
  const { data: characterMovesData, isLoading: movesLoading } = useQuery({
    queryKey: ['/api/characters', selectedCharacter?.id, 'moves'],
    enabled: !!selectedCharacter,
  });
  
  const characters: Character[] = charactersData?.characters || [];
  const moves: Move[] = characterMovesData?.moves || [];
  
  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-dark to-neutral-mid">
      <Header />
      
      <main className="flex-grow p-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-2xl font-bold mb-4 text-center">Choose Your Fighter</h2>
          
          {charactersLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {characters.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  isSelected={selectedCharacter?.id === character.id}
                  onSelect={handleSelectCharacter}
                />
              ))}
            </div>
          )}
          
          <div className="bg-neutral-dark/60 rounded-xl p-4 mb-6">
            <h3 className="font-heading text-lg font-bold mb-2 text-white">Character Stats</h3>
            
            {!selectedCharacter ? (
              <div className="text-center py-4 text-neutral-light/70">
                Select a character to view their stats
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-neutral-dark rounded-lg p-3 text-center">
                    <div className="text-secondary text-xs mb-1">Attack</div>
                    <div className="text-white font-bold text-2xl">{selectedCharacter.attack}</div>
                  </div>
                  <div className="bg-neutral-dark rounded-lg p-3 text-center">
                    <div className="text-primary text-xs mb-1">Defense</div>
                    <div className="text-white font-bold text-2xl">{selectedCharacter.defense}</div>
                  </div>
                  <div className="bg-neutral-dark rounded-lg p-3 text-center">
                    <div className="text-accent text-xs mb-1">Speed</div>
                    <div className="text-white font-bold text-2xl">{selectedCharacter.speed}</div>
                  </div>
                </div>
                <div className="bg-neutral-dark rounded-lg p-3">
                  <div className="text-xs mb-1 text-neutral-light/70">Special Move</div>
                  <div className="text-white font-medium">{selectedCharacter.specialMove}</div>
                  <div className="text-xs text-neutral-light/70 mt-1">{selectedCharacter.specialMoveDescription}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <button 
              className="flex-1 bg-neutral-mid hover:bg-neutral-mid/80 text-white font-bold py-3 px-6 rounded-xl transition-all"
              onClick={() => navigate('/')}
            >
              Back
            </button>
            <button 
              className={`flex-1 bg-primary hover:bg-primary-light text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-primary/30 ${!selectedCharacter && 'opacity-50 cursor-not-allowed'}`}
              onClick={() => selectedCharacter && navigate('/find-opponent')}
              disabled={!selectedCharacter}
            >
              Continue
            </button>
          </div>
        </div>
      </main>
      
      <Footer navigateToFrame={(path) => navigate(path)} />
    </div>
  );
};

export default CharacterSelection;
