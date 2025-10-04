export type UMLType =
  | 'flowchart'
  | 'sequence'
  | 'class'
  | 'er'
  | 'state'
  | 'gantt'
  | 'pie'
  | 'journey'
  | 'git';

export interface UMLGeneration {
  id: string;
  userId?: string;
  prompt: string;
  generatedUml: string;
  umlType: UMLType;
  syntaxValid: boolean;
  validationErrors: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UMLFeedback {
  id: string;
  generationId: string;
  rating?: number;
  wasEdited: boolean;
  editedUml?: string;
  feedbackText?: string;
  feedbackType: 'positive' | 'negative' | 'neutral';
  createdAt: Date;
}

export interface UMLInteraction {
  id: string;
  generationId: string;
  actionType: 'view' | 'copy' | 'download' | 'delete' | 'regenerate' | 'edit_start' | 'edit_cancel' | 'edit_save';
  timeSpentSeconds?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
