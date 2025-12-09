export interface ValidationLog {
  type: "error" | "warning" | "info" | "success";
  message: string;
  line?: number;
  details?: string;
}

export interface ValidationResult {
  isValid: boolean;
  logs: ValidationLog[];
}

export function validateYAML(yamlContent: string): ValidationResult {
  const logs: ValidationLog[] = [];
  let isValid = true;

  logs.push({
    type: "info",
    message: "Iniciando validación YAML...",
    details: "Verificando estructura y sintaxis"
  });

  if (!yamlContent || yamlContent.trim() === "") {
    logs.push({
      type: "error",
      message: "El contenido YAML está vacío",
      details: "Por favor agregue contenido YAML válido"
    });
    return { isValid: false, logs };
  }

  const lines = yamlContent.split("\n");
  let hasOnSection = false;
  let hasJobsSection = false;
  const triggerNames: string[] = [];
  const jobNames: string[] = [];
  let currentSection = "";
  let indent = 0;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith("#") || trimmedLine === "") {
      return;
    }

    const currentIndent = line.search(/\S/);

    if (trimmedLine.startsWith("on:")) {
      hasOnSection = true;
      currentSection = "on";
      logs.push({
        type: "success",
        message: "Sección 'on' encontrada",
        line: index + 1,
        details: "Definición de triggers"
      });
    } else if (trimmedLine.startsWith("jobs:")) {
      hasJobsSection = true;
      currentSection = "jobs";
      logs.push({
        type: "success",
        message: "Sección 'jobs' encontrada",
        line: index + 1,
        details: "Definición de trabajos"
      });
    } else if (currentSection === "on" && currentIndent === 2 && !trimmedLine.startsWith("-")) {
      const triggerMatch = trimmedLine.match(/^([a-z_][a-z0-9_]*):/);
      if (triggerMatch) {
        const triggerName = triggerMatch[1];
        triggerNames.push(triggerName);
        
        const isValidName = /^[a-z_][a-z0-9_]*$/.test(triggerName);
        if (isValidName) {
          logs.push({
            type: "success",
            message: `Trigger '${triggerName}' encontrado`,
            line: index + 1,
            details: "Nombre válido en formato snake_case"
          });
        } else {
          logs.push({
            type: "error",
            message: `Trigger '${triggerName}' tiene nombre inválido`,
            line: index + 1,
            details: "Use formato snake_case (ej: mi_trigger)"
          });
          isValid = false;
        }
      }
    } else if (currentSection === "jobs" && currentIndent === 2) {
      const jobMatch = trimmedLine.match(/^([a-z_][a-z0-9_]*):/);
      if (jobMatch) {
        const jobName = jobMatch[1];
        jobNames.push(jobName);
        logs.push({
          type: "success",
          message: `Job '${jobName}' encontrado`,
          line: index + 1,
          details: "Definición de trabajo"
        });
      }
    }

    if (trimmedLine.includes("runs-on:")) {
      const runsOnMatch = trimmedLine.match(/runs-on:\s*(.+)/);
      if (runsOnMatch) {
        const value = runsOnMatch[1].trim();
        const validRunsOn = ["ubuntu-latest", "ubuntu-20.04", "ubuntu-18.04", "macos-latest", "windows-latest"];
        if (validRunsOn.includes(value)) {
          logs.push({
            type: "success",
            message: `runs-on válido: ${value}`,
            line: index + 1
          });
        } else {
          logs.push({
            type: "warning",
            message: `runs-on no reconocido: ${value}`,
            line: index + 1,
            details: `Valores recomendados: ${validRunsOn.join(", ")}`
          });
        }
      }
    }

    if (trimmedLine.includes("uses:")) {
      const usesMatch = trimmedLine.match(/uses:\s*(.+)/);
      if (usesMatch) {
        const action = usesMatch[1].trim();
        logs.push({
          type: "info",
          message: `Acción encontrada: ${action}`,
          line: index + 1,
          details: "Verificar que la acción existe en GitHub"
        });
      }
    }

    if (trimmedLine.includes("${{") && trimmedLine.includes("}}")) {
      const expressions = trimmedLine.match(/\$\{\{([^}]+)\}\}/g);
      if (expressions) {
        expressions.forEach(expr => {
          logs.push({
            type: "info",
            message: `Expresión encontrada: ${expr}`,
            line: index + 1,
            details: "Verificar que las variables y outputs existen"
          });
          
          const outputMatch = expr.match(/on\.([a-z_][a-z0-9_]*)\.outputs/);
          if (outputMatch) {
            const triggerRef = outputMatch[1];
            if (!triggerNames.includes(triggerRef)) {
              logs.push({
                type: "error",
                message: `Referencia a trigger inexistente: ${triggerRef}`,
                line: index + 1,
                details: `Triggers disponibles: ${triggerNames.join(", ")}`
              });
              isValid = false;
            } else {
              logs.push({
                type: "success",
                message: `Referencia válida a trigger: ${triggerRef}`,
                line: index + 1
              });
            }
          }
        });
      }
    }
  });

  if (!hasOnSection) {
    logs.push({
      type: "error",
      message: "Falta la sección 'on'",
      details: "Todo workflow debe definir al menos un trigger"
    });
    isValid = false;
  }

  if (!hasJobsSection) {
    logs.push({
      type: "warning",
      message: "Falta la sección 'jobs'",
      details: "Se recomienda definir al menos un job para ejecutar"
    });
  }

  if (triggerNames.length === 0 && hasOnSection) {
    logs.push({
      type: "error",
      message: "No se encontraron triggers en la sección 'on'",
      details: "Agregue al menos un trigger (rss, webhook, gmail, etc.)"
    });
    isValid = false;
  }

  if (jobNames.length === 0 && hasJobsSection) {
    logs.push({
      type: "warning",
      message: "No se encontraron jobs en la sección 'jobs'",
      details: "Agregue al menos un job con steps"
    });
  }

  triggerNames.forEach(trigger => {
    const referenced = yamlContent.includes(`on.${trigger}.outputs`) || yamlContent.includes(`on['${trigger}'].outputs`);
    if (!referenced && jobNames.length > 0) {
      logs.push({
        type: "warning",
        message: `Trigger '${trigger}' no es utilizado en ningún job`,
        details: "Considere usar los outputs del trigger en los steps"
      });
    }
  });

  if (isValid) {
    logs.push({
      type: "success",
      message: "✓ Validación completada exitosamente",
      details: `Encontrados ${triggerNames.length} triggers y ${jobNames.length} jobs`
    });
  } else {
    logs.push({
      type: "error",
      message: "✗ Validación fallida",
      details: "Corrija los errores antes de continuar"
    });
  }

  return { isValid, logs };
}
