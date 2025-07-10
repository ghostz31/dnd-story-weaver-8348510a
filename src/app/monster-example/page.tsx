"use client";

import React from 'react';
import MonsterCard from '@/components/MonsterCard';
import { barlguraData } from '@/data/barlgura-example';

export default function MonsterExamplePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Exemple de Monstre - Barlgura</h1>
      <div className="max-w-5xl mx-auto">
        <MonsterCard monster={barlguraData} />
      </div>
    </div>
  );
} 