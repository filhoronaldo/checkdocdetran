
import { initialServices } from "@/data/services";

/**
 * Generates SQL statements to insert the initial services data into the Supabase database.
 * Copy the output of this function and execute it in your Supabase SQL editor.
 */
export function generateInitialDataSQL(): string {
  let sql = '-- Insert initial services\n';
  
  initialServices.forEach(service => {
    // Insert service
    sql += `
-- Service: ${service.title}
INSERT INTO services (id, title, category, description)
VALUES ('${service.id}', '${service.title.replace(/'/g, "''")}', '${service.category}', '${service.description.replace(/'/g, "''")}');
`;

    // Insert checklists
    service.checklists.forEach(checklist => {
      sql += `
-- Checklist: ${checklist.title}
INSERT INTO checklists (id, service_id, title, is_optional, is_alternative)
VALUES ('${checklist.id}', '${service.id}', '${checklist.title.replace(/'/g, "''")}', ${checklist.isOptional ? 'TRUE' : 'FALSE'}, ${checklist.isAlternative ? 'TRUE' : 'FALSE'});
`;

      // Insert checklist items
      checklist.items.forEach(item => {
        const tagsArray = item.tags ? 
          `ARRAY[${item.tags.map(tag => `'${tag}'::tag_type`).join(', ')}]` : 
          'NULL';
          
        sql += `
-- Item: ${item.text}
INSERT INTO checklist_items (id, checklist_id, text, observation, tags, is_optional)
VALUES ('${item.id}', '${checklist.id}', '${item.text.replace(/'/g, "''")}', ${item.observation ? `'${item.observation.replace(/'/g, "''")}'` : 'NULL'}, ${tagsArray}, ${item.isOptional ? 'TRUE' : 'FALSE'});
`;
      });
    });
  });

  return sql;
}

/**
 * This function logs the SQL to the console so you can copy it to your Supabase SQL editor
 */
export function logInitialDataSQL(): void {
  console.log(generateInitialDataSQL());
}

export function apiUrl(): string {
  return 'https://supabase.caruarushoppingdetran.x10.mx';
}

export function anonKey(): string {
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.3avVbTOAiZFaID12gTciOloZeJlU--4SmuKHDi5McA0';
}
