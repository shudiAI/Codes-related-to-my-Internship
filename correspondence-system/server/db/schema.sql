CREATE TABLE IF NOT EXISTS government_entities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  english_name TEXT NOT NULL,
  arabic_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS department_names (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  government_entity_id INTEGER NOT NULL,
  english_name TEXT NOT NULL,
  arabic_name TEXT NOT NULL,
  FOREIGN KEY (government_entity_id) REFERENCES government_entities(id)
);

CREATE TABLE IF NOT EXISTS title_addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  department_name_id INTEGER NOT NULL,
  english_value TEXT NOT NULL,
  arabic_value TEXT NOT NULL,
  FOREIGN KEY (department_name_id) REFERENCES department_names(id)
);

CREATE TABLE IF NOT EXISTS government_affairs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_address_id INTEGER NOT NULL,
  english_name TEXT NOT NULL,
  arabic_name TEXT NOT NULL,
  FOREIGN KEY (title_address_id) REFERENCES title_addresses(id)
);

CREATE TABLE IF NOT EXISTS cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  province TEXT NOT NULL,
  english_name TEXT NOT NULL,
  arabic_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS translation_dictionary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  english_value TEXT NOT NULL UNIQUE,
  arabic_value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  placeholders_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  government_entity_id INTEGER NOT NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  project_type TEXT,
  work_method TEXT,
  project_description TEXT,
  status TEXT NOT NULL DEFAULT 'New',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (government_entity_id) REFERENCES government_entities(id)
);

CREATE TABLE IF NOT EXISTS correspondence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  correspondence_number TEXT NOT NULL UNIQUE,
  case_id INTEGER NOT NULL,
  project_description TEXT NOT NULL,
  government_affairs_id INTEGER NOT NULL,
  title_address_id INTEGER NOT NULL,
  department_name_id INTEGER NOT NULL,
  template_id INTEGER NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Immediate',
  confidentiality TEXT NOT NULL DEFAULT 'Restricted',
  sender TEXT NOT NULL DEFAULT '-',
  performer TEXT NOT NULL DEFAULT '-',
  status TEXT NOT NULL DEFAULT 'Draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id),
  FOREIGN KEY (government_affairs_id) REFERENCES government_affairs(id),
  FOREIGN KEY (title_address_id) REFERENCES title_addresses(id),
  FOREIGN KEY (department_name_id) REFERENCES department_names(id),
  FOREIGN KEY (template_id) REFERENCES templates(id)
);
