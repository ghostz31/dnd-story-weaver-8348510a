"use client";

import React, { useState } from 'react';
import MonsterBrowser from '@/components/MonsterBrowser';
import MonsterCard from '@/components/MonsterCard';
import { Monster } from '@/lib/types';

export default function MonstersPage() {
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Bibliothèque de Monstres</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Sélectionner un monstre</h2>
          <MonsterBrowser onSelectMonster={setSelectedMonster} isSelectable={true} />
        </div>
        
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Détails du monstre</h2>
          {selectedMonster ? (
            <div className="sticky top-4">
              <MonsterCard monster={selectedMonster} />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">Sélectionnez un monstre pour voir ses détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 