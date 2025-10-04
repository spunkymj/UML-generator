import type { UMLType, ValidationResult } from '../types/uml';

export class UMLGenerator {
  static generateFromPrompt(prompt: string, umlType: UMLType): string {
    const lowerPrompt = prompt.toLowerCase();

    switch (umlType) {
      case 'flowchart':
        return this.generateFlowchart(prompt, lowerPrompt);
      case 'sequence':
        return this.generateSequence(prompt, lowerPrompt);
      case 'class':
        return this.generateClass(prompt, lowerPrompt);
      case 'er':
        return this.generateER(prompt, lowerPrompt);
      case 'state':
        return this.generateState(prompt, lowerPrompt);
      default:
        return this.generateFlowchart(prompt, lowerPrompt);
    }
  }

  private static generateFlowchart(prompt: string, lowerPrompt: string): string {
    const lines = ['flowchart TD'];

    const steps = prompt.match(/\d+\.\s*([^\n]+)/g) ||
                  prompt.match(/step\s*\d*:?\s*([^\n]+)/gi) ||
                  prompt.split(/[,;]/).filter(s => s.trim());

    if (steps.length > 0) {
      steps.forEach((step, idx) => {
        const cleanStep = step.replace(/^\d+\.\s*|^step\s*\d*:?\s*/i, '').trim();
        const nodeId = `step${idx + 1}`;
        const nextNodeId = `step${idx + 2}`;

        if (idx === 0) {
          lines.push(`    Start([Start]) --> ${nodeId}`);
        }

        if (cleanStep.match(/\b(if|when|check|decide|whether)\b/i)) {
          lines.push(`    ${nodeId}{${cleanStep}} -->|Yes| ${nextNodeId}`);
          lines.push(`    ${nodeId} -->|No| End([End])`);
        } else {
          lines.push(`    ${nodeId}[${cleanStep}]${idx < steps.length - 1 ? ` --> ${nextNodeId}` : ' --> End([End])'}`);
        }
      });
    } else {
      const words = prompt.split(' ').filter(w => w.length > 3);
      const key1 = words[0] || 'Process';
      const key2 = words[Math.floor(words.length / 2)] || 'Execute';
      const key3 = words[words.length - 1] || 'Complete';

      lines.push(`    Start([Start]) --> A[${key1}]`);
      lines.push(`    A --> B{${key2}?}`);
      lines.push(`    B -->|Yes| C[${key3}]`);
      lines.push(`    B -->|No| D[Alternative]`);
      lines.push(`    C --> End([End])`);
      lines.push(`    D --> End`);
    }

    return lines.join('\n');
  }

  private static generateSequence(prompt: string, lowerPrompt: string): string {
    const lines = ['sequenceDiagram'];

    const entities = this.extractEntities(prompt);
    const participants = entities.length > 0 ? entities : ['User', 'System', 'Database'];

    participants.forEach(p => {
      lines.push(`    participant ${p.replace(/\s+/g, '')}`);
    });

    const actions = prompt.match(/\d+\.\s*([^\n]+)/g) ||
                    prompt.split(/[,;]/).filter(s => s.trim());

    if (actions.length > 0) {
      actions.forEach((action, idx) => {
        const cleanAction = action.replace(/^\d+\.\s*/, '').trim();
        const from = participants[idx % participants.length].replace(/\s+/g, '');
        const to = participants[(idx + 1) % participants.length].replace(/\s+/g, '');
        lines.push(`    ${from}->>${to}: ${cleanAction}`);
      });
    } else {
      lines.push(`    ${participants[0].replace(/\s+/g, '')}->>${participants[1].replace(/\s+/g, '')}: ${prompt.slice(0, 50)}`);
      lines.push(`    ${participants[1].replace(/\s+/g, '')}-->>${participants[0].replace(/\s+/g, '')}: Response`);
    }

    return lines.join('\n');
  }

  private static generateClass(prompt: string, lowerPrompt: string): string {
    const lines = ['classDiagram'];

    const entities = this.extractEntities(prompt);
    const classes = entities.length > 0 ? entities : ['BaseClass', 'DerivedClass'];

    classes.forEach(className => {
      const cleanName = className.replace(/\s+/g, '');
      lines.push(`    class ${cleanName} {`);

      const attributes = this.extractAttributes(prompt, className);
      attributes.forEach(attr => {
        lines.push(`        +${attr}`);
      });

      if (attributes.length === 0) {
        lines.push(`        +id: string`);
        lines.push(`        +name: string`);
      }

      lines.push(`        +constructor()`);
      lines.push(`        +getData()`);
      lines.push(`    }`);
    });

    if (classes.length > 1) {
      for (let i = 0; i < classes.length - 1; i++) {
        const from = classes[i].replace(/\s+/g, '');
        const to = classes[i + 1].replace(/\s+/g, '');
        lines.push(`    ${from} <|-- ${to}`);
      }
    }

    return lines.join('\n');
  }

  private static generateER(prompt: string, lowerPrompt: string): string {
    const lines = ['erDiagram'];

    const entities = this.extractEntities(prompt);
    const tables = entities.length > 0 ? entities : ['User', 'Order', 'Product'];

    tables.forEach(table => {
      const cleanName = table.replace(/\s+/g, '');
      lines.push(`    ${cleanName} {`);

      const attributes = this.extractAttributes(prompt, table);
      if (attributes.length > 0) {
        attributes.forEach(attr => {
          lines.push(`        string ${attr}`);
        });
      } else {
        lines.push(`        string id PK`);
        lines.push(`        string name`);
        lines.push(`        date created_at`);
      }

      lines.push(`    }`);
    });

    if (tables.length > 1) {
      for (let i = 0; i < tables.length - 1; i++) {
        const from = tables[i].replace(/\s+/g, '');
        const to = tables[i + 1].replace(/\s+/g, '');
        lines.push(`    ${from} ||--o{ ${to} : "has"`);
      }
    }

    return lines.join('\n');
  }

  private static generateState(prompt: string, lowerPrompt: string): string {
    const lines = ['stateDiagram-v2'];

    const states = prompt.match(/\d+\.\s*([^\n]+)/g)?.map(s =>
      s.replace(/^\d+\.\s*/, '').trim()
    ) || ['Initial', 'Processing', 'Completed'];

    lines.push(`    [*] --> ${states[0].replace(/\s+/g, '')}`);

    for (let i = 0; i < states.length - 1; i++) {
      const from = states[i].replace(/\s+/g, '');
      const to = states[i + 1].replace(/\s+/g, '');
      lines.push(`    ${from} --> ${to}`);
    }

    lines.push(`    ${states[states.length - 1].replace(/\s+/g, '')} --> [*]`);

    return lines.join('\n');
  }

  private static extractEntities(text: string): string[] {
    const matches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
    const unique = [...new Set(matches)];
    return unique.slice(0, 5);
  }

  private static extractAttributes(text: string, entity: string): string[] {
    const words = text.toLowerCase().split(/\s+/);
    const commonAttrs = ['id', 'name', 'email', 'date', 'status', 'type', 'description', 'value', 'amount', 'price'];

    const found = words.filter(w =>
      commonAttrs.includes(w) ||
      w.endsWith('_id') ||
      w.endsWith('_at') ||
      w.endsWith('_name')
    );

    return [...new Set(found)].slice(0, 4);
  }

  static validateMermaidSyntax(mermaidCode: string): ValidationResult {
    const errors: string[] = [];

    if (!mermaidCode || mermaidCode.trim().length === 0) {
      errors.push('UML code cannot be empty');
      return { valid: false, errors };
    }

    const firstLine = mermaidCode.trim().split('\n')[0];
    const validTypes = [
      'flowchart', 'graph', 'sequenceDiagram', 'classDiagram',
      'stateDiagram', 'erDiagram', 'gantt', 'pie', 'journey', 'gitGraph'
    ];

    const hasValidType = validTypes.some(type => firstLine.includes(type));
    if (!hasValidType) {
      errors.push(`First line must specify diagram type (${validTypes.join(', ')})`);
    }

    const brackets = { '(': 0, ')': 0, '[': 0, ']': 0, '{': 0, '}': 0 };
    for (const char of mermaidCode) {
      if (char in brackets) {
        brackets[char as keyof typeof brackets]++;
      }
    }

    if (brackets['('] !== brackets[')']) {
      errors.push('Unmatched parentheses');
    }
    if (brackets['['] !== brackets[']']) {
      errors.push('Unmatched square brackets');
    }
    if (brackets['{'] !== brackets['}']) {
      errors.push('Unmatched curly braces');
    }

    const lines = mermaidCode.split('\n');
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed && idx > 0) {
        if (trimmed.match(/^[A-Z][a-z]+Diagram/) || trimmed.match(/^(graph|flowchart)/)) {
          errors.push(`Line ${idx + 1}: Diagram type should only appear on first line`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
