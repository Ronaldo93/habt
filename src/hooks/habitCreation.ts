import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

import { habitSchema } from '../../types/habit';
import { z } from 'zod';

export type HabitCreationData = z.infer<typeof habitSchema>;

export function useHabitCreation() {
  const createHabitMutation = useMutation(api.habits.create);
  
  const [formData, setFormData] = useState<HabitCreationData>({
    name: '',
    isGood: true,
    amountDone: 0,
    target: undefined,
    notes: '',
    duration: 0,
    status: 'active',
    unit: 'times', // default unit
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof HabitCreationData>(field: K, value: HabitCreationData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const submitHabit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await createHabitMutation(formData);
      // Reset form after successful submission
      setFormData({
        name: '',
        isGood: true,
        amountDone: 0,
        target: undefined,
        notes: '',
        duration: 0,
        status: 'active',
        unit: 'times',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create habit');
      throw err; // re-throw to allow callers to handle it if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    updateField,
    submitHabit,
    isSubmitting,
    error,
  };
}
