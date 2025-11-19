import { Card, CardContent, CardHeader, CardTitle } from '@/elements/card';
import { Label } from '@/elements/label';
import { Textarea } from '@/elements/textarea';

interface TestSuiteDetailsCardProps {
  isEditing: boolean;
  description?: string;
  formData: { description: string };
  onDescriptionChange: (description: string) => void;
}

export function TestSuiteDetailsCard({
  isEditing,
  description,
  formData,
  onDescriptionChange,
}: TestSuiteDetailsCardProps) {
  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              variant="glass"
              value={formData.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={3}
              placeholder="Enter description"
            />
          </div>
        ) : (
          <>
            {description ? (
              <div>
                <h4 className="text-sm font-medium text-white/60 mb-1">
                  Description
                </h4>
                <p className="text-white/90 whitespace-pre-wrap">
                  {description}
                </p>
              </div>
            ) : (
              <p className="text-white/60 text-sm">No description provided</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
