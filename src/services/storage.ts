import type { UMLGeneration, UMLFeedback, UMLInteraction } from '../types/uml';

class LocalStorageService {
  private readonly GENERATIONS_KEY = 'uml_generations';
  private readonly FEEDBACK_KEY = 'uml_feedback';
  private readonly INTERACTIONS_KEY = 'uml_interactions';

  saveGeneration(generation: UMLGeneration): void {
    const generations = this.getGenerations();
    generations.push(generation);
    localStorage.setItem(this.GENERATIONS_KEY, JSON.stringify(generations));
  }

  getGenerations(): UMLGeneration[] {
    const data = localStorage.getItem(this.GENERATIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getGenerationById(id: string): UMLGeneration | undefined {
    return this.getGenerations().find(g => g.id === id);
  }

  saveFeedback(feedback: UMLFeedback): void {
    const allFeedback = this.getAllFeedback();
    allFeedback.push(feedback);
    localStorage.setItem(this.FEEDBACK_KEY, JSON.stringify(allFeedback));
  }

  getAllFeedback(): UMLFeedback[] {
    const data = localStorage.getItem(this.FEEDBACK_KEY);
    return data ? JSON.parse(data) : [];
  }

  getFeedbackForGeneration(generationId: string): UMLFeedback[] {
    return this.getAllFeedback().filter(f => f.generationId === generationId);
  }

  saveInteraction(interaction: UMLInteraction): void {
    const interactions = this.getInteractions();
    interactions.push(interaction);
    localStorage.setItem(this.INTERACTIONS_KEY, JSON.stringify(interactions));
  }

  getInteractions(): UMLInteraction[] {
    const data = localStorage.getItem(this.INTERACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getInteractionsForGeneration(generationId: string): UMLInteraction[] {
    return this.getInteractions().filter(i => i.generationId === generationId);
  }

  exportAllData() {
    return {
      generations: this.getGenerations(),
      feedback: this.getAllFeedback(),
      interactions: this.getInteractions(),
      exportedAt: new Date().toISOString()
    };
  }

  clearAllData(): void {
    localStorage.removeItem(this.GENERATIONS_KEY);
    localStorage.removeItem(this.FEEDBACK_KEY);
    localStorage.removeItem(this.INTERACTIONS_KEY);
  }
}

export const storageService = new LocalStorageService();
