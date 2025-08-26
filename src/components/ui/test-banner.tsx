import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TestTube, ArrowLeft, Lightbulb, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TestBannerProps {
  title: string;
  description: string;
  originalPath?: string;
  features?: string[];
}

export const TestBanner: React.FC<TestBannerProps> = ({ 
  title, 
  description, 
  originalPath,
  features = []
}) => {
  return (
    <div className="mb-6">
      <Alert className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <TestTube className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Sparkles className="h-3 w-3 mr-1" />
                Version Test
              </Badge>
              <h3 className="font-semibold text-purple-900">{title}</h3>
            </div>
            
            <AlertDescription className="text-purple-700 mb-3">
              {description}
            </AlertDescription>
            
            {features.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Nouvelles fonctionnalités :</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-purple-200 text-purple-700">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {originalPath && (
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" className="text-purple-700 border-purple-200 hover:bg-purple-50" asChild>
                  <Link to={originalPath}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Version originale
                  </Link>
                </Button>
                <span className="text-sm text-purple-600">
                  Comparez avec la version actuelle
                </span>
              </div>
            )}
          </div>
        </div>
      </Alert>
    </div>
  );
}; 